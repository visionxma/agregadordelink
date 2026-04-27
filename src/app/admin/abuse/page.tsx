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
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    reviewed: "bg-primary/15 text-primary",
    dismissed: "bg-muted text-muted-foreground",
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

  const filterChip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "border-primary/40 bg-primary/10 text-primary shadow-ios-sm"
        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
    }`;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 shadow-ios-sm">
          <ShieldAlert className="size-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-[-0.02em] sm:text-4xl">Denúncias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise páginas reportadas por usuários.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.val}
            href={buildHref({ status: f.val, page: null })}
            className={filterChip(filterStatus === f.val)}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`rounded-2xl border p-4 shadow-ios-sm ${
              row.status === "pending"
                ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent"
                : "border-border bg-card"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-bold ${
                  statusBadge[row.status ?? "pending"]
                }`}
              >
                {row.status}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                {row.reason}
              </span>
              <span className="text-muted-foreground">
                {new Date(row.createdAt).toLocaleString("pt-BR")}
              </span>
              {row.reporterEmail && (
                <span className="text-muted-foreground">
                  por <span className="font-medium text-foreground">{row.reporterEmail}</span>
                </span>
              )}
            </div>

            {row.description && (
              <p className="mb-3 rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground">
                {row.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              {row.pageSlug ? (
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <a
                      href={`https://linkbiobr.com/${row.pageSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono font-bold text-foreground hover:text-primary"
                    >
                      /{row.pageSlug}
                      <ExternalLink className="size-3" />
                    </a>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        row.pagePublished
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.pagePublished ? "Publicada" : "Despublicada"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{row.pageTitle}</p>
                  {row.ownerEmail && (
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(row.ownerEmail)}`}
                      className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Dono: <span className="font-medium text-foreground">{row.ownerName}</span>
                      <span>·</span>
                      <span>{row.ownerEmail}</span>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="flex-1 text-xs text-muted-foreground">Página removida</p>
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
          <div className="rounded-2xl border border-border bg-card py-12 text-center shadow-ios-sm">
            <ShieldAlert className="mx-auto mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma denúncia nesta categoria.</p>
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
