"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  PartyPopper,
  User,
  UserSquare2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeThumbnail } from "@/components/theme-thumbnail";
import { AvatarPicker } from "@/components/avatar-picker";
import {
  SocialIcon,
  socialBrandColor,
} from "@/components/social-icons";
import { themePresets } from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
  buildPlatformUrl,
  getPlatform,
  platforms as allPlatforms,
} from "./platforms";
import { completeOnboarding } from "./actions";

type Category = "creator" | "business" | "personal";

type OnboardingState = {
  category: Category | null;
  themeId: string | null;
  platformIds: string[];
  platformInputs: Record<string, string>;
  name: string;
  bio: string;
  avatarUrl: string;
};

const STEPS = [
  "category",
  "theme",
  "platforms",
  "links",
  "profile",
  "complete",
] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("category");
  const [state, setState] = useState<OnboardingState>({
    category: null,
    themeId: null,
    platformIds: [],
    platformInputs: {},
    name: "",
    bio: "",
    avatarUrl: "",
  });
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const stepIdx = STEPS.indexOf(step);

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1]!;
      // Pular "links" se nenhuma plataforma selecionada
      if (nextStep === "links" && state.platformIds.length === 0) {
        setStep("profile");
      } else {
        setStep(nextStep);
      }
    }
  }

  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      const prev = STEPS[idx - 1]!;
      if (prev === "links" && state.platformIds.length === 0) {
        setStep("platforms");
      } else {
        setStep(prev);
      }
    }
  }

  function handleFinish() {
    if (!state.themeId || !state.name) return;
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
      const result = await completeOnboarding({
        category: state.category ?? "personal",
        themeId: state.themeId!,
        platforms: platformBlocks,
        name: state.name,
        bio: state.bio || undefined,
        avatarUrl: state.avatarUrl || null,
      });
      if ("ok" in result && result.ok) {
        setCreatedSlug(result.slug);
        setCreatedId(result.pageId);
        setStep("complete");
      }
    });
  }

  return (
    <main className="ambient-bg flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          {stepIdx > 0 && step !== "complete" && (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
          )}
        </div>
        {step !== "complete" && (
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pular
          </Link>
        )}
      </header>

      {step !== "complete" && (
        <div className="px-6 sm:px-10">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            {STEPS.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIdx ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      )}

      <section className="flex-1 px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
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
              onChange={(platformIds) =>
                setState((s) => ({ ...s, platformIds }))
              }
              onNext={next}
            />
          )}
          {step === "links" && (
            <StepLinks
              platformIds={state.platformIds}
              inputs={state.platformInputs}
              onChange={(platformInputs) =>
                setState((s) => ({ ...s, platformInputs }))
              }
              onNext={next}
            />
          )}
          {step === "profile" && (
            <StepProfile
              state={state}
              onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
              onFinish={handleFinish}
              pending={pending}
            />
          )}
          {step === "complete" && createdSlug && createdId && (
            <StepComplete
              name={state.name}
              slug={createdSlug}
              pageId={createdId}
              onGoToEditor={() =>
                router.push(`/dashboard/pages/${createdId}/edit`)
              }
              onGoToDashboard={() => router.push("/dashboard")}
            />
          )}
        </div>
      </section>
    </main>
  );
}

// ============== STEPS ==============

function StepCategory({
  value,
  onChange,
  onNext,
}: {
  value: Category | null;
  onChange: (c: Category) => void;
  onNext: () => void;
}) {
  const options: {
    id: Category;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "creator",
      title: "Criador",
      desc: "Crescer minha audiência e monetizar o público.",
      icon: <User className="size-6" />,
    },
    {
      id: "business",
      title: "Negócio",
      desc: "Expandir meu negócio e alcançar mais clientes.",
      icon: <Briefcase className="size-6" />,
    },
    {
      id: "personal",
      title: "Pessoal",
      desc: "Compartilhar links com amigos e conhecidos.",
      icon: <UserSquare2 className="size-6" />,
    },
  ];

  return (
    <div className="animate-slide-up text-center">
      <h1 className="text-balance text-4xl font-black tracking-[-0.03em] sm:text-5xl">
        O que você quer fazer <br className="hidden sm:inline" />
        <span className="brand-gradient-text">por aqui</span>?
      </h1>
      <p className="mt-3 text-muted-foreground">
        Isso nos ajuda a personalizar sua experiência.
      </p>

      <div className="mx-auto mt-10 grid max-w-xl gap-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 bg-card/80 backdrop-blur-xl p-5 text-left transition-all hover-card",
              value === o.id
                ? "border-primary shadow-ios-glow"
                : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              {o.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{o.title}</h3>
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

      <div className="mt-10">
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
    <div className="animate-slide-up">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Selecione um <span className="brand-gradient-text">tema</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dá pra trocar e personalizar tudo depois.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {themePresets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "group overflow-hidden rounded-2xl border-2 text-left transition-all hover:-translate-y-1 hover:shadow-ios-lg",
              value === t.id
                ? "border-primary shadow-ios-glow"
                : "border-border hover:border-primary/40"
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
              <p className="truncate text-xs text-muted-foreground">
                {t.vibe}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 text-center">
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
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else if (value.length < 5) {
      onChange([...value, id]);
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Em quais <span className="brand-gradient-text">plataformas</span>{" "}
          você está?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Escolha até 5 — você pode adicionar mais depois.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
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
                "group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card/80 backdrop-blur-xl transition-all",
                selected
                  ? "border-primary shadow-ios-glow"
                  : "border-border hover:border-primary/40 hover:-translate-y-0.5",
                disabled && "opacity-40"
              )}
              style={
                selected ? { color: socialBrandColor[p.id] } : undefined
              }
            >
              <SocialIcon
                platform={p.id}
                className="size-7 transition-colors"
              />
              <span className="text-xs font-semibold text-foreground">
                {p.name}
              </span>
              {selected && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          {value.length} de 5 selecionadas
        </p>
        <Button size="lg" onClick={onNext}>
          {value.length === 0 ? "Pular" : "Continuar"}{" "}
          <ArrowRight className="size-4" />
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
  onChange: (inputs: Record<string, string>) => void;
  onNext: () => void;
}) {
  const hasAnyFilled = platformIds.some((id) =>
    inputs[id]?.trim() ? true : false
  );

  return (
    <div className="animate-slide-up">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Adicione seus <span className="brand-gradient-text">links</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Só preenche o @ ou o final da URL — a gente monta o resto.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl space-y-3">
        {platformIds.map((id) => {
          const p = getPlatform(id);
          if (!p) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-3 shadow-ios-sm"
            >
              <div
                className="flex size-11 items-center justify-center rounded-xl bg-secondary"
                style={{ color: socialBrandColor[p.id] }}
              >
                <SocialIcon platform={p.id} className="size-5" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">
                  {p.name}
                </Label>
                <div className="flex items-center">
                  <span className="truncate text-sm text-muted-foreground">
                    {p.urlBase}
                  </span>
                  <input
                    type="text"
                    value={inputs[id] ?? ""}
                    onChange={(e) =>
                      onChange({ ...inputs, [id]: e.target.value })
                    }
                    placeholder={p.placeholder}
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button size="lg" onClick={onNext}>
          {hasAnyFilled ? "Continuar" : "Pular"}{" "}
          <ArrowRight className="size-4" />
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
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onFinish: () => void;
  pending: boolean;
}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const valid = state.name.trim().length > 0 && state.themeId;

  return (
    <div className="animate-slide-up mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-black tracking-[-0.03em] sm:text-5xl">
          Detalhes do <span className="brand-gradient-text">perfil</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Adicione sua foto, nome e bio.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setAvatarOpen(true)}
            className="group relative flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-border bg-secondary transition-all hover:border-primary hover:shadow-ios-glow"
          >
            {state.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <User className="size-10 text-muted-foreground" />
            )}
            <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-ios">
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
            placeholder="@visionxdev"
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
          <p className="text-right text-xs text-muted-foreground">
            {state.bio.length} / 160
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button
          size="lg"
          className="min-w-[200px]"
          disabled={!valid || pending}
          onClick={onFinish}
        >
          {pending ? "Criando..." : "Finalizar"}{" "}
          <ArrowRight className="size-4" />
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

function StepComplete({
  name,
  slug,
  pageId,
  onGoToEditor,
  onGoToDashboard,
}: {
  name: string;
  slug: string;
  pageId: string;
  onGoToEditor: () => void;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="animate-scale-in mx-auto max-w-lg text-center">
      <Confetti />

      <div className="relative z-10">
        <div className="mx-auto mb-8 flex size-20 animate-pulse-glow items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-ios-glow">
          <PartyPopper className="size-10" />
        </div>
        <h1 className="text-5xl font-black tracking-[-0.03em] sm:text-6xl">
          Sua página <br />
          <span className="brand-gradient-text">tá pronta!</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Criamos sua página com os dados que você forneceu.
          <br />
          Agora é só personalizar e compartilhar.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-5 shadow-ios">
          <p className="text-xs text-muted-foreground">Sua URL</p>
          <p className="mt-1 font-mono text-sm font-semibold text-primary">
            linkbiobr.com/{slug}
          </p>
          <div className="mt-3 border-t border-border pt-3 text-left">
            <p className="font-bold">{name}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onGoToEditor}>
            Personalizar agora <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="glass" onClick={onGoToDashboard}>
            Ir pro dashboard
          </Button>
        </div>
        <Link
          href={`/${slug}`}
          target="_blank"
          className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Ver página pública <span aria-hidden>↗</span>
        </Link>
      </div>
      <input type="hidden" value={pageId} readOnly />
    </div>
  );
}

function Confetti() {
  const dots = Array.from({ length: 40 });
  const colors = [
    "#009c3b",
    "#ffdf00",
    "#002776",
    "#00b84a",
    "#ffe94d",
    "#ffffff",
  ];
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
        .animate-confetti {
          animation: confetti 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
