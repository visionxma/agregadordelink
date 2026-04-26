import { db } from "@/lib/db";
import { user, page, subscription } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";
import { Users, FileText, CreditCard, TrendingUp, Zap, Globe } from "lucide-react";
import { requireAdmin } from "./lib";

export default async function AdminPage() {
  await requireAdmin();

  const [[totalUsers], [totalPages], [publishedPages], subRows] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(page),
    db.select({ count: count() }).from(page).where(sql`${page.published} = true`),
    db.select({ plan: subscription.plan, status: subscription.status }).from(subscription),
  ]);

  const active = subRows.filter((s) => s.status === "active");
  const trials = subRows.filter((s) => s.status === "trial");
  const pro = active.filter((s) => s.plan === "pro").length;
  const business = active.filter((s) => s.plan === "business").length;
  const mrr = pro * 29 + business * 79;

  const stats = [
    { label: "Usuários", value: totalUsers?.count ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Páginas criadas", value: totalPages?.count ?? 0, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Páginas publicadas", value: publishedPages?.count ?? 0, icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Assinantes ativos", value: active.length, icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Em trial", value: trials.length, icon: Zap, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "MRR estimado", value: `R$ ${mrr}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">Dashboard</h1>
      <p className="mb-8 text-sm text-zinc-500">Visão geral da plataforma LinkBio BR.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className={`mb-3 flex size-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-zinc-100">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">Distribuição de planos</p>
          <div className="space-y-3">
            {[
              { name: "Free", count: (totalUsers?.count ?? 0) - active.length - trials.length, color: "bg-zinc-600" },
              { name: "Pro", count: pro, color: "bg-blue-500" },
              { name: "Business", count: business, color: "bg-purple-500" },
              { name: "Trial", count: trials.length, color: "bg-amber-500" },
            ].map(({ name, count: n, color }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-16 text-xs text-zinc-500">{name}</span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-zinc-800 h-2">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${color}`}
                    style={{ width: `${((n / (totalUsers?.count || 1)) * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-zinc-300">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">Receita mensal estimada</p>
          <p className="text-4xl font-black text-emerald-400">R$ {mrr}</p>
          <p className="mt-1 text-xs text-zinc-500">{pro} Pro × R$ 29 + {business} Business × R$ 79</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Pro ({pro})</span>
              <span className="text-zinc-300">R$ {pro * 29}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Business ({business})</span>
              <span className="text-zinc-300">R$ {business * 79}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
