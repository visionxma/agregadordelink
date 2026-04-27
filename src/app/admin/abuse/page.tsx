import Link from "next/link";
import { db } from "@/lib/db";
import { abuseReport, page, user } from "@/lib/db/schema";
import { eq, desc, count, and, type SQL } from "drizzle-orm";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminAbuseActions } from "./abuse-actions";

export default async function AdminAbusePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filterStatus = params.status ?? "pending";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const filters: (SQL | undefined)[] = [];
  if (filterStatus !== "all") {
    filters.push(eq(abuseReport.status, filterStatus as "pending" | "reviewed" | "dismissed"));
  }
  const whereClause = filters.length ? and(...filters.filter((f): f is SQL => !!f)) : undefined;

  const [rows, [{ total }], [{ pendingCount }], [{ reviewedCount }], [{ dismissedCount }]] = await Promise.all([
    db
      .select({
        id: abuseReport.id,
        pageId: abuseReport.pageId,
        reporterEmail: abuseReport.reporterEmail,
        reason: abuseReport.reason,
        description: abuseReport.description,
        status: abuseReport.status,
        createdAt: abuseReport.createdAt,
        resolvedAt: abuseReport.resolvedAt,
        pageSlug: page.slug,
        pageTitle: page.title,
        pagePublished: page.published,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerId: user.id,
      })
      .from(abuseReport)
      .leftJoin(page, eq(page.id, abuseReport.pageId))
      .leftJoin(user, eq(user.id, page.userId))
      .where(whereClause)
      .orderBy(desc(abuseReport.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(abuseReport).where(whereClause),
    db.select({ pendingCount: count() }).from(abuseReport).where(eq(abuseReport.status, "pending")),
    db.select({ reviewedCount: count() }).from(abuseReport).where(eq(abuseReport.status, "reviewed")),
    db.select({ dismissedCount: count() }).from(abuseReport).where(eq(abuseReport.status, "dismissed")),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const FILTERS = [
    { val: "pending", label: `Pendentes (${pendingCount})` },
    { val: "reviewed", label: `Revisadas (${reviewedCount})` },
    { val: "dismissed", label: `Descartadas (${dismissedCount})` },
    { val: "all", label: "Todas" },
  ];

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300",
    reviewed: "bg-emerald-500/20 text-emerald-300",
    dismissed: "bg-zinc-700 text-zinc-400",
  };

  const buildHref = (overrides: Record<string, string | number | null>) => {
    const base: Record<string, string> = { status: filterStatus };
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "" || v === undefined) delete base[k];
      else base[k] = String(v);
    }
    const qs = new URLSearchParams(base).toString();
    return qs ? `?${qs}` : "?";
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
          <ShieldAlert className="size-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Denúncias</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Revise páginas reportadas por usuários.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.val}
            href={buildHref({ status: f.val, page: null })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === f.val
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`rounded-xl border p-4 ${
              row.status === "pending"
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-semibold ${
                  statusBadge[row.status ?? "pending"]
                }`}
              >
                {row.status}
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">
                {row.reason}
              </span>
              <span className="text-zinc-500">
                {new Date(row.createdAt).toLocaleString("pt-BR")}
              </span>
              {row.reporterEmail && (
                <span className="text-zinc-500">
                  por <span className="text-zinc-300">{row.reporterEmail}</span>
                </span>
              )}
            </div>

            {row.description && (
              <p className="mb-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-2 text-xs text-zinc-300">
                {row.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
              {row.pageSlug ? (
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <a
                      href={`https://linkbiobr.com/${row.pageSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono font-semibold text-zinc-200 hover:text-white"
                    >
                      /{row.pageSlug}
                      <ExternalLink className="size-3" />
                    </a>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        row.pagePublished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {row.pagePublished ? "Publicada" : "Despublicada"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-zinc-500">{row.pageTitle}</p>
                  {row.ownerEmail && (
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(row.ownerEmail)}`}
                      className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300"
                    >
                      Dono: <span className="text-zinc-300">{row.ownerName}</span>
                      <span>·</span>
                      <span>{row.ownerEmail}</span>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="flex-1 text-xs text-zinc-500">Página removida</p>
              )}

              <AdminAbuseActions
                reportId={row.id}
                pageId={row.pageId}
                status={row.status ?? "pending"}
              />
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center">
            <ShieldAlert className="mx-auto mb-2 size-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Nenhuma denúncia nesta categoria.</p>
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
