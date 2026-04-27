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

  const now = new Date();
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

  // Sparkline: 30 dias
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
      value: total,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      sub: `+${signupsToday?.count ?? 0} hoje · +${signups7?.count ?? 0} (7d)`,
      trend: signupsTrend,
    },
    {
      label: "Páginas publicadas",
      value: publishedPages?.count ?? 0,
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      sub: `de ${totalPages?.count ?? 0} totais`,
    },
    {
      label: "Visitas (7d)",
      value: (views7?.count ?? 0).toLocaleString("pt-BR"),
      icon: Eye,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      sub: `vs ${(views14?.count ?? 0) - (views7?.count ?? 0)} semana anterior`,
      trend: viewsTrend,
    },
    {
      label: "Assinantes ativos",
      value: active.length,
      icon: CreditCard,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      sub: `${conversion}% de conversão`,
    },
    {
      label: "Em trial",
      value: trials.length,
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      sub: "convertem em até 14d",
    },
    {
      label: "MRR estimado",
      value: `R$ ${mrr.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      sub: `ARR R$ ${arr.toLocaleString("pt-BR")}`,
    },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">Dashboard</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Visão geral da plataforma LinkBio BR.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg, sub, trend }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex size-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              {trend !== null && trend !== undefined && (
                <span
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    trend >= 0
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300"
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
            <p className="text-xl font-black text-zinc-100 sm:text-2xl">{value}</p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{label}</p>
            {sub && <p className="mt-1 truncate text-[10px] text-zinc-600">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Pending abuse alert */}
      {(pendingAbuse?.count ?? 0) > 0 && (
        <Link
          href="/admin/abuse"
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 transition-colors hover:bg-red-500/10"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
            <ShieldAlert className="size-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-300">
              {pendingAbuse?.count} denúncia(s) aguardando revisão
            </p>
            <p className="text-xs text-zinc-400">Clique para revisar agora.</p>
          </div>
          <ArrowRight className="size-4 text-red-400" />
        </Link>
      )}

      {/* Sparkline */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-300">Novos usuários — últimos 30 dias</p>
            <p className="text-[11px] text-zinc-500">{signups30?.count ?? 0} cadastros no período</p>
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
                className="w-full rounded-t bg-emerald-500/30 transition-colors group-hover:bg-emerald-400"
                style={{ height: `${Math.max(2, (d.c / maxDay) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
          <span>{days[0].d.slice(5)}</span>
          <span>{days[days.length - 1].d.slice(5)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Distribuição de planos */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">Distribuição de planos</p>
          <div className="space-y-3">
            {[
              { name: "Free", count: free, color: "bg-zinc-600" },
              { name: "Pro", count: pro, color: "bg-blue-500" },
              { name: "Business", count: business, color: "bg-purple-500" },
              { name: "Trial", count: trials.length, color: "bg-amber-500" },
            ].map(({ name, count: n, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-16 text-xs text-zinc-500">{name}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${color}`}
                    style={{ width: `${((n / (total || 1)) * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold text-zinc-300">{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top páginas */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Top páginas (30d)</p>
            <Link href="/admin/pages" className="text-[11px] text-zinc-500 hover:text-zinc-300">
              ver todas →
            </Link>
          </div>
          {topPages.length === 0 ? (
            <p className="py-6 text-center text-xs text-zinc-600">
              Sem dados de visualizações ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center text-xs font-bold text-zinc-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-zinc-200">/{p.slug}</p>
                    <p className="truncate text-[10px] text-zinc-500">{p.userName}</p>
                  </div>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-zinc-300">
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Cadastros recentes</p>
            <Link href="/admin/users" className="text-[11px] text-zinc-500 hover:text-zinc-300">
              ver todos →
            </Link>
          </div>
          <ul className="space-y-2">
            {recentSignups.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.image} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-zinc-700 text-[11px] font-bold text-zinc-300">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-200">{u.name}</p>
                  <p className="truncate text-[10px] text-zinc-500">{u.email}</p>
                </div>
                <span className="text-[10px] text-zinc-600">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-1 text-sm font-semibold text-zinc-300">Receita mensal estimada</p>
          <p className="text-4xl font-black text-emerald-400">
            R$ {mrr.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ARR projetado · R$ {arr.toLocaleString("pt-BR")}
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">Pro × R$ 29</span>
                <span className="font-semibold text-zinc-200">
                  R$ {(pro * 29).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${mrr ? ((pro * 29) / mrr) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">Business × R$ 79</span>
                <span className="font-semibold text-zinc-200">
                  R$ {(business * 79).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${mrr ? ((business * 79) / mrr) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
