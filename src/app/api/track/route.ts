import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { event } from "@/lib/db/schema";

const schema = z.object({
  type: z.enum(["view", "click"]),
  pageId: z.string().min(1),
  blockId: z.string().min(1).optional(),
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

  await db.insert(event).values({
    pageId: parsed.data.pageId,
    blockId: parsed.data.blockId ?? null,
    type: parsed.data.type,
    userAgent: ua,
    referrer: referer,
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
