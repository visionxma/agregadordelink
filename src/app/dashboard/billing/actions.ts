"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

function baseUrl() {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export async function createCheckoutSession(plan: PlanTier) {
  if (!isStripeConfigured()) {
    return { error: "Billing não configurado. Avise o admin." };
  }
  if (plan === "free") {
    return { error: "Plano free não precisa de checkout." };
  }

  const user = await requireUser();
  const planConfig = PLANS[plan];
  if (!planConfig.stripePriceId) {
    return { error: `Price ID não configurado pro plano ${plan}.` };
  }

  const stripe = getStripe()!;

  // Verifica se já tem customer
  const [existingSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  let customerId = existingSub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl()}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl()}/dashboard/billing?canceled=1`,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });

  if (!session.url) return { error: "Erro ao criar checkout" };
  redirect(session.url);
}

export async function createPortalSession() {
  if (!isStripeConfigured()) {
    return { error: "Billing não configurado." };
  }
  const user = await requireUser();
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);
  if (!sub?.stripeCustomerId) {
    return { error: "Você ainda não tem uma assinatura." };
  }

  const stripe = getStripe()!;
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${baseUrl()}/dashboard/billing`,
  });
  redirect(session.url);
}
