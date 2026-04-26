"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import { isAbacatePayConfigured, createSubscription, cancelSubscriptionById } from "@/lib/abacatepay";
import { PLANS } from "@/lib/plans";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

function appUrl() {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

// ─── Assinar plano ────────────────────────────────────────────────────────────

export async function createCheckoutSession(
  plan: PlanTier
): Promise<{ url: string } | { error: string }> {
  if (!isAbacatePayConfigured()) {
    return { error: "Pagamentos não configurados. Avise o administrador." };
  }
  if (plan === "free") {
    return { error: "Plano free não precisa de checkout." };
  }

  const user = await requireUser();
  const planConfig = PLANS[plan];

  const productId = planConfig.abacateProductId;
  if (!productId) {
    return { error: `ID do produto não configurado para o plano ${plan}. Configure ABACATEPAY_PRODUCT_${plan.toUpperCase()} na Vercel.` };
  }

  console.log(`[billing] userId=${user.id} plan=${plan} productId=${productId}`);

  let billing: { id: string; url: string };
  try {
    billing = await createSubscription({
      productId,
      userId: user.id,
      plan,
      completionUrl: `${appUrl()}/dashboard/billing?success=1`,
      returnUrl: `${appUrl()}/dashboard/billing`,
    });
  } catch (err) {
    const msg = (err as Error).message ?? "Erro desconhecido";
    console.error("[billing] createSubscription falhou:", msg);
    return { error: msg };
  }

  if (!billing?.url) {
    console.error("[billing] sem url na resposta:", billing);
    return { error: "Gateway não retornou URL de pagamento." };
  }

  try {
    const [existing] = await db
      .select({ id: subscription.id })
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .limit(1);

    if (existing) {
      await db.update(subscription)
        .set({ gatewaySubscriptionId: billing.id, status: "pending", updatedAt: new Date() })
        .where(eq(subscription.userId, user.id));
    } else {
      await db.insert(subscription).values({
        userId: user.id,
        plan: "free",
        gatewaySubscriptionId: billing.id,
        status: "pending",
      });
    }
  } catch (dbErr) {
    console.error("[billing] erro DB (não bloqueia checkout):", dbErr);
  }

  return { url: billing.url };
}

// ─── Ativar trial gratuito ────────────────────────────────────────────────────

export async function startFreeTrial(
  plan: "pro" | "business"
): Promise<{ ok: true } | { error: string }> {
  const user = await requireUser();

  const [existing] = await db
    .select({ id: subscription.id, trialUsed: subscription.trialUsed, status: subscription.status })
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  if (existing?.trialUsed) {
    return { error: "Você já utilizou seu período de teste gratuito." };
  }
  if (existing?.status === "active") {
    return { error: "Você já possui uma assinatura ativa." };
  }

  const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  if (existing) {
    await db.update(subscription).set({
      plan,
      status: "trial",
      trialEndsAt,
      trialUsed: true,
      updatedAt: new Date(),
    }).where(eq(subscription.userId, user.id));
  } else {
    await db.insert(subscription).values({
      userId: user.id,
      plan,
      status: "trial",
      trialEndsAt,
      trialUsed: true,
    });
  }

  return { ok: true };
}

// ─── Cancelar assinatura ──────────────────────────────────────────────────────

export async function cancelSubscription(): Promise<{ ok: true } | { error: string }> {
  if (!isAbacatePayConfigured()) return { error: "Pagamentos não configurados." };

  const user = await requireUser();
  const [sub] = await db.select().from(subscription).where(eq(subscription.userId, user.id)).limit(1);

  if (!sub?.gatewaySubscriptionId) return { error: "Nenhuma assinatura ativa encontrada." };

  try {
    await cancelSubscriptionById(sub.gatewaySubscriptionId);
  } catch (err) {
    console.error("[billing] cancel error:", (err as Error).message);
  }

  await db.update(subscription)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscription.userId, user.id));

  return { ok: true };
}
