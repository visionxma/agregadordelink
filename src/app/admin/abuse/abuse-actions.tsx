"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, EyeOff } from "lucide-react";
import { adminResolveAbuse, adminResolveAbuseAndUnpublish } from "../actions";

export function AdminAbuseActions({
  reportId,
  pageId,
  status,
}: {
  reportId: string;
  pageId: string | null;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const isPending = status === "pending";

  function resolve(action: "reviewed" | "dismissed") {
    startTransition(async () => {
      const res = await adminResolveAbuse(reportId, action);
      if ("error" in res) {
        toast.error(res.error as string);
        return;
      }
      toast.success(action === "reviewed" ? "Marcada como revisada." : "Descartada.");
      router.refresh();
    });
  }

  function unpublishAndResolve() {
    if (!pageId) return;
    if (!confirm("Despublicar a página e marcar denúncia como revisada?")) return;
    startTransition(async () => {
      const res = await adminResolveAbuseAndUnpublish(reportId, pageId);
      if ("error" in res) {
        toast.error(res.error as string);
        return;
      }
      toast.success("Página despublicada e denúncia resolvida.");
      router.refresh();
    });
  }

  if (!isPending) {
    return <span className="text-[11px] font-medium text-muted-foreground">resolvida</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {pageId && (
        <button
          type="button"
          onClick={unpublishAndResolve}
          disabled={pending}
          title="Despublicar página e marcar como revisada"
          className="flex items-center gap-1 rounded-lg border border-orange-500/40 bg-orange-500/10 px-2.5 py-1.5 text-[10px] font-bold text-orange-700 shadow-ios-sm transition-colors hover:bg-orange-500/20 dark:text-orange-300 disabled:opacity-50"
        >
          <EyeOff className="size-3" /> Despublicar
        </button>
      )}
      <button
        type="button"
        onClick={() => resolve("reviewed")}
        disabled={pending}
        title="Marcar como revisada"
        className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary shadow-ios-sm transition-colors hover:bg-primary/20 disabled:opacity-50"
      >
        <Check className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => resolve("dismissed")}
        disabled={pending}
        title="Descartar denúncia"
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-ios-sm transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
