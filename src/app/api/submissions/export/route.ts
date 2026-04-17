import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formSubmission,
  newsletterSubscriber,
  page,
} from "@/lib/db/schema";

function csvEscape(v: string): string {
  if (!v) return "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }

  const pageId = req.nextUrl.searchParams.get("pageId");
  const type = req.nextUrl.searchParams.get("type"); // "form" | "newsletter"
  const blockId = req.nextUrl.searchParams.get("blockId");

  if (!pageId || !type) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, session.user.id)))
    .limit(1);
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });

  let csv = "";
  let filename = "";

  if (type === "newsletter") {
    const rows = await db
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.pageId, pageId))
      .orderBy(asc(newsletterSubscriber.createdAt));

    csv = [
      "email,createdAt",
      ...rows.map((r) =>
        [csvEscape(r.email), r.createdAt.toISOString()].join(",")
      ),
    ].join("\n");
    filename = `newsletter-${p.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "form") {
    if (!blockId) {
      return NextResponse.json(
        { error: "missing blockId" },
        { status: 400 }
      );
    }
    const rows = await db
      .select()
      .from(formSubmission)
      .where(
        and(
          eq(formSubmission.pageId, pageId),
          eq(formSubmission.blockId, blockId)
        )
      )
      .orderBy(asc(formSubmission.createdAt));

    // Unifica todos os keys pra cabeçalho dinâmico
    const keys = new Set<string>();
    for (const r of rows) {
      Object.keys(r.data).forEach((k) => keys.add(k));
    }
    const keysArr = Array.from(keys);

    csv = [
      ["createdAt", ...keysArr].join(","),
      ...rows.map((r) =>
        [
          r.createdAt.toISOString(),
          ...keysArr.map((k) => csvEscape(r.data[k] ?? "")),
        ].join(",")
      ),
    ].join("\n");
    filename = `form-${p.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
