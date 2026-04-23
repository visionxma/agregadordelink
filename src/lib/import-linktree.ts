import type { BlockData, BlockType } from "@/lib/db/schema";

export type ImportedData = {
  source: "linktree" | "beacons" | "unknown";
  title?: string;
  bio?: string;
  avatarUrl?: string;
  blocks: { type: BlockType; data: BlockData }[];
};

function cleanText(s: string | undefined | null): string | undefined {
  if (!s) return undefined;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

export async function importFromUrl(
  rawUrl: string
): Promise<ImportedData | { error: string }> {
  let url = rawUrl.trim();
  if (!url) return { error: "URL vazia." };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return { error: "URL inválida." };
  }

  const isLinktree = host.includes("linktr.ee") || host.includes("linktree");
  const isBeacons = host.includes("beacons.ai");

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkBioBRImport/1.0; +https://linkbiobr.com)",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      return { error: `Não consegui acessar (HTTP ${res.status}).` };
    }
    html = await res.text();
  } catch {
    return { error: "Falha ao buscar a página. Verifique a URL." };
  }

  if (isLinktree) return parseLinktree(html);
  if (isBeacons) return parseBeacons(html);
  return parseGeneric(html);
}

// Linktree: dados em window.__NEXT_DATA__ (JSON)
function parseLinktree(html: string): ImportedData {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  const blocks: ImportedData["blocks"] = [];
  let title: string | undefined;
  let bio: string | undefined;
  let avatarUrl: string | undefined;

  if (match) {
    try {
      const json = JSON.parse(match[1]!);
      const account =
        json?.props?.pageProps?.account ??
        json?.props?.pageProps?.pageProps?.account;
      if (account) {
        title = account.displayName ?? account.username;
        bio = account.description;
        avatarUrl = account.profilePictureUrl ?? account.pfpUrl;
      }
      const links =
        json?.props?.pageProps?.links ??
        json?.props?.pageProps?.pageProps?.links ??
        [];
      for (const l of links) {
        if (l?.url && l?.title) {
          blocks.push({
            type: "link",
            data: { kind: "link", label: l.title, url: l.url },
          });
        }
      }
    } catch {
      // fallback regex
    }
  }

  // Fallback: raspa links com <a href> e texto dentro
  if (blocks.length === 0) {
    return parseGeneric(html, "linktree");
  }

  return {
    source: "linktree",
    title: cleanText(title),
    bio: cleanText(bio),
    avatarUrl: avatarUrl && isHttpUrl(avatarUrl) ? avatarUrl : undefined,
    blocks,
  };
}

function parseBeacons(html: string): ImportedData {
  // Beacons usa __NEXT_DATA__ também
  return { ...parseLinktree(html), source: "beacons" };
}

function parseGeneric(
  html: string,
  source: ImportedData["source"] = "unknown"
): ImportedData {
  // Pega og:title / og:description / og:image
  const meta = (prop: string) => {
    const m = html.match(
      new RegExp(
        `<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
        "i"
      )
    );
    return m?.[1];
  };

  const title = cleanText(meta("og:title") ?? meta("twitter:title"));
  const bio = cleanText(
    meta("og:description") ?? meta("description") ?? meta("twitter:description")
  );
  const avatarUrl = meta("og:image") ?? meta("twitter:image");

  // Raspa <a href> com texto (filtra os internos / navs)
  const blocks: ImportedData["blocks"] = [];
  const linkRegex =
    /<a[^>]+href=["'](https?:\/\/[^"'#]+)["'][^>]*>([^<]{2,80})<\/a>/gi;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html))) {
    const url = m[1]!.trim();
    const label = cleanText(m[2]!);
    if (!url || !label) continue;
    if (seen.has(url)) continue;
    // Ignora Linktree internos
    if (/\/(login|signup|help|legal|policies|privacy|terms)/.test(url)) continue;
    seen.add(url);
    blocks.push({
      type: "link",
      data: { kind: "link", label, url },
    });
    if (blocks.length >= 25) break;
  }

  return {
    source,
    title,
    bio,
    avatarUrl: avatarUrl && isHttpUrl(avatarUrl) ? avatarUrl : undefined,
    blocks,
  };
}
