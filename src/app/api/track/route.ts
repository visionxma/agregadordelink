import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { event } from "@/lib/db/schema";

const schema = z.object({
  type: z.enum(["view", "click"]),
  pageId: z.string().min(1),
  blockId: z.string().min(1).optional(),
  utmSource: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? null;
  const referer = req.headers.get("referer") ?? null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  // Se UTM source foi enviado, usa ele com prefixo "utm:" pra distinguir do referrer HTTP
  // (a função detectTrafficSource decodifica isso na exibição)
  const utm = parsed.data.utmSource?.trim().toLowerCase();
  const finalReferrer = utm ? `utm:${utm}` : referer;

  await db.insert(event).values({
    pageId: parsed.data.pageId,
    blockId: parsed.data.blockId ?? null,
    type: parsed.data.type,
    userAgent: ua,
    referrer: finalReferrer,
    country,
    device: guessDevice(ua),
  });

  return NextResponse.json({ ok: true });
}

function guessDevice(ua: string | null): string | null {
  if (!ua) return null;
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}
