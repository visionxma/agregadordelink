import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block } from "@/lib/db/schema";
import { resolvePageAccess } from "@/lib/collab-auth";

export const dynamic = "force-dynamic";

async function loadBlockWithAccess(blockId: string, userId: string) {
  const [b] = await db
    .select()
    .from(block)
    .where(eq(block.id, blockId))
    .limit(1);
  if (!b) return null;
  const access = await resolvePageAccess(b.pageId, userId);
  if (!access || !access.canEdit) return null;
  return { block: b, access };
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const blockId = typeof body.blockId === "string" ? body.blockId : null;
  if (!blockId) return NextResponse.json({ error: "blockId required" }, { status: 400 });

  const ctx = await loadBlockWithAccess(blockId, session.user.id);
  if (!ctx) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db
    .update(block)
    .set({ lockedBy: session.user.id, lockedAt: new Date() })
    .where(eq(block.id, blockId));

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  if (!blockId) return NextResponse.json({ error: "blockId required" }, { status: 400 });

  const ctx = await loadBlockWithAccess(blockId, session.user.id);
  if (!ctx) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Só libera se o lock é nosso
  await db
    .update(block)
    .set({ lockedBy: null, lockedAt: null })
    .where(and(eq(block.id, blockId), eq(block.lockedBy, session.user.id)));

  return NextResponse.json({ ok: true });
}
