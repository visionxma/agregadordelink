"use client";

import { useState, useTransition } from "react";
import { ImageIcon, Search, Trash2, User, X } from "lucide-react";
import type { Page } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarPicker } from "@/components/avatar-picker";
import { PhotoPicker } from "@/components/photo-picker";
import { ImageUploadButton } from "@/components/image-upload-button";
import { SlugInput } from "@/components/slug-input";
import { toast } from "sonner";
import { deletePage, updatePage } from "../../actions";

export function PageSettingsForm({ page }: { page: Page }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(page.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(page.coverUrl ?? "");
  const [slug, setSlug] = useState(page.slug);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const themeFlags = page.theme as { hideBranding?: boolean; coverFade?: boolean; avatarPlain?: boolean; coverPlain?: boolean } | null;
  const [hideBranding, setHideBranding] = useState(Boolean(themeFlags?.hideBranding));
  const [coverFade, setCoverFade] = useState(Boolean(themeFlags?.coverFade));
  const [avatarPlain, setAvatarPlain] = useState(Boolean(themeFlags?.avatarPlain));
  const [coverPlain, setCoverPlain] = useState(Boolean(themeFlags?.coverPlain));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("avatarUrl", avatarUrl);
    formData.set("coverUrl", coverUrl);
    formData.set("slug", slug);
    formData.set("hideBranding", hideBranding ? "1" : "0");
    formData.set("coverFade", coverFade ? "1" : "0");
    formData.set("avatarPlain", avatarPlain ? "1" : "0");
    formData.set("coverPlain", coverPlain ? "1" : "0");
    startTransition(async () => {
      const result = await updatePage(page.id, formData);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if (result?.ok) {
        setSaved(true);
        if (slug !== page.slug) toast.success(`URL atualizada para /${slug}`);
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
            <Label>URL da página</Label>
            <SlugInput
              value={slug}
              onChange={setSlug}
              ignorePageId={page.id}
            />
            <p className="text-[11px] text-muted-foreground">
              Mudar a URL vai quebrar links antigos. Use com cuidado.
            </p>
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
            {coverUrl && (
              <>
                <label className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={coverPlain}
                    onChange={(e) => setCoverPlain(e.target.checked)}
                    className="mt-0.5 size-4 rounded"
                  />
                  <span>
                    <span className="text-sm">Capa sem fundo (PNG transparente)</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Preserva a transparência e proporção original da imagem — ideal pra logos/banners PNG.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={coverFade}
                    onChange={(e) => setCoverFade(e.target.checked)}
                    className="mt-0.5 size-4 rounded"
                  />
                  <span>
                    <span className="text-sm">Fade na parte de baixo da capa</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Mistura a capa com a cor de fundo da página — visual mais clean.
                    </span>
                  </span>
                </label>
              </>
            )}
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
            {avatarUrl && (
              <label className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={avatarPlain}
                  onChange={(e) => setAvatarPlain(e.target.checked)}
                  className="mt-0.5 size-4 rounded"
                />
                <span>
                  <span className="text-sm">Foto sem bordas e sem fundo</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Mostra a imagem na proporção original (ideal pra logos PNG transparentes).
                  </span>
                </span>
              </label>
            )}
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

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={hideBranding}
              onChange={(e) => setHideBranding(e.target.checked)}
              className="mt-0.5 size-4 rounded"
            />
            <span>
              <span className="text-sm">Ocultar &quot;Feito com LinkBio BR&quot;</span>
              <span className="block text-[11px] text-muted-foreground">
                Disponível no plano Pro ou superior. Por padrão a marca aparece no rodapé.
              </span>
            </span>
          </label>

          {/* SEO */}
          <div className="space-y-4 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Search className="size-3.5" />
              SEO
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seoTitle" className="text-xs">
                  Título para buscadores
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  máx. 60 caracteres
                </span>
              </div>
              <Input
                id="seoTitle"
                name="seoTitle"
                defaultValue={page.seoTitle ?? ""}
                maxLength={60}
                placeholder={page.title}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Deixe vazio para usar o título da página.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seoDescription" className="text-xs">
                  Descrição para buscadores
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  máx. 160 caracteres
                </span>
              </div>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={page.seoDescription ?? ""}
                maxLength={160}
                rows={2}
                placeholder={page.description ?? "Descreva sua página para aparecer no Google"}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImageUrl" className="text-xs">
                Imagem para redes sociais (OG Image)
              </Label>
              <Input
                id="ogImageUrl"
                name="ogImageUrl"
                type="url"
                defaultValue={page.ogImageUrl ?? ""}
                placeholder="https://... (1200×630px recomendado)"
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Aparece ao compartilhar no WhatsApp, Instagram etc. Gerada
                automaticamente se vazio.
              </p>
            </div>
          </div>

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
