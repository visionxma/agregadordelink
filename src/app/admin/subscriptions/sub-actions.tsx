"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, XCircle } from "lucide-react";
import { adminSetUserPlan, adminCancelSubscription } from "../actions";

export function AdminSubActions({
  userId,
  currentPlan,
  status,
}: {
  userId: string;
  currentPlan: "free" | "pro" | "business";
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function setPlan(plan: "free" | "pro" | "business") {
    setOpen(false);
    startTransition(async () => {
      const res = await adminSetUserPlan(userId, plan);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success(`Plano alterado para ${plan.toUpperCase()}`);
      router.refresh();
    });
  }

  function cancelSub() {
    if (!confirm("Cancelar esta assinatura e rebaixar para Free?")) return;
    startTransition(async () => {
      const res = await adminCancelSubscription(userId);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success("Assinatura cancelada.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-ios-sm transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
        >
          Plano <ChevronDown className="size-3" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-xl border border-border bg-card shadow-ios-lg">
            {(["free", "pro", "business"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                  p === currentPlan ? "text-primary" : "text-foreground"
                }`}
              >
                {p === currentPlan && <span className="size-1.5 rounded-full bg-primary" />}
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === "active" || status === "trial" ? (
        <button
          type="button"
          onClick={cancelSub}
          disabled={pending}
          title="Cancelar assinatura"
          className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-ios-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <XCircle className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
