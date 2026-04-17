"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Check, Flame, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { SlugInput } from "@/components/slug-input";
import { cn, slugify } from "@/lib/utils";
import type { PageTemplate } from "@/lib/templates";
import type { GalleryTemplate } from "@/lib/load-templates";
import { createPageFromTemplate } from "../actions";

export function TemplateWizard({
  templates,
  blank,
  categories,
}: {
  templates: GalleryTemplate[];
  blank: PageTemplate;
  categories: string[];
}) {
  const [selected, setSelected] = useState<PageTemplate | null>(null);

  if (!selected) {
    return (
      <TemplatePicker
        templates={templates}
        blank={blank}
        categories={categories}
        onPick={setSelected}
      />
    );
  }
  return (
    <NameForm template={selected} onBack={() => setSelected(null)} />
  );
}

function TemplatePicker({
  templates,
  blank,
  categories,
  onPick,
}: {
  templates: GalleryTemplate[];
  blank: PageTemplate;
  categories: string[];
  onPick: (t: PageTemplate) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("populares");
  const [search, setSearch] = useState("");

  // Populares: top 8 por usageCount + featured como fallback
  const popular = useMemo(() => {
    const scored = templates
      .map((t) => ({
        ...t,
        score:
          t.usageCount * 10 +
          (t.featured ? 50 : 0) +
          (t.source === "user" ? 5 : 0),
      }))
      .filter((t) => t.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8);
  }, [templates]);

  const filtered = useMemo(() => {
    let list = templates;
    if (activeCategory !== "populares" && activeCategory !== "todos") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, activeCategory, search]);

  const tabs = [
    { id: "populares", label: "🔥 Populares" },
    { id: "todos", label: "Todos" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div>
      <div className="mb-10 max-w-3xl">
        <h1 className="text-5xl font-black tracking-[-0.03em] sm:text-6xl">
          Escolha um <span className="brand-gradient-text">modelo</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          {templates.length} modelos prontos + da comunidade. Customize tudo
          depois.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 max-w-md"
        />
      </div>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveCategory(t.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
              activeCategory === t.id
                ? "bg-foreground text-background"
                : "bg-card/70 text-muted-foreground backdrop-blur-sm hover:bg-card hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Populares (só mostra na aba Populares e sem search) */}
      {activeCategory === "populares" && !search && popular.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="size-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Mais usados agora
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((t) => (
              <TemplateCard key={t.id} template={t} onPick={onPick} />
            ))}
          </div>
        </section>
      )}

      {/* Lista filtrada */}
      {(activeCategory !== "populares" || search) && (
        <section>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} modelo{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
              Nenhum modelo encontrado. Tente outra busca.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((t) => (
                <TemplateCard key={t.id} template={t} onPick={onPick} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Blank option no rodapé */}
      <section className="mt-16 border-t border-border pt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Ou comece do zero
        </h2>
        <button
          type="button"
          onClick={() => onPick(blank)}
          className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card/60 p-5 text-left backdrop-blur-xl transition-all hover:border-primary hover:bg-card"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl">
            ✍️
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Página em branco</h3>
            <p className="text-sm text-muted-foreground">
              Começa sem nada pré-preenchido.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </button>
      </section>
    </div>
  );
}

function TemplateCard({
  template,
  onPick,
}: {
  template: GalleryTemplate;
  onPick: (t: PageTemplate) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(template)}
      className="group overflow-hidden rounded-3xl border-2 border-border bg-card/80 backdrop-blur-xl text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-ios-lg"
    >
      <div className="relative">
        <TemplateThumbnail template={template} />
        {template.source === "user" && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur">
            Comunidade
          </span>
        )}
        {template.featured && template.source === "system" && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            Destaque
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{template.emoji}</span>
          <h3 className="truncate font-bold">{template.name}</h3>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {template.description}
        </p>
        {template.usageCount > 0 && (
          <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
            <UserIcon className="size-3" />
            {template.usageCount} uso{template.usageCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </button>
  );
}

function NameForm({
  template,
  onBack,
}: {
  template: PageTemplate;
  onBack: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(template.suggestedTitle);
  const [slug, setSlug] = useState(slugify(template.suggestedTitle));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("templateId", template.id);
    startTransition(async () => {
      const result = await createPageFromTemplate(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[320px_1fr]">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
        >
          ← Trocar modelo
        </button>
        <div className="overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-ios">
          <TemplateThumbnail template={template} />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{template.emoji}</span>
              <h3 className="font-bold">{template.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {template.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {template.blocks.length} blocos pré-configurados
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-black tracking-[-0.03em]">Quase lá</h2>
        <p className="mt-1 text-muted-foreground">
          Só preciso do nome e do link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={80}
              className="h-12"
              placeholder="Seu nome"
              value={title}
              onChange={(e) => {
                const v = e.target.value;
                setTitle(v);
                setSlug(slugify(v));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <SlugInput value={slug} onChange={setSlug} />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending}
          >
            {pending ? (
              "Criando..."
            ) : (
              <>
                Criar página <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// suprime warning de import não usado caso tree-shaking
void Check;
void Sparkles;
