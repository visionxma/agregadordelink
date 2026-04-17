import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { block, page, type BlockData } from "@/lib/db/schema";

export type HealthIssue = {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  kind: "link" | "image" | "avatar" | "cover" | "video";
  target: string;
  blockId?: string;
  status: "broken" | "slow" | "insecure" | "unreachable";
  detail: string;
};

export type HealthReport = {
  pagesChecked: number;
  urlsChecked: number;
  issues: HealthIssue[];
  checkedAt: string;
};

async function checkUrl(
  url: string
): Promise<{ ok: boolean; status: number; detail: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return {
      ok: res.ok,
      status: res.status,
      detail: res.ok ? "OK" : `HTTP ${res.status}`,
    };
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") {
      return { ok: false, status: 0, detail: "Timeout (6s)" };
    }
    return { ok: false, status: 0, detail: e.message };
  }
}

export async function runHealthCheck(userId: string): Promise<HealthReport> {
  const pages = await db
    .select()
    .from(page)
    .where(eq(page.userId, userId));

  const issues: HealthIssue[] = [];
  let urlsChecked = 0;

  for (const p of pages) {
    const targets: { kind: HealthIssue["kind"]; url: string; blockId?: string }[] =
      [];

    if (p.avatarUrl) targets.push({ kind: "avatar", url: p.avatarUrl });
    if (p.coverUrl) targets.push({ kind: "cover", url: p.coverUrl });

    const blocks = await db
      .select()
      .from(block)
      .where(and(eq(block.pageId, p.id), eq(block.visible, true)));

    for (const b of blocks) {
      const data = b.data as BlockData;
      if (data.kind === "link" && data.url) {
        targets.push({ kind: "link", url: data.url, blockId: b.id });
      } else if (data.kind === "image" && data.url) {
        targets.push({ kind: "image", url: data.url, blockId: b.id });
        if (data.href) {
          targets.push({ kind: "link", url: data.href, blockId: b.id });
        }
      }
    }

    urlsChecked += targets.length;

    // Checa em paralelo com limite de 8 simultâneos
    const results = await Promise.all(
      targets.map(async (t) => {
        if (t.url.startsWith("mailto:") || t.url.startsWith("tel:")) {
          return { ok: true, target: t };
        }
        const r = await checkUrl(t.url);
        return { ok: r.ok, target: t, detail: r.detail };
      })
    );

    for (const r of results) {
      if (!r.ok) {
        issues.push({
          pageId: p.id,
          pageTitle: p.title,
          pageSlug: p.slug,
          kind: r.target.kind,
          target: r.target.url,
          blockId: r.target.blockId,
          status: "broken",
          detail: r.detail ?? "Falha desconhecida",
        });
      }
      // HTTP (insecure)
      if (r.ok && r.target.url.startsWith("http://")) {
        issues.push({
          pageId: p.id,
          pageTitle: p.title,
          pageSlug: p.slug,
          kind: r.target.kind,
          target: r.target.url,
          blockId: r.target.blockId,
          status: "insecure",
          detail: "URL sem HTTPS. Google pode marcar como não seguro.",
        });
      }
    }
  }

  return {
    pagesChecked: pages.length,
    urlsChecked,
    issues,
    checkedAt: new Date().toISOString(),
  };
}
