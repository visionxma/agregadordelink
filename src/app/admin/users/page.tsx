import Link from "next/link";
import { db } from "@/lib/db";
import { user, subscription, page } from "@/lib/db/schema";
import { eq, ilike, desc, count, sql } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "../lib";
import { AdminUserActions } from "./user-actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q ?? "";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      plan: subscription.plan,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt,
      pageCount: sql<number>`(select count(*) from "page" where "page"."user_id" = ${user.id})`.as("page_count"),
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(q ? ilike(user.email, `%${q}%`) : undefined)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .where(q ? ilike(user.email, `%${q}%`) : undefined);

  const totalPages = Math.ceil(total / limit);

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Usuários</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{total} usuários cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por email..."
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
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
                    <div>
                      <p className="font-medium text-zinc-200">{row.name}</p>
                      <p className="text-xs text-zinc-500">{row.email}</p>
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
                  <AdminUserActions userId={row.id} userName={row.name} currentPlan={(row.plan ?? "free") as "free" | "pro" | "business"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-500">Nenhum usuário encontrado.</div>
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
