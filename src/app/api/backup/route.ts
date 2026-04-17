import { NextResponse } from "next/server";
import { headers } from "next/headers";
import JSZip from "jszip";
import { and, asc, eq, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  block,
  event,
  page,
  shortLink,
} from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const zip = new JSZip();

  // 1. Páginas
  const pages = await db
    .select()
    .from(page)
    .where(eq(page.userId, session.user.id));

  zip.file(
    "pages.json",
    JSON.stringify(
      pages.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      null,
      2
    )
  );

  // 2. Blocos agrupados por página
  for (const p of pages) {
    const blocks = await db
      .select()
      .from(block)
      .where(eq(block.pageId, p.id))
      .orderBy(asc(block.position));
    zip.file(
      `blocks/${p.slug}.json`,
      JSON.stringify(
        blocks.map((b) => ({
          ...b,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        null,
        2
      )
    );
  }

  // 3. Events (analytics) — últimos 90 dias em CSV
  const since = new Date();
  since.setDate(since.getDate() - 90);
  for (const p of pages) {
    const events = await db
      .select()
      .from(event)
      .where(and(eq(event.pageId, p.id), gte(event.createdAt, since)))
      .orderBy(asc(event.createdAt));

    const csv = [
      "type,blockId,referrer,country,device,createdAt",
      ...events.map((e) =>
        [
          e.type,
          e.blockId ?? "",
          JSON.stringify(e.referrer ?? ""),
          e.country ?? "",
          e.device ?? "",
          e.createdAt.toISOString(),
        ].join(",")
      ),
    ].join("\n");
    zip.file(`analytics/${p.slug}.csv`, csv);
  }

  // 4. Short links
  const links = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.userId, session.user.id));

  zip.file(
    "shortlinks.json",
    JSON.stringify(
      links.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
      null,
      2
    )
  );

  // 5. README
  zip.file(
    "README.txt",
    [
      "LinkHub — Backup completo da sua conta",
      "",
      `Gerado em: ${new Date().toISOString()}`,
      `Usuário: ${session.user.email}`,
      "",
      "Estrutura:",
      "- pages.json        Todas suas páginas (metadata)",
      "- blocks/{slug}.json  Blocos de cada página",
      "- analytics/{slug}.csv  Eventos dos últimos 90 dias",
      "- shortlinks.json   Todos os seus links curtos",
      "",
      "Importação: ainda manual. Suporte a import automático em breve.",
    ].join("\n")
  );

  const buffer = await zip.generateAsync({ type: "uint8array" });
  const filename = `linkhub-backup-${new Date().toISOString().slice(0, 10)}.zip`;

  return new NextResponse(new Blob([buffer as BlobPart]), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
