import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block, page } from "@/lib/db/schema";
import { normalizeTheme } from "@/lib/normalize-theme";
import type { BlockData, PageTheme, ThemeBackground } from "@/lib/db/schema";

export const runtime = "nodejs";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function backgroundCss(b: ThemeBackground): string {
  if (b.type === "solid") return b.color;
  if (b.type === "gradient") {
    const dir = {
      "to-br": "135deg",
      "to-bl": "225deg",
      "to-tr": "45deg",
      "to-tl": "315deg",
      "to-r": "90deg",
      "to-b": "180deg",
    }[b.direction];
    const stops = b.via
      ? `${b.from}, ${b.via}, ${b.to}`
      : `${b.from}, ${b.to}`;
    return `linear-gradient(${dir}, ${stops})`;
  }
  return `url(${b.url}) center/cover`;
}

function buttonCss(theme: PageTheme): string {
  const { buttonStyle, accent, accentForeground, foreground } = theme;
  switch (buttonStyle) {
    case "pill":
      return `background:${accent};color:${accentForeground};border-radius:9999px`;
    case "sharp":
      return `background:${accent};color:${accentForeground};border-radius:0`;
    case "outline":
      return `background:transparent;color:${foreground};border:2px solid ${accent};border-radius:12px`;
    case "neubrutalism":
      return `background:${accent};color:${accentForeground};border:3px solid ${foreground};border-radius:0;box-shadow:6px 6px 0 ${foreground}`;
    case "glass":
      return `background:rgba(255,255,255,0.1);color:${foreground};border:1px solid rgba(255,255,255,0.2);border-radius:14px;backdrop-filter:blur(10px)`;
    case "shadow":
      return `background:${accent};color:${accentForeground};border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.15)`;
    case "underline":
      return `background:transparent;color:${foreground};border-bottom:2px solid ${foreground};border-radius:0;padding:12px 0`;
    default:
      return `background:${accent};color:${accentForeground};border-radius:14px`;
  }
}

function renderBlock(b: BlockData, theme: PageTheme): string {
  const btnStyle = buttonCss(theme);
  if (b.kind === "link") {
    return `<a href="${escapeHtml(b.url)}" target="_blank" rel="noopener" class="btn" style="${btnStyle}">${escapeHtml(b.label)}</a>`;
  }
  if (b.kind === "text") {
    return `<p style="text-align:${b.align ?? "center"};color:${theme.mutedForeground};font-size:14px;">${escapeHtml(b.content)}</p>`;
  }
  if (b.kind === "image") {
    const img = `<img src="${escapeHtml(b.url)}" alt="${escapeHtml(b.alt ?? "")}" style="width:100%;border-radius:16px" />`;
    return b.href
      ? `<a href="${escapeHtml(b.href)}" target="_blank" rel="noopener">${img}</a>`
      : img;
  }
  if (b.kind === "video") {
    const src =
      b.provider === "youtube"
        ? `https://www.youtube.com/embed/${b.videoId}`
        : `https://player.vimeo.com/video/${b.videoId}`;
    return `<div style="aspect-ratio:16/9;border-radius:16px;overflow:hidden"><iframe src="${src}" style="width:100%;height:100%;border:0" allowfullscreen></iframe></div>`;
  }
  if (b.kind === "divider") {
    return `<hr style="border:0;border-top:1px solid ${theme.foreground}20;margin:4px 0" />`;
  }
  if (b.kind === "whatsapp") {
    const msg = b.message ? `?text=${encodeURIComponent(b.message)}` : "";
    return `<a href="https://wa.me/${b.phone}${msg}" target="_blank" rel="noopener" class="btn" style="${btnStyle.replace(`background:${theme.accent}`, "background:#25d366")}">${escapeHtml(b.label)}</a>`;
  }
  if (b.kind === "faq") {
    return b.items
      .map(
        (i) =>
          `<details style="border:1px solid ${theme.foreground}20;border-radius:12px;padding:12px"><summary style="font-weight:600;cursor:pointer">${escapeHtml(i.q)}</summary><p style="margin-top:8px;color:${theme.mutedForeground};font-size:14px">${escapeHtml(i.a)}</p></details>`
      )
      .join("");
  }
  if (b.kind === "map") {
    return `<iframe src="https://www.google.com/maps?q=${encodeURIComponent(b.query)}&output=embed" style="width:100%;height:220px;border:0;border-radius:16px" loading="lazy"></iframe>`;
  }
  // Blocos dinâmicos (newsletter, form, countdown, music, social-embed, events, products, testimonials)
  // Export simplificado — mostra só avisos nos que precisam JS
  if (b.kind === "newsletter") {
    return `<div style="background:${theme.accent}15;padding:16px;border-radius:16px;text-align:center"><strong style="display:block;margin-bottom:4px">${escapeHtml(b.title)}</strong><p style="color:${theme.mutedForeground};font-size:13px">${escapeHtml(b.description ?? "")}</p><p style="color:${theme.mutedForeground};font-size:11px;margin-top:8px">(Funciona só na versão online)</p></div>`;
  }
  return "";
}

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

  const blocks = await db
    .select()
    .from(block)
    .where(and(eq(block.pageId, p.id), eq(block.visible, true)))
    .orderBy(asc(block.position));

  const theme = normalizeTheme(p.theme);
  const bg = backgroundCss(theme.background);

  const blocksHtml = blocks.map((b) => renderBlock(b.data, theme)).join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(p.title)}</title>
${p.description ? `<meta name="description" content="${escapeHtml(p.description)}" />` : ""}
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: ${bg};
    color: ${theme.foreground};
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .wrap {
    max-width: 480px;
    margin: 0 auto;
    padding: 48px 16px;
    text-align: center;
  }
  .avatar {
    width: 96px; height: 96px;
    border-radius: 9999px;
    object-fit: cover;
    margin: 0 auto 16px;
    border: 4px solid ${theme.foreground}10;
  }
  h1 { font-size: 32px; margin: 0 0 8px; letter-spacing: -0.02em; }
  .bio { color: ${theme.mutedForeground}; font-size: 14px; margin: 0 0 32px; }
  .btn {
    display: block;
    padding: 14px 20px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    transition: transform 0.15s;
  }
  .btn:hover { transform: scale(1.02); }
  .blocks > * { margin: 12px 0; }
  footer { margin-top: 48px; font-size: 11px; color: ${theme.mutedForeground}; }
  ${p.customCss ?? ""}
</style>
</head>
<body>
  <div class="wrap">
    ${p.avatarUrl ? `<img src="${escapeHtml(p.avatarUrl)}" alt="${escapeHtml(p.title)}" class="avatar" />` : ""}
    <h1>${escapeHtml(p.title)}</h1>
    ${p.description ? `<p class="bio">${escapeHtml(p.description)}</p>` : ""}
    <div class="blocks">
      ${blocksHtml}
    </div>
    <footer>Exportado de linkhub.app</footer>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${p.slug}.html"`,
    },
  });
}
