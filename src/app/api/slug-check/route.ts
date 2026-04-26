import { NextResponse, type NextRequest } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { page } from "@/lib/db/schema";
import { validateSlugFormat } from "@/lib/slug";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const ignorePageId = req.nextUrl.searchParams.get("ignorePageId") ?? "";
  if (!slug) {
    return NextResponse.json({ valid: false, error: "Slug vazio" });
  }

  const format = validateSlugFormat(slug);
  if (!format.valid) {
    return NextResponse.json({
      valid: false,
      available: false,
      error: format.error,
    });
  }

  const rows = await db
    .select({ id: page.id })
    .from(page)
    .where(
      ignorePageId
        ? and(eq(page.slug, format.slug), ne(page.id, ignorePageId))
        : eq(page.slug, format.slug)
    )
    .limit(1);
  const available = rows.length === 0;

  return NextResponse.json({
    valid: true,
    available,
    slug: format.slug,
    error: available ? null : "Esse slug já está em uso.",
  });
}
