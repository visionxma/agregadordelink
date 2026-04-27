import Link from "next/link";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { eq, desc, count, ilike, and, sql, type SQL } from "drizzle-orm";
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
    pro: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    business: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    free: "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30",
  };

  const statusBadge: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-300",
    trial: "bg-amber-500/20 text-amber-300",
    canceled: "bg-red-500/20 text-red-300",
    past_due: "bg-orange-500/20 text-orange-300",
    pending: "bg-zinc-700 text-zinc-400",
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black sm:text-3xl">Assinaturas</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {total.toLocaleString("pt-BR")} registro(s) com os filtros atuais
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-[11px] text-zinc-500">Ativas</p>
          <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-[11px] text-zinc-500">Em trial</p>
          <p className="text-2xl font-black text-amber-400">{trialCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${pastDueCount > 0 ? "border-orange-500/30 bg-orange-500/5" : "border-zinc-800 bg-zinc-900"}`}>
          <p className="flex items-center gap-1 text-[11px] text-zinc-500">
            {pastDueCount > 0 && <AlertCircle className="size-3 text-orange-400" />}
            Atrasadas
          </p>
          <p className={`text-2xl font-black ${pastDueCount > 0 ? "text-orange-400" : "text-zinc-300"}`}>
            {pastDueCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-[11px] text-zinc-500">MRR</p>
          <p className="text-2xl font-black text-emerald-400">R$ {mrr.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por email..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
          {filterPlan && <input type="hidden" name="plan" value={filterPlan} />}
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              <X className="size-3" /> Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <Link
              key={`status-${s.val}`}
              href={buildHref({ status: s.val || null, page: null })}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterStatus === s.val
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {s.label}
            </Link>
          ))}
          <span className="mx-1 w-px self-stretch bg-zinc-800" />
          {PLANS.map((p) => (
            <Link
              key={`plan-${p.val}`}
              href={buildHref({ plan: p.val || null, page: null })}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterPlan === p.val
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-zinc-800 sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Plano</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Próx. cobrança</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Gateway ID</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-900 transition-colors hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/users?q=${encodeURIComponent(row.userEmail)}`} className="hover:underline">
                    <p className="text-sm font-medium text-zinc-200">{row.userName}</p>
                    <p className="text-xs text-zinc-500">{row.userEmail}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.status ? (
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[row.status] ?? "bg-zinc-700 text-zinc-400"}`}>
                        {row.status}
                      </span>
                      {row.cancelAtPeriodEnd && (
                        <p className="mt-0.5 text-[10px] text-amber-500">cancela no fim</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {row.status === "trial" && row.trialEndsAt
                    ? <span className="text-amber-400">Trial até {new Date(row.trialEndsAt).toLocaleDateString("pt-BR")}</span>
                    : row.currentPeriodEnd
                      ? new Date(row.currentPeriodEnd).toLocaleDateString("pt-BR")
                      : <span className="text-zinc-600">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {row.gatewaySubscriptionId ? (
                    <span className="font-mono text-[10px] text-zinc-500">{row.gatewaySubscriptionId.slice(0, 16)}…</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
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
          <div className="bg-zinc-900 py-12 text-center text-sm text-zinc-500">
            Nenhuma assinatura encontrada.
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-200">{row.userName}</p>
                <p className="truncate text-xs text-zinc-500">{row.userEmail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                  {row.status && (
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${statusBadge[row.status] ?? "bg-zinc-700 text-zinc-400"}`}>
                      {row.status}
                    </span>
                  )}
                  {row.currentPeriodEnd && (
                    <span className="text-zinc-500">
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center text-sm text-zinc-500">
            Nenhuma assinatura encontrada.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>Página {pageNum} de {totalPages}</span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link href={buildHref({ page: pageNum - 1 })} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500 hover:text-zinc-300">
                Anterior
              </Link>
            )}
            {pageNum < totalPages && (
              <Link href={buildHref({ page: pageNum + 1 })} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500 hover:text-zinc-300">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
