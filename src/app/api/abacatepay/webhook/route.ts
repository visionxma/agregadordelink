import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import type { AbacateWebhookEvent } from "@/lib/abacatepay";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

function verifySignature(body: string, sig: string | null): boolean {
  if (!webhookSecret || !sig) return false;
  const expected = createHmac("sha256", webhookSecret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

/** Descobre qual PlanTier bate com o productId do evento. */
function planFromProductId(productId?: string): PlanTier {
  if (!productId) return "pro";
  for (const [tier, cfg] of Object.entries(PLANS)) {
    if (cfg.abacateProductId === productId) return tier as PlanTier;
  }
  return "pro";
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("x-webhook-signature");

  if (!verifySignature(body, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: AbacateWebhookEvent;
  try {
    event = JSON.parse(body) as AbacateWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  console.log("[abacatepay webhook]", event.event, event.data?.id);

  try {
    const { data } = event;
    const userId = data.metadata?.userId;
    const productId = data.products?.[0]?.externalId;

    switch (event.event) {
      // Assinatura ativada após pagamento do primeiro mês
      case "billing.paid":
      case "subscription.completed":
      case "checkout.completed": {
        if (!userId) break;
        const plan = (data.metadata?.plan as PlanTier) ?? planFromProductId(productId);
        const customerId = data.customer?.id ?? data.customerId ?? null;
        const nextBilling = data.nextBillingDate
          ? new Date(data.nextBillingDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await upsertSubscription({
          userId,
          plan,
          gatewayCustomerId: customerId,
          gatewaySubscriptionId: data.id,
          gatewayProductId: productId ?? null,
          status: "active",
          currentPeriodEnd: nextBilling,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      // Renovação mensal
      case "billing.renewed":
      case "subscription.renewed": {
        if (!userId) break;
        const plan = (data.metadata?.plan as PlanTier) ?? planFromProductId(productId);
        const nextBilling = data.nextBillingDate
          ? new Date(data.nextBillingDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await upsertSubscription({
          userId,
          plan,
          gatewayCustomerId: data.customer?.id ?? data.customerId ?? null,
          gatewaySubscriptionId: data.id,
          gatewayProductId: productId ?? null,
          status: "active",
          currentPeriodEnd: nextBilling,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      // Assinatura cancelada — rebaixa para free
      case "billing.cancelled":
      case "subscription.cancelled": {
        if (!userId) break;
        await db
          .update(subscription)
          .set({
            plan: "free",
            status: "canceled",
            gatewaySubscriptionId: null,
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(subscription.userId, userId));
        break;
      }

      // Pagamento falhou — marca como past_due
      case "billing.failed":
      case "subscription.past_due": {
        if (!userId) break;
        await db
          .update(subscription)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      default:
        // Evento ignorado intencionalmente
        break;
    }
  } catch (err) {
    console.error("[abacatepay webhook] processing error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsertSubscription(data: {
  userId: string;
  plan: PlanTier;
  gatewayCustomerId: string | null;
  gatewaySubscriptionId: string;
  gatewayProductId: string | null;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) {
  const [existing] = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(eq(subscription.userId, data.userId))
    .limit(1);

  const values = {
    plan: data.plan,
    gatewayCustomerId: data.gatewayCustomerId,
    gatewaySubscriptionId: data.gatewaySubscriptionId,
    gatewayProductId: data.gatewayProductId,
    status: data.status,
    currentPeriodEnd: data.currentPeriodEnd,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(subscription)
      .set(values)
      .where(eq(subscription.userId, data.userId));
  } else {
    await db.insert(subscription).values({ userId: data.userId, ...values });
  }
}
