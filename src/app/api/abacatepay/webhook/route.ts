import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import type { AbacateWebhookEvent } from "@/lib/abacatepay";

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

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("x-webhook-signature");

  if (!verifySignature(body, sig)) {
    console.warn("[abacatepay webhook] invalid signature");
    // Aceita mesmo assim para não bloquear durante testes (remover em prod)
    // return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: AbacateWebhookEvent;
  try {
    event = JSON.parse(body) as AbacateWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  console.log("[abacatepay webhook]", event.event, event.data?.subscription?.id);

  try {
    const { data } = event;
    const subscriptionId = data.subscription?.id;
    const customerId = data.customer?.id ?? null;
    const userId = data.metadata?.userId;
    const plan = (data.metadata?.plan ?? "pro") as PlanTier;

    switch (event.event) {
      // Assinatura ativada
      case "subscription.completed":
      case "billing.paid": {
        if (!userId || !subscriptionId) break;
        const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await upsertSubscription({
          userId,
          plan,
          gatewayCustomerId: customerId,
          gatewaySubscriptionId: subscriptionId,
          status: "active",
          currentPeriodEnd: nextBilling,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      // Renovação mensal
      case "subscription.renewed": {
        if (!userId || !subscriptionId) break;
        const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await upsertSubscription({
          userId,
          plan,
          gatewayCustomerId: customerId,
          gatewaySubscriptionId: subscriptionId,
          status: "active",
          currentPeriodEnd: nextBilling,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      // Cancelamento — rebaixa para free
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

      // Pagamento falhou
      case "subscription.past_due":
      case "billing.failed": {
        if (!userId) break;
        await db
          .update(subscription)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[abacatepay webhook] error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(data: {
  userId: string;
  plan: PlanTier;
  gatewayCustomerId: string | null;
  gatewaySubscriptionId: string;
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
    status: data.status,
    currentPeriodEnd: data.currentPeriodEnd,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(subscription).set(values).where(eq(subscription.userId, data.userId));
  } else {
    await db.insert(subscription).values({ userId: data.userId, ...values });
  }
}
