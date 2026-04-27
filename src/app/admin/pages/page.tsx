import Link from "next/link";
import { db } from "@/lib/db";
import { page, user } from "@/lib/db/schema";
import { eq, ilike, desc, asc, count, or, and, sql, type SQL } from "drizzle-orm";
import { ExternalLink, Search, X, Globe } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminPageActions } from "./page-actions";

const SORT_MAP: Record<string, { col: SQL | typeof page.createdAt | typeof page.updatedAt | typeof page.slug; dir: "asc" | "desc" }> = {
  updated: { col: page.updatedAt, dir: "desc" },
  created: { col: page.createdAt, dir: "desc" },
  oldest: { col: page.createdAt, dir: "asc" },
  slug: { col: page.slug, dir: "asc" },
};

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; userId?: string; status?: string; domain?: string; sort?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const filterUserId = params.userId ?? "";
  const filterStatus = params.status ?? "";
  const filterDomain = params.domain ?? "";
  const sortKey = (params.sort && SORT_MAP[params.sort]) ? params.sort : "updated";
  const sort = SORT_MAP[sortKey];
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const filters: (SQL | undefined)[] = [];
  if (filterUserId) filters.push(eq(page.userId, filterUserId));
  if (q) filters.push(or(ilike(page.slug, `%${q}%`), ilike(page.title, `%${q}%`)));
  if (filterStatus === "published") filters.push(sql`${page.published} = true`);
  if (filterStatus === "draft") filters.push(sql`${page.published} = false`);
  if (filterDomain === "yes") filters.push(sql`${page.customDomain} is not null`);
  const whereClause = filters.length ? and(...filters.filter((f): f is SQL => !!f)) : undefined;

  const orderByExpr = sort.dir === "desc" ? desc(sort.col as SQL) : asc(sort.col as SQL);

  const ownerName = filterUserId
    ? (await db.select({ name: user.name, email: user.email }).from(user).where(eq(user.id, filterUserId)).limit(1))[0]
    : null;

  const rows = await db
    .select({
      id: page.id,
      slug: page.slug,
      title: page.title,
      published: page.published,
      customDomain: page.customDomain,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
      blockCount: sql<number>`(select count(*) from "block" where "block"."page_id" = ${page.id})`.as("block_count"),
      views30d: sql<number>`(select count(*) from "event" where "event"."page_id" = ${page.id} and "event"."type" = 'view' and "event"."created_at" >= now() - interval '30 days')`.as("views_30d"),
    })
    .from(page)
    .innerJoin(user, eq(user.id, page.userId))
    .where(whereClause)
    .orderBy(orderByExpr)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(page)
    .innerJoin(user, eq(user.id, page.userId))
    .where(whereClause);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildHref = (overrides: Record<string, string | number | null>) => {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (filterUserId) base.userId = filterUserId;
    if (filterStatus) base.status = filterStatus;
    if (filterDomain) base.domain = filterDomain;
    if (sortKey !== "updated") base.sort = sortKey;
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "" || v === undefined) delete base[k];
      else base[k] = String(v);
    }
    const qs = new URLSearchParams(base).toString();
    return qs ? `?${qs}` : "?";
  };

  const STATUS_FILTERS = [
    { val: "", label: "Todos" },
    { val: "published", label: "Publicadas" },
    { val: "draft", label: "Rascunhos" },
  ];

  const hasFilters = !!(q || filterStatus || filterDomain || filterUserId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Páginas</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {ownerName && (
              <>
                Filtrando por <span className="text-zinc-300">{ownerName.name}</span> ·{" "}
              </>
            )}
            {total.toLocaleString("pt-BR")} página(s)
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
              placeholder="Buscar por slug ou título..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {filterUserId && <input type="hidden" name="userId" value={filterUserId} />}
          {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
          {filterDomain && <input type="hidden" name="domain" value={filterDomain} />}
          {sortKey !== "updated" && <input type="hidden" name="sort" value={sortKey} />}
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link
              href="/admin/pages"
              className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              <X className="size-3" /> Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
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
          <span className="mx-1 w-px self-stretch bg-zinc-800" />
          <Link
            href={buildHref({ domain: filterDomain === "yes" ? null : "yes", page: null })}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              filterDomain === "yes"
                ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            <Globe className="size-3" /> Com domínio próprio
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span>Ordenar:</span>
          {[
            { val: "updated", label: "Atualizadas" },
            { val: "created", label: "Mais recentes" },
            { val: "oldest", label: "Mais antigas" },
            { val: "slug", label: "Slug A→Z" },
          ].map((s) => (
            <Link
              key={s.val}
              href={buildHref({ sort: s.val === "updated" ? null : s.val, page: null })}
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Página</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Dono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Blocos</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Views (30d)</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Atualizado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-900 transition-colors hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-semibold text-zinc-200">/{row.slug}</span>
                    <a
                      href={`https://linkbiobr.com/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-300"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <p className="truncate text-xs text-zinc-500">{row.title}</p>
                  {row.customDomain && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-400">
                      <Globe className="size-2.5" />
                      {row.customDomain}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users?q=${encodeURIComponent(row.userEmail)}`} className="hover:underline">
                    <p className="text-xs text-zinc-300">{row.userName}</p>
                    <p className="text-[11px] text-zinc-500">{row.userEmail}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    row.published ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-700/50 text-zinc-400"
                  }`}>
                    {row.published ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-400">{row.blockCount}</td>
                <td className="px-4 py-3 text-right text-xs text-zinc-300 font-semibold">
                  {Number(row.views30d).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-500">
                  {new Date(row.updatedAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminPageActions pageId={row.id} currentSlug={row.slug} published={row.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="bg-zinc-900 py-12 text-center text-sm text-zinc-500">Nenhuma página encontrada.</div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-semibold text-zinc-200">/{row.slug}</span>
                  <a
                    href={`https://linkbiobr.com/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="truncate text-xs text-zinc-500">{row.title}</p>
                <p className="mt-1 truncate text-[11px] text-zinc-400">{row.userName} · {row.userEmail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${
                    row.published ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-700/50 text-zinc-400"
                  }`}>
                    {row.published ? "Publicada" : "Rascunho"}
                  </span>
                  <span className="text-zinc-500">{row.blockCount} blocos</span>
                  <span className="text-zinc-500">{Number(row.views30d).toLocaleString("pt-BR")} views (30d)</span>
                </div>
              </div>
              <AdminPageActions pageId={row.id} currentSlug={row.slug} published={row.published} />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center text-sm text-zinc-500">
            Nenhuma página encontrada.
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
