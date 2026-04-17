import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { subscription, type PlanTier } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `bad signature: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId;
        const plan = (s.metadata?.plan ?? "pro") as PlanTier;
        if (!userId) break;
        const subId =
          typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        const customerId =
          typeof s.customer === "string" ? s.customer : s.customer?.id;
        if (subId) {
          const stripeSub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription({
            userId,
            plan,
            stripeCustomerId: customerId ?? null,
            stripeSubscriptionId: subId,
            stripePriceId: stripeSub.items.data[0]?.price.id ?? null,
            status: stripeSub.status,
            currentPeriodEnd: stripePeriodEnd(stripeSub),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plan = (sub.metadata?.plan ?? "pro") as PlanTier;
        if (!userId) break;
        await upsertSubscription({
          userId,
          plan,
          stripeCustomerId:
            typeof sub.customer === "string"
              ? sub.customer
              : sub.customer.id,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id ?? null,
          status: sub.status,
          currentPeriodEnd: stripePeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await db
          .update(subscription)
          .set({
            plan: "free",
            status: "canceled",
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(subscription.userId, userId));
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

function stripePeriodEnd(sub: Stripe.Subscription): Date {
  // Stripe moveu current_period_end pra subscription items em API recente.
  // Mantemos fallback pro campo top-level caso o SDK exponha.
  const fromItem = sub.items.data[0]?.current_period_end;
  const topLevel = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  const ts = fromItem ?? topLevel ?? Math.floor(Date.now() / 1000);
  return new Date(ts * 1000);
}

async function upsertSubscription(data: {
  userId: string;
  plan: PlanTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) {
  const [existing] = await db
    .select({ id: subscription.id })
    .from(subscription)
    .where(eq(subscription.userId, data.userId))
    .limit(1);

  if (existing) {
    await db
      .update(subscription)
      .set({
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscription.userId, data.userId));
  } else {
    await db.insert(subscription).values({
      userId: data.userId,
      plan: data.plan,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    });
  }
}
