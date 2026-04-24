const BASE = "https://api.abacatepay.com/v1";

function apiKey() {
  const k = process.env.ABACATEPAY_API_KEY;
  if (!k) throw new Error("ABACATEPAY_API_KEY não configurado");
  return k;
}

function reqHeaders() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
}

export function isAbacatePayConfigured() {
  return Boolean(process.env.ABACATEPAY_API_KEY);
}

// ─── Tipos de resposta ───────────────────────────────────────────────────────

export type AbacateCustomer = {
  id: string;
  metadata: { name: string; email: string };
};

export type AbacateBilling = {
  id: string;
  url: string;
  status: string;
};

export type AbacateWebhookEvent = {
  id: string;
  event: string;
  devMode: boolean;
  data: {
    id: string;
    status: string;
    amount: number;
    customer?: { id: string };
    customerId?: string;
    products?: { externalId: string }[];
    metadata?: Record<string, string>;
    nextBillingDate?: string;
    expiresAt?: string;
  };
};

// ─── Cliente ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...reqHeaders(), ...(init.headers as object) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`AbacatePay ${path} ${res.status}: ${JSON.stringify(json)}`);
  }
  return (json?.data ?? json) as T;
}

/** Cria um cliente no Abacate Pay. */
export async function createCustomer(params: {
  name: string;
  email: string;
}): Promise<AbacateCustomer> {
  return apiFetch<AbacateCustomer>("/customer/create", {
    method: "POST",
    body: JSON.stringify({
      metadata: { name: params.name, email: params.email },
    }),
  });
}

/** Cria um billing (assinatura mensal) e retorna a URL de pagamento. */
export async function createBilling(params: {
  productId: string;
  customerId: string;
  userId: string;
  plan: string;
  completionUrl: string;
  returnUrl: string;
}): Promise<AbacateBilling> {
  return apiFetch<AbacateBilling>("/billing/create", {
    method: "POST",
    body: JSON.stringify({
      frequency: "MONTHLY",
      methods: ["PIX", "CREDIT_CARD"],
      products: [{ externalId: params.productId, quantity: 1 }],
      customer: { id: params.customerId },
      metadata: { userId: params.userId, plan: params.plan },
      completionUrl: params.completionUrl,
      returnUrl: params.returnUrl,
    }),
  });
}

/** Cancela uma assinatura ativa. */
export async function cancelBilling(billingId: string): Promise<void> {
  await apiFetch<unknown>(`/billing/${billingId}/cancel`, { method: "DELETE" });
}
