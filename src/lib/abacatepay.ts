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

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_V2}${path}`, {
      ...init,
      headers: { ...reqHeaders(), ...(init.headers as object) },
    });
  } catch (networkErr) {
    throw new Error(`Falha de rede: ${(networkErr as Error).message}`);
  }

  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* noop */ }

  console.log(`[AbacatePay] ${String(init.method)} ${path} → ${res.status}`, text.slice(0, 800));

  if (!res.ok) {
    const apiError = (json as Record<string, unknown> | null)?.error ?? text;
    throw new Error(`AbacatePay ${path} ${res.status}: ${apiError}`);
  }

  return ((json as Record<string, unknown>)?.data ?? json) as T;
}

// ─── Criar assinatura mensal ──────────────────────────────────────────────────

export async function createSubscription(params: {
  productId: string;   // ID do plano/produto no painel Abacate Pay (prod_...)
  userId: string;
  plan: string;
  completionUrl: string;
  returnUrl: string;
}): Promise<AbacateSubscription> {
  const body = {
    items: [{ id: params.productId, quantity: 1 }],
    completionUrl: params.completionUrl,
    returnUrl: params.returnUrl,
    metadata: { userId: params.userId, plan: params.plan },
  };

  console.log("[AbacatePay] createSubscription payload:", JSON.stringify(body));
  return apiFetch<AbacateSubscription>("/subscriptions/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Cancelar assinatura ──────────────────────────────────────────────────────

export async function cancelSubscriptionById(subscriptionId: string): Promise<void> {
  await apiFetch<unknown>("/subscriptions/cancel", {
    method: "POST",
    body: JSON.stringify({ id: subscriptionId }),
  });
}
