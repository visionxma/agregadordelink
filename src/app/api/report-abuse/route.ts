import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { abuseReport } from "@/lib/db/schema";

const schema = z.object({
  pageId: z.string().min(1),
  pageSlug: z.string().optional(),
  reason: z.enum([
    "spam",
    "phishing",
    "adult",
    "violence",
    "copyright",
    "hate",
    "other",
  ]),
  description: z.string().max(500).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await db.insert(abuseReport).values({
    pageId: parsed.data.pageId,
    reason: parsed.data.reason,
    description: parsed.data.description ?? null,
    reporterEmail: parsed.data.email || null,
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
