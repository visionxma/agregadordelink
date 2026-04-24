"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import {
  isAbacatePayConfigured,
  createSubscription,
  cancelSubscriptionById,
} from "@/lib/abacatepay";
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

export async function createCheckoutSession(plan: PlanTier) {
  if (!isAbacatePayConfigured()) {
    return { error: "Pagamentos não configurados. Avise o administrador." };
  }
  if (plan === "free") {
    return { error: "Plano free não precisa de checkout." };
  }

  const user = await requireUser();
  const planConfig = PLANS[plan];
  if (!planConfig.abacateProductId) {
    return { error: `Produto não configurado para o plano ${plan}.` };
  }

  // Cria a subscription sem customerId — usuário preenche dados no checkout
  const billing = await createSubscription({
    productId: planConfig.abacateProductId,
    userId: user.id,
    plan,
    completionUrl: `${appUrl()}/dashboard/billing?success=1`,
    returnUrl: `${appUrl()}/dashboard/billing`,
  });

  // Garante que existe um registro na tabela
  const [existingSub] = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  if (!existingSub) {
    await db.insert(subscription).values({
      userId: user.id,
      plan: "free",
      gatewaySubscriptionId: billing.id,
      status: "pending",
    });
  } else {
    await db
      .update(subscription)
      .set({ gatewaySubscriptionId: billing.id, status: "pending", updatedAt: new Date() })
      .where(eq(subscription.userId, user.id));
  }

  redirect(billing.url);
}

// ─── Cancelar assinatura ──────────────────────────────────────────────────────

export async function cancelSubscription() {
  if (!isAbacatePayConfigured()) {
    return { error: "Pagamentos não configurados." };
  }

  const user = await requireUser();
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  if (!sub?.gatewaySubscriptionId) {
    return { error: "Nenhuma assinatura ativa encontrada." };
  }

  try {
    await cancelSubscriptionById(sub.gatewaySubscriptionId);
  } catch (err) {
    console.error("[cancelSubscription] abacatepay error:", err);
  }

  await db
    .update(subscription)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscription.userId, user.id));

  return { ok: true as const };
}
