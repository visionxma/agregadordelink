import Link from "next/link";
import { db } from "@/lib/db";
import { user, page, subscription, event, abuseReport } from "@/lib/db/schema";
import { sql, count, gte, eq, desc } from "drizzle-orm";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Eye,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { requireAdmin } from "./lib";

const DAY = 86400000;

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

export default async function AdminPage() {
  await requireAdmin();

  const d7 = new Date(Date.now() - 7 * DAY);
  const d14 = new Date(Date.now() - 14 * DAY);
  const d30 = new Date(Date.now() - 30 * DAY);
  const d1 = new Date(Date.now() - DAY);

  const [
    [totalUsers],
    [totalPages],
    [publishedPages],
    subRows,
    [signups7],
    [signups14],
    [signups30],
    [signupsToday],
    [views7],
    [views14],
    [pendingAbuse],
    topPages,
    recentSignups,
    signupsByDay,
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(page),
    db.select({ count: count() }).from(page).where(sql`${page.published} = true`),
    db.select({ plan: subscription.plan, status: subscription.status }).from(subscription),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, d7)),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, d14)),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, d30)),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, d1)),
    db.select({ count: count() }).from(event).where(sql`${event.type} = 'view' AND ${event.createdAt} >= ${d7}`),
    db.select({ count: count() }).from(event).where(sql`${event.type} = 'view' AND ${event.createdAt} >= ${d14} AND ${event.createdAt} < ${d7}`),
    db.select({ count: count() }).from(abuseReport).where(eq(abuseReport.status, "pending")),
    db
      .select({
        id: page.id,
        slug: page.slug,
        title: page.title,
        userName: user.name,
        views: sql<number>`(select count(*) from "event" where "event"."page_id" = ${page.id} and "event"."type" = 'view' and "event"."created_at" >= ${d30})`.as("views"),
      })
      .from(page)
      .innerJoin(user, eq(user.id, page.userId))
      .where(sql`${page.published} = true`)
      .orderBy(sql`views desc`)
      .limit(5),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(6),
    db.execute<{ d: string; c: number }>(
      sql`select to_char(date_trunc('day', "created_at"), 'YYYY-MM-DD') as d, count(*)::int as c
          from "user" where "created_at" >= ${d30}
          group by 1 order by 1 asc`
    ),
  ]);

  const active = subRows.filter((s) => s.status === "active");
  const trials = subRows.filter((s) => s.status === "trial");
  const pro = active.filter((s) => s.plan === "pro").length;
  const business = active.filter((s) => s.plan === "business").length;
  const mrr = pro * 29 + business * 79;
  const arr = mrr * 12;

  const total = totalUsers?.count ?? 0;
  const free = Math.max(0, total - active.length - trials.length);
  const conversion = total > 0 ? ((active.length / total) * 100).toFixed(1) : "0.0";

  const prev7Signups = (signups14?.count ?? 0) - (signups7?.count ?? 0);
  const signupsTrend = pctChange(signups7?.count ?? 0, prev7Signups);
  const viewsTrend = pctChange(views7?.count ?? 0, views14?.count ?? 0);

  const dayMap = new Map<string, number>();
  const rawDays = Array.isArray(signupsByDay) ? signupsByDay : (signupsByDay as { rows?: Array<{ d: string; c: number }> }).rows ?? [];
  for (const r of rawDays) dayMap.set(String(r.d), Number(r.c));
  const days: { d: string; c: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(Date.now() - i * DAY);
    const key = dt.toISOString().slice(0, 10);
    days.push({ d: key, c: dayMap.get(key) ?? 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.c));

  const stats = [
    {
      label: "Usuários",
      value: total.toLocaleString("pt-BR"),
      icon: Users,
      tint: "from-primary/20 to-primary/5 text-primary",
      sub: `+${signupsToday?.count ?? 0} hoje · +${signups7?.count ?? 0} (7d)`,
      trend: signupsTrend,
    },
    {
      label: "Páginas publicadas",
      value: (publishedPages?.count ?? 0).toLocaleString("pt-BR"),
      icon: Globe,
      tint: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
      sub: `de ${(totalPages?.count ?? 0).toLocaleString("pt-BR")} totais`,
    },
    {
      label: "Visitas (7d)",
      value: (views7?.count ?? 0).toLocaleString("pt-BR"),
      icon: Eye,
      tint: "from-pink-500/20 to-pink-500/5 text-pink-600 dark:text-pink-400",
      sub: `vs ${((views14?.count ?? 0) - (views7?.count ?? 0)).toLocaleString("pt-BR")} anterior`,
      trend: viewsTrend,
    },
    {
      label: "Assinantes ativos",
      value: active.length.toLocaleString("pt-BR"),
      icon: CreditCard,
      tint: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
      sub: `${conversion}% de conversão`,
    },
    {
      label: "Em trial",
      value: trials.length.toLocaleString("pt-BR"),
      icon: Zap,
      tint: "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
      sub: "convertem em até 14d",
    },
    {
      label: "MRR estimado",
      value: `R$ ${mrr.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      tint: "from-primary/20 to-accent/15 text-primary",
      sub: `ARR R$ ${arr.toLocaleString("pt-BR")}`,
    },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-black tracking-[-0.02em] sm:text-4xl">
          <span className="brand-gradient-text">Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da plataforma LinkBio BR.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tint, sub, trend }) => (
          <div
            key={label}
            className="group rounded-2xl border border-border bg-card p-4 shadow-ios-sm transition-all hover:-translate-y-0.5 hover:shadow-ios sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint}`}>
                <Icon className="size-5" />
              </div>
              {trend !== null && trend !== undefined && (
                <span
                  className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    trend >= 0
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {trend >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
            </div>
            <p className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{value}</p>
            <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
            {sub && <p className="mt-1 truncate text-[10px] text-muted-foreground/70">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Pending abuse alert */}
      {(pendingAbuse?.count ?? 0) > 0 && (
        <Link
          href="/admin/abuse"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5 p-4 shadow-ios-sm transition-all hover:-translate-y-0.5 hover:shadow-ios"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
            <ShieldAlert className="size-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-destructive">
              {pendingAbuse?.count} denúncia(s) aguardando revisão
            </p>
            <p className="text-xs text-muted-foreground">Clique para revisar agora.</p>
          </div>
          <ArrowRight className="size-4 text-destructive" />
        </Link>
      )}

      {/* Sparkline */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-ios-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">
              Novos usuários — últimos 30 dias
            </p>
            <p className="text-[11px] text-muted-foreground">
              {(signups30?.count ?? 0).toLocaleString("pt-BR")} cadastros no período
            </p>
          </div>
        </div>
        <div className="flex h-24 items-end gap-1">
          {days.map((d) => (
            <div
              key={d.d}
              title={`${d.d}: ${d.c} cadastro(s)`}
              className="group relative flex-1"
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary/70 transition-all group-hover:from-primary group-hover:to-accent"
                style={{ height: `${Math.max(2, (d.c / maxDay) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{days[0].d.slice(5)}</span>
          <span>{days[days.length - 1].d.slice(5)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Distribuição de planos */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ios-sm">
          <p className="mb-4 text-sm font-bold text-foreground">Distribuição de planos</p>
          <div className="space-y-3">
            {[
              { name: "Free", count: free, color: "bg-muted-foreground/40" },
              { name: "Pro", count: pro, color: "bg-blue-500" },
              { name: "Business", count: business, color: "bg-purple-500" },
              { name: "Trial", count: trials.length, color: "bg-amber-500" },
            ].map(({ name, count: n, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-muted-foreground">{name}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${color}`}
                    style={{ width: `${((n / (total || 1)) * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-bold text-foreground">{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top páginas */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ios-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Top páginas (30d)</p>
            <Link
              href="/admin/pages"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              ver todas →
            </Link>
          </div>
          {topPages.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Sem dados de visualizações ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-semibold text-foreground">/{p.slug}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{p.userName}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {Number(p.views).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent signups + receita */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ios-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Cadastros recentes</p>
            <Link
              href="/admin/users"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              ver todos →
            </Link>
          </div>
          <ul className="space-y-2">
            {recentSignups.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.image} alt="" className="size-8 rounded-full object-cover ring-2 ring-card" />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{u.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/10 p-5 shadow-ios-sm">
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-32 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-bold text-foreground">Receita mensal estimada</p>
            <p className="mt-1 text-4xl font-black tracking-tight">
              <span className="brand-gradient-text">R$ {mrr.toLocaleString("pt-BR")}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ARR projetado · R$ {arr.toLocaleString("pt-BR")}
            </p>
            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Pro × R$ 29</span>
                  <span className="font-bold text-foreground">
                    R$ {(pro * 29).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${mrr ? ((pro * 29) / mrr) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Business × R$ 79</span>
                  <span className="font-bold text-foreground">
                    R$ {(business * 79).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${mrr ? ((business * 79) / mrr) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
