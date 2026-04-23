import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrazilFlag } from "@/components/brazil-flag";
import { PLAN_LIST } from "@/lib/plans";

export default function PricingPage() {
  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
              <Sparkles className="size-4" />
            </span>
            <span className="flex items-center gap-1.5 text-lg font-black tracking-tight">
              LinkBio <BrazilFlag className="h-5 w-auto" />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Criar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="mb-14 text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Planos
          </span>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.03em] sm:text-6xl">
            Começa grátis.
            <br />
            <span className="brand-gradient-text">Escala quando quiser.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sem trial, sem pegadinha. Cancela quando quiser.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLAN_LIST.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-3xl border bg-card/80 p-8 backdrop-blur-xl shadow-ios ${p.highlight ? "border-primary shadow-ios-glow" : "border-border"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Mais popular
                </span>
              )}
              <h3 className="text-2xl font-black tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-[-0.03em]">
                  {p.priceDisplay.replace("/mês", "")}
                </span>
                {p.priceDisplay.includes("/mês") && (
                  <span className="text-sm text-muted-foreground">/mês</span>
                )}
              </div>

              <Button
                asChild
                className="mt-6 w-full"
                variant={p.highlight ? "default" : "outline"}
              >
                <Link href={p.id === "free" ? "/signup" : "/dashboard/billing"}>
                  {p.id === "free" ? "Começar grátis" : `Assinar ${p.name}`}
                </Link>
              </Button>

              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
