"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Activity, Armchair, ArrowRight, Baby, Bitcoin, BookOpen, Brain,
  Briefcase, Building2, Camera, Car, Church, Clapperboard, Code, Coffee,
  Construction, Crown, Drama, DollarSign, Dumbbell, Flame, Folder,
  Gamepad2, GraduationCap, HardHat, Heart, Home, Landmark, Leaf,
  Map as MapIcon, Megaphone, Mic, Music, Newspaper, Package, Paintbrush,
  Palette, PawPrint, Pencil, Plane, Podcast, Rocket, Scale, Scissors,
  Search, Shirt, ShoppingBag, ShoppingCart, Sparkle, Sparkles, Star,
  Store, Target, Theater, Trophy, Truck, Tv, User as UserIcon,
  UserCog, Users, UtensilsCrossed, Waves, Wine, Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { SlugInput } from "@/components/slug-input";
import { cn, slugify } from "@/lib/utils";
import type { PageTemplate } from "@/lib/templates";
import type { GalleryTemplate } from "@/lib/load-templates";
import { createPageFromTemplate } from "../actions";

// ─── Category icons ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  populares: Flame,
  todos: Sparkles,
  criador: Palette,
  música: Music,
  "negócio local": Store,
  comércio: ShoppingBag,
  mídia: Tv,
  portfólio: Briefcase,
  fitness: Dumbbell,
  educação: GraduationCap,
  beleza: Sparkle,
  outros: Package,
  "estilo plataforma": Target,
  delivery: Truck,
  jurídico: Scale,
  saúde: Heart,
  cantores: Mic,
  política: Landmark,
  "copa do mundo": Trophy,
  "visual premium": Crown,
  fotografia: Camera,
  "moda & estilo": Shirt,
  "casamento & eventos": Heart,
  "pet & animais": PawPrint,
  imóveis: Home,
  "finanças & investimentos": DollarSign,
  "crypto & web3": Bitcoin,
  "marketing digital": Megaphone,
  "design & criativo": Paintbrush,
  "podcast & áudio": Podcast,
  "dança & teatro": Drama,
  "artesanato & diy": Scissors,
  sustentabilidade: Leaf,
  "gastronomia especial": UtensilsCrossed,
  "saúde mental": Brain,
  "esportes radicais": Waves,
  "games & e-sports": Gamepad2,
  "turismo & hotelaria": Plane,
  "religião & espiritualidade": Church,
  "startup & inovação": Rocket,
  "cinema & audiovisual": Clapperboard,
  "jornalismo & mídia": Newspaper,
  "automóveis & mobilidade": Car,
  "construção civil": HardHat,
  "decoração & interiores": Armchair,
  "loja virtual & e-commerce": ShoppingCart,
  "serviços locais & profissionais": Wrench,
  "crianças & família": Baby,
  "rh & carreira": UserCog,
  "cultura & arte": Theater,
  "tecnologia & programação": Code,
  "social & comunidade": Users,
  "franquias & negócios": Building2,
  "beleza & estética": Star,
  "fitness & esporte": Activity,
  "educação especial": BookOpen,
  "café & restaurantes": Coffee,
  "viagem & lifestyle": MapIcon,
  "bebidas & gastronomia": Wine,
  construction: Construction,
};

function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category.toLowerCase()] ?? Folder;
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

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
  return <NameForm template={selected} onBack={() => setSelected(null)} />;
}

// ─── Canva-style picker ──────────────────────────────────────────────────────

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
    return scored.slice(0, 12);
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

  const sidebarItems: { id: string; label: string; Icon: LucideIcon }[] = [
    { id: "populares", label: "Populares", Icon: Flame },
    { id: "todos", label: "Todos", Icon: Sparkles },
    ...categories.map((c) => ({
      id: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
      Icon: getCategoryIcon(c),
    })),
  ];

  const currentTitle =
    sidebarItems.find((i) => i.id === activeCategory)?.label ??
    "Escolha um modelo";

  const showingPopular =
    activeCategory === "populares" && !search && popular.length > 0;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT SIDEBAR — categories */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="shrink-0 px-5 pt-6 pb-4">
          <h1 className="text-2xl font-black tracking-[-0.02em]">
            <span className="brand-gradient-text">Modelos</span>
          </h1>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {templates.length} prontos para usar
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {sidebarItems.map((item) => {
            const active = activeCategory === item.id;
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all",
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Blank option */}
        <div className="shrink-0 border-t border-border/40 p-3">
          <button
            type="button"
            onClick={() => onPick(blank)}
            className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-background/60 p-3 text-left transition-colors hover:border-primary hover:bg-card"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Pencil className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold">Em branco</h3>
              <p className="truncate text-[10px] text-muted-foreground">
                Começar do zero
              </p>
            </div>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </aside>

      {/* MAIN — templates grid */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky header with title + search */}
        <div className="shrink-0 border-b border-border/40 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 pt-6 pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.025em]">
                  {currentTitle}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {search
                    ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} pra "${search}"`
                    : activeCategory === "populares"
                      ? "Os mais usados agora na plataforma"
                      : `${filtered.length} modelo${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar modelos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6">
            {showingPopular && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="size-4 text-primary" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Em alta
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {popular.map((t) => (
                    <TemplateCard key={t.id} template={t} onPick={onPick} />
                  ))}
                </div>
              </>
            )}

            {!showingPopular && (
              <>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-24 text-center">
                    <Search className="mb-3 size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Nenhum modelo encontrado
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Tente outra busca ou categoria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filtered.map((t) => (
                      <TemplateCard key={t.id} template={t} onPick={onPick} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Template card ───────────────────────────────────────────────────────────

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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-ios-lg"
    >
      <div className="relative">
        <TemplateThumbnail template={template} />
        {template.source === "user" && (
          <span className="absolute left-2 top-2 rounded-full bg-primary/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm backdrop-blur">
            Comunidade
          </span>
        )}
        {template.featured && template.source === "system" && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur">
            Destaque
          </span>
        )}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mb-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            Usar modelo →
          </span>
        </div>
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{template.emoji}</span>
          <h3 className="truncate text-[13px] font-bold">{template.name}</h3>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {template.description}
        </p>
        {template.usageCount > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-primary">
            <UserIcon className="size-2.5" />
            {template.usageCount} uso{template.usageCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Name form (after template picked) ───────────────────────────────────────

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
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
      <div className="mx-auto grid w-full max-w-4xl gap-10 lg:grid-cols-[320px_1fr]">
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
    </div>
  );
}

void Sparkles;
