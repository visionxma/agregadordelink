"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ChevronDown } from "lucide-react";
import { adminDeleteUser, adminSetUserPlan } from "../actions";

export function AdminUserActions({
  userId,
  userName,
  currentPlan,
}: {
  userId: string;
  userName: string;
  currentPlan: "free" | "pro" | "business";
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function setPlan(plan: "free" | "pro" | "business") {
    setOpen(false);
    startTransition(async () => {
      const res = await adminSetUserPlan(userId, plan);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success(`Plano alterado para ${plan.toUpperCase()}`);
      router.refresh();
    });
  }

  function deleteUser() {
    if (!confirm(`Excluir o usuário "${userName}"? Esta ação é irreversível e apaga todas as páginas.`)) return;
    startTransition(async () => {
      const res = await adminDeleteUser(userId);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success("Usuário excluído.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Plan selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
        >
          Plano <ChevronDown className="size-3" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-10 mt-1 min-w-[110px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            {(["free", "pro", "business"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-zinc-800 ${p === currentPlan ? "text-emerald-400" : "text-zinc-300"}`}
              >
                {p === currentPlan && <span className="size-1.5 rounded-full bg-emerald-400" />}
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={deleteUser}
        disabled={pending}
        title="Excluir usuário"
        className="flex size-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
