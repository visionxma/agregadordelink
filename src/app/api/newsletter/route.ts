import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsletterSubscriber } from "@/lib/db/schema";

const schema = z.object({
  pageId: z.string().min(1),
  blockId: z.string().optional(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    await db.insert(newsletterSubscriber).values({
      pageId: parsed.data.pageId,
      blockId: parsed.data.blockId ?? null,
      email: parsed.data.email.toLowerCase(),
    });
  } catch {
    // Silencioso se duplicate — já tá inscrito
  }

  return NextResponse.json({ ok: true });
}
