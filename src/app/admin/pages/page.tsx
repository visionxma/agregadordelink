import Link from "next/link";
import { db } from "@/lib/db";
import { page, user } from "@/lib/db/schema";
import { eq, ilike, desc, count, or } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminPageActions } from "./page-actions";

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; userId?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q ?? "";
  const filterUserId = params.userId ?? "";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const whereClause = filterUserId
    ? eq(page.userId, filterUserId)
    : q
      ? or(ilike(page.slug, `%${q}%`), ilike(page.title, `%${q}%`))
      : undefined;

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
    })
    .from(page)
    .innerJoin(user, eq(user.id, page.userId))
    .where(whereClause)
    .orderBy(desc(page.updatedAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(page).where(whereClause);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Páginas</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {filterUserId ? `Filtrando por usuário — ` : ""}{total} páginas
            {filterUserId && (
              <Link href="/admin/pages" className="ml-2 text-blue-400 hover:underline">limpar filtro</Link>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      {!filterUserId && (
        <form className="mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por slug ou título..."
            className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </form>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Slug / Título</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Dono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Atualizado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <tr key={row.id} className="bg-zinc-900 transition-colors hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
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
                      <p className="text-xs text-zinc-500">{row.title}</p>
                      {row.customDomain && (
                        <p className="text-[10px] text-blue-400">{row.customDomain}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users?q=${row.userEmail}`} className="hover:underline">
                    <p className="text-xs text-zinc-300">{row.userName}</p>
                    <p className="text-[11px] text-zinc-500">{row.userEmail}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    row.published
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-700/50 text-zinc-400"
                  }`}>
                    {row.published ? "Publicada" : "Rascunho"}
                  </span>
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
          <div className="py-12 text-center text-sm text-zinc-500">Nenhuma página encontrada.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>Página {pageNum} de {totalPages}</span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link href={`?q=${q}&page=${pageNum - 1}`} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500 hover:text-zinc-300">
                Anterior
              </Link>
            )}
            {pageNum < totalPages && (
              <Link href={`?q=${q}&page=${pageNum + 1}`} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500 hover:text-zinc-300">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
