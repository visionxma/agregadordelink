import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { block, event } from "@/lib/db/schema";

export async function getRealtimeCount(pageId: string): Promise<number> {
  const since = new Date(Date.now() - 2 * 60 * 1000); // últimos 2min
  const [row] = await db
    .select({ n: sql<number>`COUNT(*)::int` })
    .from(event)
    .where(
      and(
        eq(event.pageId, pageId),
        eq(event.type, "view"),
        gte(event.createdAt, since)
      )
    );
  return row?.n ?? 0;
}

export type AnalyticsSummary = {
  totalViews: number;
  totalClicks: number;
  ctr: number; // percentual
  goalClicks: number;
  conversionRate: number; // goalClicks / totalViews
  uniqueDays: number;
  topLinks: {
    blockId: string;
    label: string;
    clicks: number;
    isGoal: boolean;
  }[];
  topReferrers: { referrer: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  timeline: { date: string; views: number; clicks: number }[];
  cohorts: {
    referrer: string;
    visits: number;
    goalClicks: number;
    conversionRate: number;
  }[];
  heatmap: {
    blockId: string;
    label: string;
    clicks: number;
    share: number; // 0..1 da fatia total de clicks
    isGoal: boolean;
  }[];
};

export async function getPageAnalytics(
  pageId: string,
  days = 30
): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // 1. Totais
  const [totals] = await db
    .select({
      views: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'view')::int`,
      clicks: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'click')::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)));

  const totalViews = totals?.views ?? 0;
  const totalClicks = totals?.clicks ?? 0;
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  // 2. Dias distintos com atividade
  const [daysRow] = await db
    .select({
      n: sql<number>`COUNT(DISTINCT DATE(${event.createdAt}))::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)));
  const uniqueDays = daysRow?.n ?? 0;

  // 3. Top links (clicks por block)
  const topClickRows = await db
    .select({
      blockId: event.blockId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(event)
    .where(
      and(
        eq(event.pageId, pageId),
        eq(event.type, "click"),
        gte(event.createdAt, since)
      )
    )
    .groupBy(event.blockId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  const blockIds = topClickRows
    .map((r) => r.blockId)
    .filter((id): id is string => !!id);

  const blockLabels = new Map<string, string>();
  if (blockIds.length > 0) {
    const blocks = await db
      .select()
      .from(block)
      .where(eq(block.pageId, pageId));
    for (const b of blocks) {
      const data = b.data;
      if (data.kind === "link") blockLabels.set(b.id, data.label);
      else if (data.kind === "image") blockLabels.set(b.id, "Imagem");
      else if (data.kind === "video") blockLabels.set(b.id, "Vídeo");
      else blockLabels.set(b.id, data.kind);
    }
  }

  // Carrega todos os blocos pra saber quais são goal
  const blockRows = await db
    .select()
    .from(block)
    .where(eq(block.pageId, pageId));
  const blockInfo = new Map<
    string,
    { label: string; isGoal: boolean }
  >();
  for (const b of blockRows) {
    const data = b.data;
    let label = b.type as string;
    if (data.kind === "link") label = data.label;
    else if (data.kind === "image") label = "Imagem";
    else if (data.kind === "video") label = "Vídeo";
    blockInfo.set(b.id, { label, isGoal: b.isGoal });
  }

  const topLinks = topClickRows
    .filter((r) => r.blockId)
    .map((r) => {
      const info = blockInfo.get(r.blockId!);
      return {
        blockId: r.blockId!,
        label: info?.label ?? "(bloco removido)",
        clicks: r.count,
        isGoal: info?.isGoal ?? false,
      };
    });

  // Goals
  const goalBlockIds = new Set(
    blockRows.filter((b) => b.isGoal).map((b) => b.id)
  );
  const goalClicks = topClickRows
    .filter((r) => r.blockId && goalBlockIds.has(r.blockId))
    .reduce((acc, r) => acc + r.count, 0);
  const conversionRate = totalViews > 0 ? (goalClicks / totalViews) * 100 : 0;

  // Heatmap — todos os blocos visíveis com clicks e share
  const totalClicksForShare = topClickRows.reduce(
    (acc, r) => acc + r.count,
    0
  );
  const clicksByBlock = new Map<string, number>();
  for (const r of topClickRows) {
    if (r.blockId) clicksByBlock.set(r.blockId, r.count);
  }
  const heatmap = blockRows
    .filter((b) => b.visible)
    .map((b) => {
      const clicks = clicksByBlock.get(b.id) ?? 0;
      return {
        blockId: b.id,
        label: blockInfo.get(b.id)?.label ?? b.type,
        clicks,
        share: totalClicksForShare > 0 ? clicks / totalClicksForShare : 0,
        isGoal: b.isGoal,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  // Cohorts por referrer: visitas x goal clicks
  const cohortRaw = await db
    .select({
      referrer: event.referrer,
      views: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'view')::int`,
      goalClicks: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'click' AND ${event.blockId} = ANY(${sql.raw(`ARRAY[${goalBlockIds.size ? Array.from(goalBlockIds).map((id) => `'${id}'`).join(",") : "NULL"}]::text[]`)}))::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .groupBy(event.referrer)
    .orderBy(desc(sql`COUNT(*) FILTER (WHERE ${event.type} = 'view')`))
    .limit(10);

  const cohorts = cohortRaw.map((r) => ({
    referrer: normalizeReferrer(r.referrer),
    visits: r.views,
    goalClicks: r.goalClicks,
    conversionRate: r.views > 0 ? (r.goalClicks / r.views) * 100 : 0,
  }));

  // 4. Top referrers
  const referrerRows = await db
    .select({
      referrer: event.referrer,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .groupBy(event.referrer)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  const topReferrers = referrerRows.map((r) => ({
    referrer: normalizeReferrer(r.referrer),
    count: r.count,
  }));

  // 5. By device
  const deviceRows = await db
    .select({
      device: event.device,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .groupBy(event.device)
    .orderBy(desc(sql`COUNT(*)`));

  const byDevice = deviceRows.map((r) => ({
    device: r.device ?? "desconhecido",
    count: r.count,
  }));

  // 6. By country
  const countryRows = await db
    .select({
      country: event.country,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .groupBy(event.country)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  const byCountry = countryRows.map((r) => ({
    country: r.country ?? "—",
    count: r.count,
  }));

  // 7. Timeline (last `days` days, 1 row per day)
  const timelineRows = await db
    .select({
      date: sql<string>`TO_CHAR(DATE(${event.createdAt}), 'YYYY-MM-DD')`,
      views: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'view')::int`,
      clicks: sql<number>`COUNT(*) FILTER (WHERE ${event.type} = 'click')::int`,
    })
    .from(event)
    .where(and(eq(event.pageId, pageId), gte(event.createdAt, since)))
    .groupBy(sql`DATE(${event.createdAt})`)
    .orderBy(sql`DATE(${event.createdAt})`);

  // Preenche dias vazios
  const byDate = new Map<string, { views: number; clicks: number }>();
  for (const r of timelineRows) {
    byDate.set(r.date, { views: r.views, clicks: r.clicks });
  }
  const timeline: AnalyticsSummary["timeline"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDate.get(key) ?? { views: 0, clicks: 0 };
    timeline.push({ date: key, ...entry });
  }

  return {
    totalViews,
    totalClicks,
    ctr,
    goalClicks,
    conversionRate,
    uniqueDays,
    topLinks,
    topReferrers,
    byDevice,
    byCountry,
    timeline,
    cohorts,
    heatmap,
  };
}

function normalizeReferrer(raw: string | null): string {
  if (!raw) return "Direto / App";
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}
