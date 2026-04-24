// Abacate Pay usa endpoints mistos: customer=v1, subscription=v2
const BASE_V1 = "https://api.abacatepay.com/v1";
const BASE_V2 = "https://api.abacatepay.com/v2";

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

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AbacateCustomer = {
  id: string;
  metadata: { name: string; email: string };
};

export type AbacateSubscription = {
  id: string;
  url: string;
  status: string;
  amount: number;
};

export type AbacateWebhookEvent = {
  id: string;
  event: string;
  apiVersion: number;
  devMode: boolean;
  data: {
    subscription?: {
      id: string;
      amount: number;
      status: string;
      frequency: string;
    };
    customer?: {
      id: string;
      name: string;
      email: string;
    };
    payment?: {
      id: string;
      amount: number;
      status: string;
    };
    metadata?: Record<string, string>;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(base: string, path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...reqHeaders(), ...(init.headers as object) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`AbacatePay ${path} ${res.status}: ${JSON.stringify(json)}`);
  }
  return (json?.data ?? json) as T;
}

// ─── API ─────────────────────────────────────────────────────────────────────

/** Cria um cliente (v1). Corpo é flat, sem wrapper metadata. */
export async function createCustomer(params: {
  name: string;
  email: string;
}): Promise<AbacateCustomer> {
  return apiFetch<AbacateCustomer>(BASE_V1, "/customer/create", {
    method: "POST",
    body: JSON.stringify({ name: params.name, email: params.email }),
  });
}

/** Cria uma assinatura mensal (v2). customerId é opcional. */
export async function createSubscription(params: {
  productId: string;   // ID do produto no Abacate Pay (prod_...)
  customerId?: string;
  userId: string;
  plan: string;
  completionUrl: string;
  returnUrl: string;
}): Promise<AbacateSubscription> {
  return apiFetch<AbacateSubscription>(BASE_V2, "/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({
      items: [{ id: params.productId, quantity: 1 }],
      methods: ["PIX", "CREDIT_CARD"],
      ...(params.customerId ? { customerId: params.customerId } : {}),
      completionUrl: params.completionUrl,
      returnUrl: params.returnUrl,
      metadata: { userId: params.userId, plan: params.plan },
    }),
  });
}

/** Cancela uma assinatura ativa (v2). */
export async function cancelSubscriptionById(subscriptionId: string): Promise<void> {
  await apiFetch<unknown>(BASE_V2, "/subscriptions/cancel", {
    method: "POST",
    body: JSON.stringify({ id: subscriptionId }),
  });
}
