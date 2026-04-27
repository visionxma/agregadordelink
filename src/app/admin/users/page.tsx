import Link from "next/link";
import { db } from "@/lib/db";
import { user, subscription } from "@/lib/db/schema";
import { eq, ilike, desc, asc, count, sql, and, or, type SQL } from "drizzle-orm";
import { Search, X, BadgeCheck } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminUserActions } from "./user-actions";

const SORT_MAP: Record<string, { col: SQL | typeof user.createdAt | typeof user.name | typeof user.email; dir: "asc" | "desc" }> = {
  newest: { col: user.createdAt, dir: "desc" },
  oldest: { col: user.createdAt, dir: "asc" },
  name: { col: user.name, dir: "asc" },
  email: { col: user.email, dir: "asc" },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; plan?: string; status?: string; sort?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const filterPlan = params.plan ?? "";
  const filterStatus = params.status ?? "";
  const sortKey = (params.sort && SORT_MAP[params.sort]) ? params.sort : "newest";
  const sort = SORT_MAP[sortKey];
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const filters: (SQL | undefined)[] = [];
  if (q) filters.push(or(ilike(user.email, `%${q}%`), ilike(user.name, `%${q}%`)));
  if (filterPlan) filters.push(eq(subscription.plan, filterPlan as "free" | "pro" | "business"));
  if (filterStatus === "free") {
    filters.push(sql`${subscription.id} is null`);
  } else if (filterStatus) {
    filters.push(eq(subscription.status, filterStatus));
  }
  const whereClause = filters.length ? and(...filters.filter((f): f is SQL => !!f)) : undefined;

  const orderByExpr = sort.dir === "desc" ? desc(sort.col as SQL) : asc(sort.col as SQL);

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      plan: subscription.plan,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt,
      pageCount: sql<number>`(select count(*) from "page" where "page"."user_id" = ${user.id})`.as("page_count"),
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(whereClause)
    .orderBy(orderByExpr)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const planBadge: Record<string, string> = {
    pro: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    business: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    free: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
  };

  const statusBadge: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-300",
    trial: "bg-amber-500/20 text-amber-300",
    canceled: "bg-red-500/20 text-red-300",
    past_due: "bg-orange-500/20 text-orange-300",
  };

  const buildHref = (overrides: Record<string, string | number | null>) => {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (filterPlan) base.plan = filterPlan;
    if (filterStatus) base.status = filterStatus;
    if (sortKey !== "newest") base.sort = sortKey;
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "" || v === undefined) delete base[k];
      else base[k] = String(v);
    }
    const qs = new URLSearchParams(base).toString();
    return qs ? `?${qs}` : "?";
  };

  const PLAN_FILTERS = [
    { val: "", label: "Todos" },
    { val: "free", label: "Free" },
    { val: "pro", label: "Pro" },
    { val: "business", label: "Business" },
  ];
  const STATUS_FILTERS = [
    { val: "", label: "Todos status" },
    { val: "active", label: "Ativos" },
    { val: "trial", label: "Trial" },
    { val: "canceled", label: "Cancelados" },
    { val: "past_due", label: "Atrasados" },
    { val: "free", label: "Sem assinatura" },
  ];

  const hasFilters = !!(q || filterPlan || filterStatus);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Usuários</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total.toLocaleString("pt-BR")} usuário(s){hasFilters ? " com os filtros atuais" : ""}
          </p>
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
              placeholder="Buscar por nome ou email..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {filterPlan && <input type="hidden" name="plan" value={filterPlan} />}
          {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
          {sortKey !== "newest" && <input type="hidden" name="sort" value={sortKey} />}
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              <X className="size-3" /> Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          {PLAN_FILTERS.map((f) => (
            <Link
              key={`plan-${f.val}`}
              href={buildHref({ plan: f.val || null, page: null })}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterPlan === f.val
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
          <span className="mx-1 w-px self-stretch bg-zinc-800" />
          {STATUS_FILTERS.map((f) => (
            <Link
              key={`status-${f.val}`}
              href={buildHref({ status: f.val || null, page: null })}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterStatus === f.val
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span>Ordenar:</span>
          {[
            { val: "newest", label: "Mais recentes" },
            { val: "oldest", label: "Mais antigos" },
            { val: "name", label: "Nome A→Z" },
            { val: "email", label: "Email A→Z" },
          ].map((s) => (
            <Link
              key={s.val}
              href={buildHref({ sort: s.val === "newest" ? null : s.val, page: null })}
              className={`rounded px-2 py-0.5 ${
                sortKey === s.val
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s.label}
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
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Páginas</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Cadastro</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-900 transition-colors hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.image} alt="" className="size-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                        {row.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate font-medium text-zinc-200">
                        {row.name}
                        {row.emailVerified && (
                          <BadgeCheck className="size-3.5 text-emerald-400" aria-label="Email verificado" />
                        )}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.status ? (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[row.status] ?? "bg-zinc-700 text-zinc-400"}`}>
                      {row.status === "trial" && row.trialEndsAt
                        ? `trial (${Math.max(0, Math.ceil((row.trialEndsAt.getTime() - Date.now()) / 86400000))}d)`
                        : row.status}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pages?userId=${row.id}`}
                    className="text-zinc-300 hover:text-white hover:underline"
                  >
                    {row.pageCount}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-500">
                  {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions
                    userId={row.id}
                    userName={row.name}
                    currentPlan={(row.plan ?? "free") as "free" | "pro" | "business"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="bg-zinc-900 py-12 text-center text-sm text-zinc-500">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-start gap-3">
              {row.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.image} alt="" className="size-8 rounded-full object-cover" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                  {row.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-medium text-zinc-200">
                  {row.name}
                  {row.emailVerified && <BadgeCheck className="size-3 text-emerald-400" />}
                </p>
                <p className="truncate text-xs text-zinc-500">{row.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${planBadge[row.plan ?? "free"]}`}>
                    {(row.plan ?? "free").toUpperCase()}
                  </span>
                  {row.status && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[row.status] ?? "bg-zinc-700 text-zinc-400"}`}>
                      {row.status}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    {row.pageCount} pág. · {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <AdminUserActions
                userId={row.id}
                userName={row.name}
                currentPlan={(row.plan ?? "free") as "free" | "pro" | "business"}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center text-sm text-zinc-500">
            Nenhum usuário encontrado.
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
