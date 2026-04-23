import type { PlanTier } from "@/lib/db/schema";

export type PlanConfig = {
  id: PlanTier;
  name: string;
  price: number; // em centavos, BRL
  priceDisplay: string;
  description: string;
  stripePriceId?: string; // configurar via env
  features: string[];
  limits: {
    pages: number;
    customDomain: boolean;
    analyticsRetentionDays: number;
    aiGenerations: number;
    removeBranding: boolean;
  };
  highlight?: boolean;
};

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceDisplay: "Grátis",
    description: "Pra começar e validar.",
    features: [
      "1 página",
      "Todos os 24 temas",
      "50+ modelos",
      "Analytics básico (7 dias)",
      "Subdomínio linkbiobr.com",
    ],
    limits: {
      pages: 1,
      customDomain: false,
      analyticsRetentionDays: 7,
      aiGenerations: 3,
      removeBranding: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 2900,
    priceDisplay: "R$ 29/mês",
    description: "Pra criadores que querem crescer.",
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "3 páginas",
      "Domínio próprio",
      "Analytics avançado (90 dias)",
      "Remover branding LinkBio BR",
      "Encurtador ilimitado",
      "IA (50 gerações/mês)",
      "Suporte prioritário",
    ],
    limits: {
      pages: 3,
      customDomain: true,
      analyticsRetentionDays: 90,
      aiGenerations: 50,
      removeBranding: true,
    },
    highlight: true,
  },
  business: {
    id: "business",
    name: "Business",
    price: 7900,
    priceDisplay: "R$ 79/mês",
    description: "Pra negócios e agências.",
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS,
    features: [
      "10 páginas",
      "Domínio próprio",
      "Analytics completo (1 ano)",
      "Remover branding",
      "IA ilimitada",
      "White-label",
      "API pública",
      "Suporte dedicado",
    ],
    limits: {
      pages: 10,
      customDomain: true,
      analyticsRetentionDays: 365,
      aiGenerations: -1, // ilimitado
      removeBranding: true,
    },
  },
};

export function getPlan(tier: PlanTier): PlanConfig {
  return PLANS[tier];
}

export const PLAN_LIST = Object.values(PLANS);
