"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import {
  isAbacatePayConfigured,
  createCustomer,
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

  // Busca ou cria subscription record + customer no Abacate Pay
  const [existingSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  let customerId = existingSub?.gatewayCustomerId ?? null;

  if (!customerId) {
    const customer = await createCustomer({
      name: user.name,
      email: user.email,
    });
    customerId = customer.id;

    // Salva o customerId antes de criar o checkout
    if (existingSub) {
      await db
        .update(subscription)
        .set({ gatewayCustomerId: customerId, updatedAt: new Date() })
        .where(eq(subscription.userId, user.id));
    } else {
      await db.insert(subscription).values({
        userId: user.id,
        plan: "free",
        gatewayCustomerId: customerId,
        status: "pending",
      });
    }
  }

  const billing = await createSubscription({
    productId: planConfig.abacateProductId,
    customerId,
    userId: user.id,
    plan,
    completionUrl: `${appUrl()}/dashboard/billing?success=1`,
    returnUrl: `${appUrl()}/dashboard/billing`,
  });

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
    // Mesmo com erro na API, marca cancelamento no DB
  }

  await db
    .update(subscription)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscription.userId, user.id));

  return { ok: true as const };
}
