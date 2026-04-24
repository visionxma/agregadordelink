import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collabPresence } from "@/lib/db/schema";
import { resolvePageAccess } from "@/lib/collab-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const pageId = typeof body.pageId === "string" ? body.pageId : null;
  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });

  const access = await resolvePageAccess(pageId, session.user.id);
  if (!access) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const now = new Date();
  await db
    .insert(collabPresence)
    .values({ pageId, userId: session.user.id, lastSeen: now })
    .onConflictDoUpdate({
      target: [collabPresence.pageId, collabPresence.userId],
      set: { lastSeen: now },
    });

  return NextResponse.json({ ok: true });
}
