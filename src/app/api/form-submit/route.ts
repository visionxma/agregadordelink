import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { formSubmission } from "@/lib/db/schema";

const schema = z.object({
  pageId: z.string().min(1),
  blockId: z.string().min(1),
  data: z.record(z.string(), z.string().max(5000)),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await db.insert(formSubmission).values({
    pageId: parsed.data.pageId,
    blockId: parsed.data.blockId,
    data: parsed.data.data,
  });

  return NextResponse.json({ ok: true });
}
