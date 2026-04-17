import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { and, asc, eq, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { event, page } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }

  const pageId = req.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.json({ error: "missing pageId" }, { status: 400 });
  }

  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, session.user.id)))
    .limit(1);
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const events = await db
    .select()
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .orderBy(asc(event.createdAt));

  const rows = [
    ["type", "blockId", "referrer", "country", "device", "userAgent", "createdAt"],
    ...events.map((e) => [
      e.type,
      e.blockId ?? "",
      csvEscape(e.referrer ?? ""),
      e.country ?? "",
      e.device ?? "",
      csvEscape(e.userAgent ?? ""),
      e.createdAt.toISOString(),
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");

  const filename = `analytics-${p.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function csvEscape(value: string): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
