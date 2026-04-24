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
    subscription?: { id: string; amount: number; status: string; frequency: string };
    customer?: { id: string; name: string; email: string };
    payment?: { id: string; amount: number; status: string };
    metadata?: Record<string, string>;
  };
};

// ─── Helper interno ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  base: string,
  path: string,
  init: RequestInit
): Promise<T> {
  const url = `${base}${path}`;
  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      headers: { ...reqHeaders(), ...(init.headers as object) },
    });
  } catch (networkErr) {
    console.error(`[AbacatePay] network error ${path}:`, networkErr);
    throw new Error(`Falha de rede ao contatar Abacate Pay: ${(networkErr as Error).message}`);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  console.log(`[AbacatePay] ${init.method ?? "GET"} ${path} → ${res.status}`, JSON.stringify(json));

  if (!res.ok) {
    const apiError = (json as Record<string, unknown> | null)?.error ?? text;
    throw new Error(`AbacatePay ${path} ${res.status}: ${apiError}`);
  }

  return ((json as Record<string, unknown>)?.data ?? json) as T;
}

// ─── Criar assinatura (v2) ────────────────────────────────────────────────────

export async function createSubscription(params: {
  productId: string;
  customerId?: string;
  userId: string;
  plan: string;
  completionUrl: string;
  returnUrl: string;
}): Promise<AbacateSubscription> {
  const body: Record<string, unknown> = {
    items: [{ id: params.productId, quantity: 1 }],
    methods: ["PIX", "CARD"],
    completionUrl: params.completionUrl,
    returnUrl: params.returnUrl,
    metadata: { userId: params.userId, plan: params.plan },
  };
  if (params.customerId) body.customerId = params.customerId;

  console.log("[AbacatePay] createSubscription payload:", JSON.stringify(body));
  return apiFetch<AbacateSubscription>(BASE_V2, "/subscriptions/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Cancelar assinatura (v2) ─────────────────────────────────────────────────

export async function cancelSubscriptionById(subscriptionId: string): Promise<void> {
  await apiFetch<unknown>(BASE_V2, "/subscriptions/cancel", {
    method: "POST",
    body: JSON.stringify({ id: subscriptionId }),
  });
}

// ─── Criar cliente v1 (reservado para uso futuro) ─────────────────────────────

export async function createCustomer(params: {
  name: string;
  email: string;
  cellphone: string;
  taxId?: string;
}) {
  return apiFetch<{ id: string }>(BASE_V1, "/customer/create", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
