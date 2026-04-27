import Link from "next/link";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { eq, desc, count, ilike, and, type SQL } from "drizzle-orm";
import { Search, X, AlertCircle } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminSubActions } from "./sub-actions";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; plan?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const filterStatus = params.status ?? "";
  const filterPlan = params.plan ?? "";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const filters: (SQL | undefined)[] = [];
  if (q) filters.push(ilike(user.email, `%${q}%`));
  if (filterStatus) filters.push(eq(subscription.status, filterStatus));
  if (filterPlan) filters.push(eq(subscription.plan, filterPlan as "free" | "pro" | "business"));
  const whereClause = filters.length ? and(...filters.filter((f): f is SQL => !!f)) : undefined;

  const [rows, [{ total }], [{ activeCount }], [{ trialCount }], [{ pastDueCount }], mrrRow] = await Promise.all([
    db
      .select({
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        gatewaySubscriptionId: subscription.gatewaySubscriptionId,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(subscription)
      .innerJoin(user, eq(user.id, subscription.userId))
      .where(whereClause)
      .orderBy(desc(subscription.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(subscription)
      .innerJoin(user, eq(user.id, subscription.userId))
      .where(whereClause),
    db.select({ activeCount: count() }).from(subscription).where(eq(subscription.status, "active")),
    db.select({ trialCount: count() }).from(subscription).where(eq(subscription.status, "trial")),
    db.select({ pastDueCount: count() }).from(subscription).where(eq(subscription.status, "past_due")),
    db
      .select({ plan: subscription.plan, c: count() })
      .from(subscription)
      .where(eq(subscription.status, "active"))
      .groupBy(subscription.plan),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  let mrr = 0;
  for (const row of mrrRow) {
    if (row.plan === "pro") mrr += Number(row.c) * 29;
    if (row.plan === "business") mrr += Number(row.c) * 79;
  }

  const planBadge: Record<string, string> = {
    pro: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
    business: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    free: "bg-muted text-muted-foreground border border-border",
  };

  const statusBadge: Record<string, string> = {
    active: "bg-primary/15 text-primary",
    trial: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    canceled: "bg-destructive/15 text-destructive",
    past_due: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    pending: "bg-muted text-muted-foreground",
  };

  const STATUSES = [
    { val: "", label: "Todos" },
    { val: "active", label: "Ativas" },
    { val: "trial", label: "Trial" },
    { val: "canceled", label: "Canceladas" },
    { val: "past_due", label: "Atrasadas" },
    { val: "pending", label: "Pendentes" },
  ];
  const PLANS = [
    { val: "", label: "Todos planos" },
    { val: "pro", label: "Pro" },
    { val: "business", label: "Business" },
    { val: "free", label: "Free" },
  ];

  const buildHref = (overrides: Record<string, string | number | null>) => {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (filterStatus) base.status = filterStatus;
    if (filterPlan) base.plan = filterPlan;
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "" || v === undefined) delete base[k];
      else base[k] = String(v);
    }
    const qs = new URLSearchParams(base).toString();
    return qs ? `?${qs}` : "?";
  };

  const hasFilters = !!(q || filterStatus || filterPlan);

  const filterChip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
      active
        ? "border-primary/40 bg-primary/10 text-primary shadow-ios-sm"
        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-[-0.02em] sm:text-4xl">Assinaturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total.toLocaleString("pt-BR")} registro(s) com os filtros atuais
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-ios-sm">
          <p className="text-[11px] font-medium text-muted-foreground">Ativas</p>
          <p className="text-2xl font-black text-primary">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-ios-sm">
          <p className="text-[11px] font-medium text-muted-foreground">Em trial</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{trialCount}</p>
        </div>
        <div
          className={`rounded-2xl border p-4 shadow-ios-sm ${
            pastDueCount > 0
              ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
              : "border-border bg-card"
          }`}
        >
          <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            {pastDueCount > 0 && <AlertCircle className="size-3 text-orange-500" />}
            Atrasadas
          </p>
          <p
            className={`text-2xl font-black ${
              pastDueCount > 0 ? "text-orange-600 dark:text-orange-400" : "text-foreground"
            }`}
          >
            {pastDueCount}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/15 p-4 shadow-ios-sm">
          <p className="text-[11px] font-medium text-muted-foreground">MRR</p>
          <p className="text-2xl font-black">
            <span className="brand-gradient-text">R$ {mrr.toLocaleString("pt-BR")}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-ios-sm">
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por email..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
          {filterPlan && <input type="hidden" name="plan" value={filterPlan} />}
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-ios-sm transition-all hover:opacity-90"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground"
            >
              <X className="size-3" /> Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <Link key={`status-${s.val}`} href={buildHref({ status: s.val || null, page: null })} className={filterChip(filterStatus === s.val)}>
              {s.label}
            </Link>
          ))}
          <span className="mx-1 w-px self-stretch bg-border" />
          {PLANS.map((p) => (
            <Link key={`plan-${p.val}`} href={buildHref({ plan: p.val || null, page: null })} className={filterChip(filterPlan === p.val)}>
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-ios-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Usuário</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plano</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Próx. cobrança</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gateway ID</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/users?q=${encodeURIComponent(row.userEmail)}`} className="hover:underline">
                    <p className="text-sm font-semibold text-foreground">{row.userName}</p>
                    <p className="text-xs text-muted-foreground">{row.userEmail}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.status ? (
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[row.status] ?? "bg-muted text-muted-foreground"}`}>
                        {row.status}
                      </span>
                      {row.cancelAtPeriodEnd && (
                        <p className="mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">cancela no fim</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.status === "trial" && row.trialEndsAt
                    ? <span className="font-medium text-amber-600 dark:text-amber-400">Trial até {new Date(row.trialEndsAt).toLocaleDateString("pt-BR")}</span>
                    : row.currentPeriodEnd
                      ? new Date(row.currentPeriodEnd).toLocaleDateString("pt-BR")
                      : <span>—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {row.gatewaySubscriptionId ? (
                    <span className="font-mono text-[10px] text-muted-foreground">{row.gatewaySubscriptionId.slice(0, 16)}…</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminSubActions
                    userId={row.userId}
                    currentPlan={(row.plan ?? "free") as "free" | "pro" | "business"}
                    status={row.status ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma assinatura encontrada.
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-3 shadow-ios-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{row.userName}</p>
                <p className="truncate text-xs text-muted-foreground">{row.userEmail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`rounded-full px-2 py-0.5 font-bold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                  {row.status && (
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${statusBadge[row.status] ?? "bg-muted text-muted-foreground"}`}>
                      {row.status}
                    </span>
                  )}
                  {row.currentPeriodEnd && (
                    <span className="text-muted-foreground">
                      até {new Date(row.currentPeriodEnd).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
              <AdminSubActions
                userId={row.userId}
                currentPlan={(row.plan ?? "free") as "free" | "pro" | "business"}
                status={row.status ?? ""}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground shadow-ios-sm">
            Nenhuma assinatura encontrada.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {pageNum} de {totalPages}</span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link href={buildHref({ page: pageNum - 1 })} className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/30 hover:text-foreground">
                Anterior
              </Link>
            )}
            {pageNum < totalPages && (
              <Link href={buildHref({ page: pageNum + 1 })} className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/30 hover:text-foreground">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
