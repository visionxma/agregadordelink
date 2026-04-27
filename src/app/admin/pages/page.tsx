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

  const filterChip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
      active
        ? "border-primary/40 bg-primary/10 text-primary shadow-ios-sm"
        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-[-0.02em] sm:text-4xl">Páginas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ownerName && (
            <>
              Filtrando por <span className="font-semibold text-foreground">{ownerName.name}</span> ·{" "}
            </>
          )}
          {total.toLocaleString("pt-BR")} página(s)
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-ios-sm">
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por slug ou título..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {filterUserId && <input type="hidden" name="userId" value={filterUserId} />}
          {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
          {filterDomain && <input type="hidden" name="domain" value={filterDomain} />}
          {sortKey !== "updated" && <input type="hidden" name="sort" value={sortKey} />}
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-ios-sm transition-all hover:opacity-90"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link
              href="/admin/pages"
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground"
            >
              <X className="size-3" /> Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <Link key={`status-${f.val}`} href={buildHref({ status: f.val || null, page: null })} className={filterChip(filterStatus === f.val)}>
              {f.label}
            </Link>
          ))}
          <span className="mx-1 w-px self-stretch bg-border" />
          <Link
            href={buildHref({ domain: filterDomain === "yes" ? null : "yes", page: null })}
            className={`flex items-center gap-1 ${filterChip(filterDomain === "yes")}`}
          >
            <Globe className="size-3" /> Com domínio próprio
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
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
              className={`rounded-md px-2 py-0.5 ${
                sortKey === s.val ? "bg-muted text-foreground" : "hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-ios-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Página</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dono</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Blocos</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Views (30d)</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Atualizado</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-foreground">/{row.slug}</span>
                    <a
                      href={`https://linkbiobr.com/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{row.title}</p>
                  {row.customDomain && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      <Globe className="size-2.5" />
                      {row.customDomain}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users?q=${encodeURIComponent(row.userEmail)}`} className="hover:underline">
                    <p className="text-xs font-medium text-foreground">{row.userName}</p>
                    <p className="text-[11px] text-muted-foreground">{row.userEmail}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      row.published
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.published ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{row.blockCount}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-foreground">
                  {Number(row.views30d).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
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
          <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma página encontrada.</div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-3 shadow-ios-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-foreground">/{row.slug}</span>
                  <a
                    href={`https://linkbiobr.com/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="truncate text-xs text-muted-foreground">{row.title}</p>
                <p className="mt-1 truncate text-[11px] text-foreground/80">{row.userName} · {row.userEmail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      row.published
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.published ? "Publicada" : "Rascunho"}
                  </span>
                  <span className="text-muted-foreground">{row.blockCount} blocos</span>
                  <span className="text-muted-foreground">
                    {Number(row.views30d).toLocaleString("pt-BR")} views (30d)
                  </span>
                </div>
              </div>
              <AdminPageActions pageId={row.id} currentSlug={row.slug} published={row.published} />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground shadow-ios-sm">
            Nenhuma página encontrada.
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
