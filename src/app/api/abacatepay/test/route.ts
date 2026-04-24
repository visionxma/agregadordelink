import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Rota de diagnóstico — remover após resolver
export async function GET() {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) return NextResponse.json({ error: "sem API key" }, { status: 500 });

  const productPro = process.env.ABACATEPAY_PRODUCT_PRO;
  const productBusiness = process.env.ABACATEPAY_PRODUCT_BUSINESS;

  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  // Testa 3 endpoints diferentes para descobrir qual funciona
  const tests = await Promise.allSettled([
    fetch("https://api.abacatepay.com/v2/products", { headers }).then(async r => ({
      endpoint: "GET /v2/products",
      status: r.status,
      body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }),
    })),
    fetch(`https://api.abacatepay.com/v2/products/${productPro}`, { headers }).then(async r => ({
      endpoint: `GET /v2/products/${productPro}`,
      status: r.status,
      body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }),
    })),
    fetch("https://api.abacatepay.com/v1/products", { headers }).then(async r => ({
      endpoint: "GET /v1/products",
      status: r.status,
      body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }),
    })),
    // Testa checkout com produto
    fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: [{ id: productPro, quantity: 1 }],
        completionUrl: "https://linkbiobr.com",
        returnUrl: "https://linkbiobr.com",
      }),
    }).then(async r => ({
      endpoint: "POST /v2/checkouts/create (pro)",
      status: r.status,
      body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }),
    })),
  ]);

  return NextResponse.json({
    keyPrefix: key.slice(0, 12) + "...",
    productPro,
    productBusiness,
    results: tests.map(t => t.status === "fulfilled" ? t.value : { error: String((t as PromiseRejectedResult).reason) }),
  });
}
