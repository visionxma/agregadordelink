import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Download,
  Globe,
  Laptop,
  MousePointerClick,
  Smartphone,
  Target,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { page } from "@/lib/db/schema";
import { getPageAnalytics } from "@/lib/analytics";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeWidget } from "./realtime-widget";
import { DailyChart } from "./daily-chart";
import { TrafficSourceList } from "./traffic-source-list";
import { detectTrafficSource } from "@/lib/traffic-source";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, id), eq(page.userId, session.user.id)));
  if (!p) notFound();

  const limits = await getUserPlanLimits(session.user.id);
  const retentionDays = limits.analyticsRetentionDays;
  const canExportCsv = limits.apiAccess; // Business only

  const analytics = await getPageAnalytics(p.id, retentionDays);

  return (
    <main className="ambient-bg-subtle min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/pages/${p.id}/edit`}>
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <div className="border-l border-border pl-3">
              <h1 className="text-sm font-bold">{p.title} · Analytics</h1>
              <p className="text-xs text-muted-foreground">Últimos {retentionDays} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canExportCsv ? (
              <Button asChild variant="outline" size="sm">
                <a href={`/api/analytics/export?pageId=${p.id}`} download>
                  <Download className="size-4" /> CSV
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/billing" title="Exportar CSV disponível no plano Business">
                  <Download className="size-4" /> CSV 👑
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <a href={`/api/export-html?pageId=${p.id}`} download>
                <Download className="size-4" /> HTML
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${p.slug}`} target="_blank">
                Ver ao vivo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <RealtimeWidget pageId={p.id} />
        </div>

        {/* Number cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<TrendingUp className="size-4" />}
            label="Visitas"
            value={analytics.totalViews.toLocaleString("pt-BR")}
          />
          <StatCard
            icon={<MousePointerClick className="size-4" />}
            label="Cliques"
            value={analytics.totalClicks.toLocaleString("pt-BR")}
            sub={`${analytics.ctr.toFixed(1)}% CTR`}
          />
          <StatCard
            icon={<Target className="size-4" />}
            label="Conversões"
            value={analytics.goalClicks.toLocaleString("pt-BR")}
            sub={`${analytics.conversionRate.toFixed(1)}% taxa`}
            highlight
          />
          <StatCard
            icon={<BarChart3 className="size-4" />}
            label="Dias com atividade"
            value={`${analytics.uniqueDays}/30`}
          />
        </div>

        {/* Timeline */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Atividade diária
            </h2>
            <DailyChart data={analytics.timeline} />
          </CardContent>
        </Card>

        {/* Heatmap */}
        {analytics.heatmap.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Heatmap de cliques
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Intensidade de cliques por bloco. Vermelho = mais clicado,
                cinza = sem clique.
              </p>
              <div className="mx-auto max-w-md space-y-2">
                {analytics.heatmap.map((h) => (
                  <HeatmapRow key={h.blockId} item={h} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cohorts */}
        {analytics.cohorts.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Conversão por origem
              </h2>
              {analytics.goalClicks === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Marque blocos como conversão (ícone 🎯 no editor) pra ver
                  taxa de conversão por fonte.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2">Origem</th>
                        <th className="pb-2 text-right">Visitas</th>
                        <th className="pb-2 text-right">Conversões</th>
                        <th className="pb-2 text-right">Taxa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.cohorts.map((c, i) => {
                        const src = detectTrafficSource(c.referrer);
                        return (
                          <tr
                            key={i}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-2 font-medium">{src.name}</td>
                            <td className="py-2 text-right tabular-nums">
                              {c.visits}
                            </td>
                            <td className="py-2 text-right tabular-nums">
                              {c.goalClicks}
                            </td>
                            <td className="py-2 text-right font-semibold tabular-nums text-primary">
                              {c.conversionRate.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Links mais clicados
              </h2>
              {analytics.topLinks.length === 0 ? (
                <EmptyRow text="Ninguém clicou ainda." />
              ) : (
                <BarList
                  items={analytics.topLinks.map((l) => ({
                    label: `${l.isGoal ? "🎯 " : ""}${l.label}`,
                    count: l.clicks,
                  }))}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Origem do tráfego
              </h2>
              {analytics.topReferrers.length === 0 ? (
                <EmptyRow text="Ainda não temos dados. Compartilhe seu link com ?utm_source=instagram pra rastrear origem." />
              ) : (
                <TrafficSourceList items={analytics.topReferrers} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Smartphone className="size-3.5" /> Dispositivos
              </h2>
              {analytics.byDevice.length === 0 ? (
                <EmptyRow text="Sem dados." />
              ) : (
                <BarList
                  items={analytics.byDevice.map((d) => ({
                    label: deviceLabel(d.device),
                    count: d.count,
                    icon: deviceIcon(d.device),
                  }))}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Globe className="size-3.5" /> Países
              </h2>
              {analytics.byCountry.length === 0 ? (
                <EmptyRow text="Só em produção (Vercel injeta país)." />
              ) : (
                <BarList
                  items={analytics.byCountry.map((c) => ({
                    label: c.country,
                    count: c.count,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-ios-sm backdrop-blur-xl ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card/80"}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full p-2 ${highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {label}
        {sub && <span className="ml-1 font-semibold">· {sub}</span>}
      </p>
    </div>
  );
}

function HeatmapRow({
  item,
}: {
  item: {
    label: string;
    clicks: number;
    share: number;
    isGoal: boolean;
  };
}) {
  // Cor baseada em share: 0 → cinza, 1 → vermelho/laranja forte
  const pct = Math.round(item.share * 100);
  const hue = 20; // laranja-avermelhado
  const sat = 90;
  const lightStart = 95;
  const lightEnd = 55;
  const light = lightStart + (lightEnd - lightStart) * item.share;
  const bg = item.clicks === 0 ? "#e5e7eb" : `hsl(${hue}, ${sat}%, ${light}%)`;
  const textColor = item.share > 0.4 ? "white" : "#0a0a0a";

  return (
    <div
      className="relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all"
      style={{ background: bg, color: textColor }}
    >
      <span className="flex items-center gap-2 truncate">
        {item.isGoal && <Target className="size-3.5 shrink-0" />}
        <span className="truncate">{item.label}</span>
      </span>
      <span className="shrink-0 tabular-nums">
        {item.clicks} · {pct}%
      </span>
    </div>
  );
}

function BarList({
  items,
}: {
  items: { label: string; count: number; icon?: React.ReactNode }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
            style={{ width: `${(item.count / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between gap-3 px-3 py-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {item.icon}
              <span className="truncate text-sm font-medium">
                {item.label}
              </span>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {item.count.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function deviceLabel(d: string): string {
  if (d === "mobile") return "Mobile";
  if (d === "desktop") return "Desktop";
  if (d === "tablet") return "Tablet";
  return d;
}
function deviceIcon(d: string): React.ReactNode {
  if (d === "mobile") return <Smartphone className="size-3.5" />;
  if (d === "desktop") return <Laptop className="size-3.5" />;
  return null;
}

// Suprime lint
void ArrowUpRight;
