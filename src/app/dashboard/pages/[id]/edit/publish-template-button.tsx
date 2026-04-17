"use client";

import { useState, useTransition } from "react";
import { Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { publishAsTemplate } from "../../actions";

const CATEGORIES = [
  "Criador",
  "Música",
  "Negócio local",
  "Comércio",
  "Mídia",
  "Portfólio",
  "Fitness",
  "Educação",
  "Beleza",
  "Outros",
];

export function PublishTemplateButton({
  pageId,
  suggestedName,
}: {
  pageId: string;
  suggestedName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({
    name: suggestedName,
    category: "Criador",
    emoji: "✨",
    description: "",
  });

  useBodyScrollLock(open);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await publishAsTemplate({
        pageId,
        name: form.name,
        category: form.category,
        emoji: form.emoji,
        description: form.description,
      });
      if ("error" in result) {
        setError(result.error ?? "Erro");
      } else {
        setPublished(true);
        setTimeout(() => {
          setPublished(false);
          setOpen(false);
        }, 2000);
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="Publicar como modelo"
      >
        <Share2 className="size-4" />
        <span className="hidden sm:inline">Publicar modelo</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center py-8">
            <div
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-ios-lg animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-bold">Publicar como modelo</h2>
                <p className="text-xs text-muted-foreground">
                  Outros usuários podem usar sua página como base.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                <X className="size-4" />
              </Button>
            </header>

            {published ? (
              <div className="p-10 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-lg font-bold">Modelo publicado!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aparece na galeria pra toda galera.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="emoji">Emoji</Label>
                    <Input
                      id="emoji"
                      value={form.emoji}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          emoji: e.target.value.slice(0, 4),
                        }))
                      }
                      maxLength={4}
                      className="h-11 text-center text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do modelo</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      maxLength={60}
                      required
                      className="h-11"
                      placeholder="Criador gamer vibe noite"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="flex h-11 w-full rounded-xl border border-input bg-card/70 px-3.5 text-sm shadow-ios-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    maxLength={120}
                    rows={2}
                    placeholder="Ideal pra streamer que faz live à noite"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Seus links, avatar e título não são compartilhados —
                  só o visual e a estrutura dos blocos.
                </p>

                {error && (
                  <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={pending || !form.name.trim()}
                  >
                    {pending ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
