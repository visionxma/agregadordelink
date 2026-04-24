"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Armchair, ArrowLeft, ArrowRight, Baby, Bitcoin, BookOpen, Brain,
  Briefcase, Building2, Camera, Car, Check, Church, Clapperboard, Code, Coffee,
  Construction, Crown, Drama, DollarSign, Dumbbell, Flame, Folder,
  Gamepad2, GraduationCap, HardHat, Heart, Home, Landmark, Leaf,
  Map as MapIcon, Megaphone, Mic, Music, Newspaper, Package, Paintbrush,
  Palette, PartyPopper, PawPrint, Pencil, Plane, Podcast, Rocket, Scale, Scissors,
  Search, Shirt, ShoppingBag, ShoppingCart, Sparkle, Sparkles, Star,
  Store, Target, Theater, Trophy, Truck, Tv, User as UserIcon,
  UserCog, Users, UtensilsCrossed, Waves, Wine, Wrench, UserSquare2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { ThemeThumbnail } from "@/components/theme-thumbnail";
import { AvatarPicker } from "@/components/avatar-picker";
import { SocialIcon, socialBrandColor } from "@/components/social-icons";
import { themePresets } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { PageTemplate } from "@/lib/templates";
import type { GalleryTemplate } from "@/lib/load-templates";
import { buildPlatformUrl, getPlatform, platforms as allPlatforms } from "@/app/onboarding/platforms";
import { createPageWithQuiz } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "creator" | "business" | "personal";

type WizardStep =
  | "pick-template"
  | "category"
  | "theme"
  | "platforms"
  | "links"
  | "profile"
  | "done";

type WizardState = {
  template: PageTemplate | null;
  category: Category | null;
  themeId: string | null;
  platformIds: string[];
  platformInputs: Record<string, string>;
  name: string;
  bio: string;
  avatarUrl: string;
};

// ─── Category sidebar icons ───────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  populares: Flame, todos: Sparkles, criador: Palette, música: Music,
  "negócio local": Store, comércio: ShoppingBag, mídia: Tv, portfólio: Briefcase,
  fitness: Dumbbell, educação: GraduationCap, beleza: Sparkle, outros: Package,
  "estilo plataforma": Target, delivery: Truck, jurídico: Scale, saúde: Heart,
  cantores: Mic, política: Landmark, "copa do mundo": Trophy, "visual premium": Crown,
  fotografia: Camera, "moda & estilo": Shirt, "casamento & eventos": Heart,
  "pet & animais": PawPrint, imóveis: Home, "finanças & investimentos": DollarSign,
  "crypto & web3": Bitcoin, "marketing digital": Megaphone, "design & criativo": Paintbrush,
  "podcast & áudio": Podcast, "dança & teatro": Drama, "artesanato & diy": Scissors,
  sustentabilidade: Leaf, "gastronomia especial": UtensilsCrossed, "saúde mental": Brain,
  "esportes radicais": Waves, "games & e-sports": Gamepad2, "turismo & hotelaria": Plane,
  "religião & espiritualidade": Church, "startup & inovação": Rocket,
  "cinema & audiovisual": Clapperboard, "jornalismo & mídia": Newspaper,
  "automóveis & mobilidade": Car, "construção civil": HardHat, "decoração & interiores": Armchair,
  "loja virtual & e-commerce": ShoppingCart, "serviços locais & profissionais": Wrench,
  "crianças & família": Baby, "rh & carreira": UserCog, "cultura & arte": Theater,
  "tecnologia & programação": Code, "social & comunidade": Users, "franquias & negócios": Building2,
  "beleza & estética": Star, "fitness & esporte": Activity, "educação especial": BookOpen,
  "café & restaurantes": Coffee, "viagem & lifestyle": MapIcon, "bebidas & gastronomia": Wine,
  construction: Construction,
};

function getCategoryIcon(c: string): LucideIcon {
  return CATEGORY_ICONS[c.toLowerCase()] ?? Folder;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const QUIZ_STEPS: WizardStep[] = ["category", "theme", "platforms", "links", "profile"];

function ProgressBar({ step, hasTemplate }: { step: WizardStep; hasTemplate: boolean }) {
  const steps = hasTemplate
    ? QUIZ_STEPS.filter((s) => s !== "theme")
    : QUIZ_STEPS;
  const idx = steps.indexOf(step);
  if (idx < 0) return null;
  return (
    <div className="mx-auto flex w-full max-w-lg items-center gap-1.5 px-6 py-4">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i <= idx ? "bg-primary" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function TemplateWizard({
  templates,
  blank,
  categories,
}: {
  templates: GalleryTemplate[];
  blank: PageTemplate;
  categories: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<WizardStep>("pick-template");
  const [state, setState] = useState<WizardState>({
    template: null,
    category: null,
    themeId: null,
    platformIds: [],
    platformInputs: {},
    name: "",
    bio: "",
    avatarUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const hasTemplate = !!state.template && state.template.id !== "blank";

  function pickTemplate(t: PageTemplate) {
    setState((s) => ({ ...s, template: t }));
    setStep("category");
  }

  function back() {
    if (step === "category") { setStep("pick-template"); return; }
    if (step === "theme") { setStep("category"); return; }
    if (step === "platforms") { setStep(hasTemplate ? "category" : "theme"); return; }
    if (step === "links") { setStep("platforms"); return; }
    if (step === "profile") {
      setStep(state.platformIds.length > 0 ? "links" : "platforms");
      return;
    }
  }

  function next() {
    if (step === "category") { setStep(hasTemplate ? "platforms" : "theme"); return; }
    if (step === "theme") { setStep("platforms"); return; }
    if (step === "platforms") {
      setStep(state.platformIds.length > 0 ? "links" : "profile");
      return;
    }
    if (step === "links") { setStep("profile"); return; }
  }

  function handleFinish() {
    if (!state.name) return;
    setError(null);

    const platformBlocks = state.platformIds
      .map((id) => {
        const p = getPlatform(id);
        if (!p) return null;
        const input = state.platformInputs[id] ?? "";
        const url = buildPlatformUrl(p, input);
        if (!url) return null;
        return { id, label: p.label, url };
      })
      .filter((x): x is { id: string; label: string; url: string } => !!x);

    startTransition(async () => {
      const result = await createPageWithQuiz({
        templateId: state.template?.id !== "blank" ? state.template?.id : undefined,
        category: state.category ?? "personal",
        themeId: state.themeId ?? undefined,
        name: state.name,
        bio: state.bio || undefined,
        avatarUrl: state.avatarUrl || null,
        platforms: platformBlocks,
      });
      if ("error" in result) {
        setError(result.error ?? "Erro desconhecido.");
        return;
      }
      if (result.ok) {
        setCreatedSlug(result.slug);
        setCreatedId(result.pageId);
        setStep("done");
      }
    });
  }

  if (step === "pick-template") {
    return (
      <TemplatePicker
        templates={templates}
        blank={blank}
        categories={categories}
        onPick={pickTemplate}
      />
    );
  }

  if (step === "done" && createdSlug && createdId) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <StepDone
          name={state.name}
          slug={createdSlug}
          onGoToEditor={() => router.push(`/dashboard/pages/${createdId}/edit`)}
          onGoToDashboard={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header row */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-6 py-3">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {step === "category" ? "Trocar modelo" : "Voltar"}
        </button>
        <div className="flex items-center gap-3">
          {state.template && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-1.5">
              <span className="text-sm">{state.template.emoji}</span>
              <span className="max-w-[120px] truncate text-xs font-semibold">
                {state.template.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <ProgressBar step={step} hasTemplate={hasTemplate} />

      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-2">
        <div className="mx-auto max-w-2xl">
          {step === "category" && (
            <StepCategory
              value={state.category}
              onChange={(category) => setState((s) => ({ ...s, category }))}
              onNext={next}
            />
          )}
          {step === "theme" && (
            <StepTheme
              value={state.themeId}
              onChange={(themeId) => setState((s) => ({ ...s, themeId }))}
              onNext={next}
            />
          )}
          {step === "platforms" && (
            <StepPlatforms
              value={state.platformIds}
              onChange={(platformIds) => setState((s) => ({ ...s, platformIds }))}
              onNext={next}
            />
          )}
          {step === "links" && (
            <StepLinks
              platformIds={state.platformIds}
              inputs={state.platformInputs}
              onChange={(platformInputs) => setState((s) => ({ ...s, platformInputs }))}
              onNext={next}
            />
          )}
          {step === "profile" && (
            <StepProfile
              state={state}
              onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
              onFinish={handleFinish}
              pending={pending}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Template picker (Canva-style) ────────────────────────────────────────────

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
  const [search, setSearch] = useState<string>("");

  const popular = useMemo(() => {
    const scored = templates
      .map((t) => ({
        ...t,
        score: t.usageCount * 10 + (t.featured ? 50 : 0) + (t.source === "user" ? 5 : 0),
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

  const currentTitle = sidebarItems.find((i) => i.id === activeCategory)?.label ?? "Modelos";
  const showingPopular = activeCategory === "populares" && !search && popular.length > 0;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="shrink-0 px-5 pt-5 pb-3">
          <h1 className="text-xl font-black tracking-[-0.02em]">
            <span className="brand-gradient-text">Escolha um modelo</span>
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {templates.length} prontos • customize tudo depois
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
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
              <p className="text-xs font-bold">Em branco</p>
              <p className="text-[10px] text-muted-foreground">Começar do zero</p>
            </div>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/40 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 pt-5 pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.025em]">{currentTitle}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {search
                    ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`
                    : activeCategory === "populares"
                      ? "Os mais usados agora"
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
                  className="h-9 pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-5">
            {showingPopular && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <Flame className="size-4 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Em alta</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {popular.map((t) => (
                    <TemplateCard key={t.id} template={t} onPick={onPick} />
                  ))}
                </div>
              </>
            )}
            {!showingPopular && (
              filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center">
                  <Search className="mb-3 size-7 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">Nenhum modelo encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filtered.map((t) => (
                    <TemplateCard key={t.id} template={t} onPick={onPick} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onPick }: { template: GalleryTemplate; onPick: (t: PageTemplate) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(template)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-ios-lg"
    >
      <div className="relative">
        <TemplateThumbnail template={template} />
        {template.source === "user" && (
          <span className="absolute left-2 top-2 rounded-full bg-primary/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">Comunidade</span>
        )}
        {template.featured && template.source === "system" && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">Destaque</span>
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
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{template.description}</p>
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

// ─── Quiz steps ───────────────────────────────────────────────────────────────

function StepCategory({
  value,
  onChange,
  onNext,
}: {
  value: Category | null;
  onChange: (c: Category) => void;
  onNext: () => void;
}) {
  const options: { id: Category; title: string; desc: string; icon: React.ReactNode }[] = [
    { id: "creator", title: "Criador", desc: "Crescer minha audiência e monetizar meu público.", icon: <UserIcon className="size-6" /> },
    { id: "business", title: "Negócio", desc: "Expandir meu negócio e alcançar mais clientes.", icon: <Briefcase className="size-6" /> },
    { id: "personal", title: "Pessoal", desc: "Compartilhar links com amigos e conhecidos.", icon: <UserSquare2 className="size-6" /> },
  ];

  return (
    <div className="animate-slide-up pt-8 text-center">
      <h2 className="text-4xl font-black tracking-[-0.03em]">
        Para que vai usar <span className="brand-gradient-text">essa página</span>?
      </h2>
      <p className="mt-2 text-muted-foreground">Isso ajuda a personalizar sua experiência.</p>
      <div className="mx-auto mt-8 grid max-w-lg gap-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 bg-card/80 p-5 text-left transition-all",
              value === o.id ? "border-primary shadow-ios-glow" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              {o.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold">{o.title}</p>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </div>
            {value === o.id && (
              <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <Button size="lg" disabled={!value} onClick={onNext}>
          Continuar <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function StepTheme({
  value,
  onChange,
  onNext,
}: {
  value: string | null;
  onChange: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-slide-up pt-8">
      <div className="text-center">
        <h2 className="text-4xl font-black tracking-[-0.03em]">
          Escolha um <span className="brand-gradient-text">tema</span>
        </h2>
        <p className="mt-2 text-muted-foreground">Você pode trocar e personalizar depois.</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {themePresets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "group overflow-hidden rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5",
              value === t.id ? "border-primary shadow-ios-glow" : "border-border hover:border-primary/40"
            )}
          >
            <div className="relative">
              <ThemeThumbnail theme={t.theme} label={t.name} />
              {value === t.id && (
                <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-ios-sm">
                  <Check className="size-3.5" />
                </div>
              )}
            </div>
            <div className="bg-card p-3">
              <p className="text-sm font-bold">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t.vibe}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button size="lg" disabled={!value} onClick={onNext}>
          Continuar <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function StepPlatforms({
  value,
  onChange,
  onNext,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
}) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else if (value.length < 5) onChange([...value, id]);
  }

  return (
    <div className="animate-slide-up pt-8">
      <div className="text-center">
        <h2 className="text-4xl font-black tracking-[-0.03em]">
          Em quais <span className="brand-gradient-text">plataformas</span> você está?
        </h2>
        <p className="mt-2 text-muted-foreground">Escolha até 5 — pode adicionar mais depois.</p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {allPlatforms.map((p) => {
          const selected = value.includes(p.id);
          const disabled = !selected && value.length >= 5;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(p.id)}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card/80 transition-all",
                selected ? "border-primary shadow-ios-glow" : "border-border hover:border-primary/40 hover:-translate-y-0.5",
                disabled && "opacity-40"
              )}
              style={selected ? { color: socialBrandColor[p.id] } : undefined}
            >
              <SocialIcon platform={p.id} className="size-7" />
              <span className="text-xs font-semibold text-foreground">{p.name}</span>
              {selected && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">{value.length} de 5 selecionadas</p>
        <Button size="lg" onClick={onNext}>
          {value.length === 0 ? "Pular" : "Continuar"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function StepLinks({
  platformIds,
  inputs,
  onChange,
  onNext,
}: {
  platformIds: string[];
  inputs: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  onNext: () => void;
}) {
  const hasAny = platformIds.some((id) => inputs[id]?.trim());

  return (
    <div className="animate-slide-up pt-8">
      <div className="text-center">
        <h2 className="text-4xl font-black tracking-[-0.03em]">
          Adicione seus <span className="brand-gradient-text">links</span>
        </h2>
        <p className="mt-2 text-muted-foreground">Só o @ ou o final da URL — a gente monta o resto.</p>
      </div>
      <div className="mx-auto mt-8 max-w-lg space-y-3">
        {platformIds.map((id) => {
          const p = getPlatform(id);
          if (!p) return null;
          return (
            <div key={id} className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-ios-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary" style={{ color: socialBrandColor[p.id] }}>
                <SocialIcon platform={p.id} className="size-5" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{p.name}</Label>
                <div className="flex items-center">
                  <span className="truncate text-sm text-muted-foreground">{p.urlBase}</span>
                  <input
                    type="text"
                    value={inputs[id] ?? ""}
                    onChange={(e) => onChange({ ...inputs, [id]: e.target.value })}
                    placeholder={p.placeholder}
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Button size="lg" onClick={onNext}>
          {hasAny ? "Continuar" : "Pular"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function StepProfile({
  state,
  onChange,
  onFinish,
  pending,
  error,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onFinish: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const valid = state.name.trim().length > 0;

  return (
    <div className="animate-slide-up mx-auto max-w-md pt-8">
      <div className="text-center">
        <h2 className="text-4xl font-black tracking-[-0.03em]">
          Detalhes do <span className="brand-gradient-text">perfil</span>
        </h2>
        <p className="mt-2 text-muted-foreground">Adicione sua foto, nome e bio.</p>
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setAvatarOpen(true)}
            className="group relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-border bg-secondary transition-all hover:border-primary hover:shadow-ios-glow"
          >
            {state.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <UserIcon className="size-8 text-muted-foreground" />
            )}
            <span className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow-ios">
              +
            </span>
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome de exibição</Label>
          <Input
            id="name"
            value={state.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Seu nome ou marca"
            maxLength={80}
            className="h-12"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            value={state.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Criador de conteúdo · SP"
            maxLength={160}
            rows={3}
          />
          <p className="text-right text-xs text-muted-foreground">{state.bio.length} / 160</p>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button size="lg" className="min-w-[200px]" disabled={!valid || pending} onClick={onFinish}>
          {pending ? "Criando..." : <>Criar página <ArrowRight className="size-4" /></>}
        </Button>
      </div>

      <AvatarPicker
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onPick={(url) => onChange({ avatarUrl: url })}
        selectedUrl={state.avatarUrl}
      />
    </div>
  );
}

// ─── Done step ────────────────────────────────────────────────────────────────

function StepDone({
  name,
  slug,
  onGoToEditor,
  onGoToDashboard,
}: {
  name: string;
  slug: string;
  onGoToEditor: () => void;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="relative mx-auto max-w-lg text-center">
      <Confetti />
      <div className="relative z-10">
        <div className="mx-auto mb-8 flex size-20 animate-pulse-glow items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-ios-glow">
          <PartyPopper className="size-10" />
        </div>
        <h2 className="text-5xl font-black tracking-[-0.03em]">
          Sua página <br />
          <span className="brand-gradient-text">tá pronta!</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Criamos sua página. Agora é só personalizar e compartilhar.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-border bg-card/80 p-5 shadow-ios">
          <p className="text-xs text-muted-foreground">Sua URL</p>
          <p className="mt-1 font-mono text-sm font-semibold text-primary">linkbiobr.com/{slug}</p>
          <div className="mt-3 border-t border-border pt-3 text-left">
            <p className="font-bold">{name}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onGoToEditor}>
            Personalizar agora <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="glass" onClick={onGoToDashboard}>
            Ir pro dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const dots = Array.from({ length: 40 });
  const colors = ["#009c3b","#ffdf00","#002776","#00b84a","#ffe94d","#ffffff"];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {dots.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotate = Math.random() * 360;
        return (
          <span
            key={i}
            className="absolute top-0 animate-confetti"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.5}px`,
              background: color,
              transform: `rotate(${rotate}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              borderRadius: "2px",
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 4s linear infinite; }
      `}</style>
    </div>
  );
}
