import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscriber, page } from "@/lib/db/schema";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { isUnlimited } from "@/lib/plans";

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

  // Descobre o dono da página para checar limites
  const [pg] = await db
    .select({ userId: page.userId })
    .from(page)
    .where(eq(page.id, parsed.data.pageId))
    .limit(1);

  if (pg) {
    const limits = await getUserPlanLimits(pg.userId);
    if (!isUnlimited(limits.newsletterSubscribers)) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(newsletterSubscriber)
        .where(eq(newsletterSubscriber.pageId, parsed.data.pageId));
      if (total >= limits.newsletterSubscribers) {
        return NextResponse.json({ error: "limit_reached" }, { status: 429 });
      }
    }
  }

  try {
    await db.insert(newsletterSubscriber).values({
      pageId: parsed.data.pageId,
      blockId: parsed.data.blockId ?? null,
      email: parsed.data.email.toLowerCase(),
    });
  } catch {
    // Silencioso se duplicate
  }

  return NextResponse.json({ ok: true });
}
