"use client";

import { useState, useTransition } from "react";
import { ImageIcon, Trash2, User, X } from "lucide-react";
import type { Page } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarPicker } from "@/components/avatar-picker";
import { PhotoPicker } from "@/components/photo-picker";
import { ImageUploadButton } from "@/components/image-upload-button";
import { deletePage, updatePage } from "../../actions";

export function PageSettingsForm({ page }: { page: Page }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(page.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(page.coverUrl ?? "");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("avatarUrl", avatarUrl);
    formData.set("coverUrl", coverUrl);
    startTransition(async () => {
      const result = await updatePage(page.id, formData);
      if (result?.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={page.title}
              required
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (bio)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={page.description ?? ""}
              maxLength={200}
              rows={3}
              placeholder="Criador de conteúdo · SP"
            />
          </div>

          {/* CAPA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Capa (opcional)</Label>
              {coverUrl && (
                <button
                  type="button"
                  onClick={() => setCoverUrl("")}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
            {coverUrl ? (
              <div className="group relative aspect-[3/1] overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt=""
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white opacity-0 transition-opacity hover:opacity-100"
                >
                  Trocar capa
                </button>
                <button
                  type="button"
                  onClick={() => setCoverUrl("")}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCoverOpen(true)}
                className="flex aspect-[3/1] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ImageIcon className="mb-1 size-5" />
                Escolher do banco
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <ImageUploadButton
                onUploaded={setCoverUrl}
                label="Upload"
                className="w-full"
                crop="cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCoverOpen(true)}
              >
                Banco
              </Button>
            </div>
            <Input
              type="url"
              placeholder="ou cole uma URL"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* AVATAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Avatar (opcional)</Label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2">
                <ImageUploadButton
                  onUploaded={setAvatarUrl}
                  label="Upload"
                  crop="square"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarOpen(true)}
                >
                  Banco
                </Button>
              </div>
            </div>
            <Input
              type="url"
              placeholder="ou cole uma URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="text-xs"
            />
          </div>

          <label className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name="published"
              defaultChecked={page.published}
              className="size-4 rounded"
            />
            <span className="text-sm">Página pública</span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Salvando..." : saved ? "Salvo ✓" : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={pending}
              onClick={() => {
                if (confirm("Deletar esta página? Não dá pra desfazer.")) {
                  startTransition(() => deletePage(page.id));
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>

      <AvatarPicker
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onPick={(url) => setAvatarUrl(url)}
        selectedUrl={avatarUrl}
      />
      <PhotoPicker
        open={coverOpen}
        onClose={() => setCoverOpen(false)}
        onPick={(url) => setCoverUrl(url)}
        selectedUrl={coverUrl}
      />
    </Card>
  );
}
