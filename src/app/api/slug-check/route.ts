import { NextResponse, type NextRequest } from "next/server";
import { validateSlugFormat, isPageSlugAvailable } from "@/lib/slug";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
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

  const available = await isPageSlugAvailable(format.slug);
  return NextResponse.json({
    valid: true,
    available,
    slug: format.slug,
    error: available ? null : "Esse slug já está em uso.",
  });
}
