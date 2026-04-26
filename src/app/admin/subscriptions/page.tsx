import Link from "next/link";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { eq, desc, count, ilike, ne, isNotNull } from "drizzle-orm";
import { requireAdmin } from "../lib";
import { AdminSubActions } from "./sub-actions";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q ?? "";
  const filterStatus = params.status ?? "";
  const pageNum = Math.max(1, Number(params.page ?? 1));
  const limit = 30;
  const offset = (pageNum - 1) * limit;

  const rows = await db
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
    .where(
      q ? ilike(user.email, `%${q}%`) :
      filterStatus ? eq(subscription.status, filterStatus) :
      undefined
    )
    .orderBy(desc(subscription.updatedAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(subscription);
  const [{ activeCount }] = await db
    .select({ activeCount: count() })
    .from(subscription)
    .where(eq(subscription.status, "active"));
  const [{ trialCount }] = await db
    .select({ trialCount: count() })
    .from(subscription)
    .where(eq(subscription.status, "trial"));

  const totalPages = Math.ceil(rows.length === limit ? (pageNum * limit + 1) : pageNum * limit / limit);

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

  const STATUSES = ["active", "trial", "canceled", "past_due", "pending"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Assinaturas</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total} registros · {activeCount} ativas · {trialCount} em trial
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por email..."
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </form>
        <div className="flex gap-2">
          <Link
            href="/admin/subscriptions"
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${!filterStatus ? "border-zinc-500 bg-zinc-700 text-zinc-100" : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`}
          >
            Todos
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/subscriptions?status=${s}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s ? "border-zinc-500 bg-zinc-700 text-zinc-100" : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
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
                  <Link href={`/admin/users?q=${row.userEmail}`} className="hover:underline">
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
          <div className="py-12 text-center text-sm text-zinc-500">Nenhuma assinatura encontrada.</div>
        )}
      </div>

      {rows.length === limit && (
        <div className="mt-4 flex justify-end">
          <Link href={`?q=${q}&status=${filterStatus}&page=${pageNum + 1}`} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">
            Próxima página
          </Link>
        </div>
      )}
    </div>
  );
}
