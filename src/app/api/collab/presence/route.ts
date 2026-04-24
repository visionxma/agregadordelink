import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  block,
  collabPresence,
  user as userTable,
} from "@/lib/db/schema";
import { resolvePageAccess } from "@/lib/collab-auth";

export const dynamic = "force-dynamic";

// Janela de "online": último heartbeat até 30s atrás
const PRESENCE_WINDOW_MS = 30_000;
// Lock: 30s de soft-lock
const LOCK_WINDOW_MS = 30_000;

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");
  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });

  const access = await resolvePageAccess(pageId, session.user.id);
  if (!access) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const cutoff = new Date(Date.now() - PRESENCE_WINDOW_MS);
  const lockCutoff = new Date(Date.now() - LOCK_WINDOW_MS);

  const online = await db
    .select({
      userId: collabPresence.userId,
      lastSeen: collabPresence.lastSeen,
      name: userTable.name,
      avatarUrl: userTable.image,
    })
    .from(collabPresence)
    .innerJoin(userTable, eq(collabPresence.userId, userTable.id))
    .where(
      and(
        eq(collabPresence.pageId, pageId),
        gte(collabPresence.lastSeen, cutoff)
      )
    );

  const locks = await db
    .select({
      blockId: block.id,
      lockedBy: block.lockedBy,
      lockedAt: block.lockedAt,
    })
    .from(block)
    .where(
      and(
        eq(block.pageId, pageId),
        isNotNull(block.lockedBy),
        gte(block.lockedAt, lockCutoff)
      )
    );

  return NextResponse.json({
    online: online.map((o) => ({
      userId: o.userId,
      name: o.name,
      avatarUrl: o.avatarUrl,
      lastSeen: o.lastSeen,
    })),
    locks: locks.map((l) => ({
      blockId: l.blockId,
      userId: l.lockedBy,
      lockedAt: l.lockedAt,
    })),
  });
}
