import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

export function getStripe(): Stripe | null {
  if (!stripeKey) return null;
  return new Stripe(stripeKey);
}

export function isStripeConfigured(): boolean {
  return !!stripeKey;
}
