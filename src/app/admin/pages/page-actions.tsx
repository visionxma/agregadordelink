"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { adminDeletePage, adminUpdatePageSlug, adminTogglePagePublished } from "../actions";

export function AdminPageActions({
  pageId,
  currentSlug,
  published,
}: {
  pageId: string;
  currentSlug: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(currentSlug);
  const router = useRouter();

  function saveSlug() {
    if (slug === currentSlug) { setEditing(false); return; }
    startTransition(async () => {
      const res = await adminUpdatePageSlug(pageId, slug);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success("Slug atualizado.");
      setEditing(false);
      router.refresh();
    });
  }

  function togglePublished() {
    startTransition(async () => {
      const res = await adminTogglePagePublished(pageId, !published);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success(published ? "Página despublicada." : "Página publicada.");
      router.refresh();
    });
  }

  function deletePage() {
    if (!confirm(`Excluir a página "/${currentSlug}"? Esta ação é irreversível.`)) return;
    startTransition(async () => {
      const res = await adminDeletePage(pageId);
      if ("error" in res) { toast.error(res.error as string); return; }
      toast.success("Página excluída.");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <span className="text-xs text-muted-foreground">/</span>
        <input
          autoFocus
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveSlug(); if (e.key === "Escape") setEditing(false); }}
          className="w-28 rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={saveSlug}
          disabled={pending}
          className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-ios-sm hover:opacity-90 disabled:opacity-50"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => { setSlug(currentSlug); setEditing(false); }}
          className="rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-ios-sm hover:border-primary/40 hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={pending}
        title="Editar slug"
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-ios-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={togglePublished}
        disabled={pending}
        title={published ? "Despublicar" : "Publicar"}
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-ios-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
      >
        {published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={deletePage}
        disabled={pending}
        title="Excluir página"
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-ios-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
