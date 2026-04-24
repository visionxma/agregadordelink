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

  if (!planConfig.abacateProductId) {
    console.error(`[billing] abacateProductId não configurado para plano ${plan}`);
    return { error: `Produto não configurado para o plano ${plan}.` };
  }

  console.log(`[billing] criando subscription para userId=${user.id} plano=${plan} productId=${planConfig.abacateProductId}`);

  let billing: { id: string; url: string };
  try {
    billing = await createSubscription({
      productId: planConfig.abacateProductId,
      userId: user.id,
      plan,
      completionUrl: `${appUrl()}/dashboard/billing?success=1`,
      returnUrl: `${appUrl()}/dashboard/billing`,
    });
  } catch (err) {
    const msg = (err as Error).message ?? "Erro desconhecido";
    console.error("[billing] createSubscription falhou:", msg);
    return { error: `Erro ao criar checkout: ${msg}` };
  }

  if (!billing?.url) {
    console.error("[billing] Abacate Pay não retornou url:", billing);
    return { error: "Resposta inválida do gateway de pagamento." };
  }

  // Persiste o pending no banco
  try {
    const [existing] = await db
      .select({ id: subscription.id })
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .limit(1);

    if (existing) {
      await db
        .update(subscription)
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
    // Não bloqueia o checkout por erro de DB
    console.error("[billing] erro ao salvar pending no DB:", dbErr);
  }

  console.log(`[billing] redirecionando para ${billing.url}`);
  return { url: billing.url };
}

// ─── Cancelar assinatura ──────────────────────────────────────────────────────

export async function cancelSubscription(): Promise<{ ok: true } | { error: string }> {
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
    console.error("[billing] cancelSubscriptionById falhou:", (err as Error).message);
    // Não bloqueia — marca no DB de qualquer forma
  }

  await db
    .update(subscription)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscription.userId, user.id));

  return { ok: true };
}
