import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { shortLink } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const normalized = code.toLowerCase();

  const [link] = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.code, normalized))
    .limit(1);

  if (!link) {
    return NextResponse.redirect(new URL("/not-found", _req.url));
  }

  // Incrementa clicks (fire-and-forget OK, mas await é seguro)
  await db
    .update(shortLink)
    .set({ clicks: sql`${shortLink.clicks} + 1` })
    .where(eq(shortLink.id, link.id));

  return NextResponse.redirect(link.url, 302);
}
