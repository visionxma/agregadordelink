import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { page } from "@/lib/db/schema";
import { getRealtimeCount } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }

  const pageId = req.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.json({ error: "missing pageId" }, { status: 400 });
  }

  // Confere ownership
  const [row] = await db
    .select({ id: page.id })
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, session.user.id)))
    .limit(1);
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const count = await getRealtimeCount(pageId);
  return NextResponse.json({ count });
}
