import type { PlanTier } from "@/lib/db/schema";

export type PlanLimits = {
  pages: number;               // -1 = ilimitado
  blocksPerPage: number;       // -1 = ilimitado
  customDomains: number;       // 0 = nenhum
  analyticsRetentionDays: number;
  aiGenerations: number;       // -1 = ilimitado
  shortLinks: number;          // -1 = ilimitado
  qrCodes: number;             // -1 = ilimitado
  formResponsesPerMonth: number; // -1 = ilimitado
  newsletterSubscribers: number; // -1 = ilimitado
  removeBranding: boolean;
  customCss: boolean;
  customJs: boolean;
  pixelIntegrations: boolean;  // Meta Pixel, GA4, TikTok
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaborators: number;   // 0 = indisponível, -1 = ilimitado
};

export type PlanConfig = {
  id: PlanTier;
  name: string;
  price: number; // em centavos, BRL
  priceDisplay: string;
  description: string;
  badge?: string;
  abacateProductId?: string; // externalId do produto no Abacate Pay dashboard
  features: string[];
  notIncluded?: string[];
  limits: PlanLimits;
  highlight?: boolean;
};

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceDisplay: "Grátis",
    description: "Pra começar sem gastar nada.",
    features: [
      "1 página linkbiobr.com",
      "Até 10 blocos por página",
      "24 temas + 50 modelos",
      "Analytics 7 dias",
      "5 links encurtados",
      "3 QR Codes",
      "3 gerações de IA/mês",
    ],
    notIncluded: [
      "Domínio próprio",
      "Remover branding LinkBio BR",
      "Meta Pixel / GA4",
      "CSS personalizado",
    ],
    limits: {
      pages: 1,
      blocksPerPage: 10,
      customDomains: 0,
      analyticsRetentionDays: 7,
      aiGenerations: 3,
      shortLinks: 5,
      qrCodes: 3,
      formResponsesPerMonth: 50,
      newsletterSubscribers: 100,
      removeBranding: false,
      customCss: false,
      customJs: false,
      pixelIntegrations: false,
      apiAccess: false,
      whiteLabel: false,
      teamCollaborators: 0,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: 2900,
    priceDisplay: "R$ 29/mês",
    description: "Pra criadores que querem crescer de verdade.",
    badge: "Popular",
    abacateProductId: process.env.ABACATEPAY_PRODUCT_PRO,
    features: [
      "5 páginas",
      "Blocos ilimitados",
      "1 domínio próprio",
      "Analytics 90 dias (país, device, fonte)",
      "Links encurtados ilimitados",
      "QR Codes ilimitados + cor personalizada",
      "100 gerações de IA/mês",
      "Formulários ilimitados",
      "Newsletter ilimitada",
      "Meta Pixel, GA4, TikTok Pixel",
      "CSS personalizado",
      "Remover branding LinkBio BR",
      "Até 3 colaboradores por página",
      "Suporte por email",
    ],
    limits: {
      pages: 5,
      blocksPerPage: -1,
      customDomains: 1,
      analyticsRetentionDays: 90,
      aiGenerations: 100,
      shortLinks: -1,
      qrCodes: -1,
      formResponsesPerMonth: -1,
      newsletterSubscribers: -1,
      removeBranding: true,
      customCss: true,
      customJs: false,
      pixelIntegrations: true,
      apiAccess: false,
      whiteLabel: false,
      teamCollaborators: 3,
    },
    highlight: true,
  },

  business: {
    id: "business",
    name: "Business",
    price: 7900,
    priceDisplay: "R$ 79/mês",
    description: "Pra negócios, agências e quem quer o controle total.",
    abacateProductId: process.env.ABACATEPAY_PRODUCT_BUSINESS,
    features: [
      "Páginas ilimitadas",
      "Blocos ilimitados",
      "Até 5 domínios próprios",
      "Analytics 1 ano + exportar CSV",
      "Tudo do Pro",
      "IA ilimitada",
      "CSS + JS personalizado",
      "API REST pública",
      "White-label completo",
      "Colaboradores ilimitados por página",
      "Suporte prioritário",
    ],
    limits: {
      pages: -1,
      blocksPerPage: -1,
      customDomains: 5,
      analyticsRetentionDays: 365,
      aiGenerations: -1,
      shortLinks: -1,
      qrCodes: -1,
      formResponsesPerMonth: -1,
      newsletterSubscribers: -1,
      removeBranding: true,
      customCss: true,
      customJs: true,
      pixelIntegrations: true,
      apiAccess: true,
      whiteLabel: true,
      teamCollaborators: -1,
    },
  },
};

export function getPlan(tier: PlanTier): PlanConfig {
  return PLANS[tier];
}

/**
 * Retorna o plano efetivo considerando trial ativo.
 * Trial expirado → rebaixa para free.
 */
export function getEffectivePlan(sub: {
  plan: PlanTier;
  status: string | null;
  trialEndsAt: Date | null;
} | null | undefined): PlanConfig {
  if (!sub) return PLANS.free;
  if (sub.status === "trial") {
    if (sub.trialEndsAt && sub.trialEndsAt > new Date()) return PLANS[sub.plan];
    return PLANS.free; // trial expirado
  }
  if (sub.status === "active") return PLANS[sub.plan];
  return PLANS.free;
}

export function isTrialActive(sub: { status: string | null; trialEndsAt: Date | null } | null | undefined): boolean {
  return sub?.status === "trial" && !!sub.trialEndsAt && sub.trialEndsAt > new Date();
}

export function trialDaysLeft(sub: { trialEndsAt: Date | null } | null | undefined): number {
  if (!sub?.trialEndsAt) return 0;
  return Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / 86_400_000));
}

export const PLAN_LIST = Object.values(PLANS);

/** Retorna true se o valor indica recurso ilimitado. */
export function isUnlimited(n: number) {
  return n === -1;
}

/** Formata um limite numérico para exibição ("Ilimitado" ou o número). */
export function fmtLimit(n: number) {
  return n === -1 ? "Ilimitado" : String(n);
}
