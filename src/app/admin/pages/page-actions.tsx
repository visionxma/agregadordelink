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
        <span className="text-xs text-zinc-500">/</span>
        <input
          autoFocus
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveSlug(); if (e.key === "Escape") setEditing(false); }}
          className="w-28 rounded border border-zinc-600 bg-zinc-800 px-1.5 py-1 font-mono text-xs text-zinc-100 focus:border-zinc-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={saveSlug}
          disabled={pending}
          className="rounded-lg border border-emerald-700 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => { setSlug(currentSlug); setEditing(false); }}
          className="rounded-lg border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
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
        className="flex size-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 disabled:opacity-50"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={togglePublished}
        disabled={pending}
        title={published ? "Despublicar" : "Publicar"}
        className="flex size-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 disabled:opacity-50"
      >
        {published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={deletePage}
        disabled={pending}
        title="Excluir página"
        className="flex size-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
