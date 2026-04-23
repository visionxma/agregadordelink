import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Link2,
  Palette,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrazilFlag } from "@/components/brazil-flag";

export function ClaimSlugLanding({ slug }: { slug: string }) {
  const signupHref = `/signup?slug=${encodeURIComponent(slug)}`;

  return (
    <main className="min-h-screen text-foreground">
      <section
        className="relative overflow-hidden"
        style={{ background: "#99CFFF" }}
      >
        <div className="px-4 pt-5 sm:px-8 sm:pt-6">
          <header className="container mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full bg-white/95 px-4 shadow-ios-lg backdrop-blur sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <span className="text-base font-black tracking-tight text-foreground">
                linkhub
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href={signupHref}>Criar grátis</Link>
              </Button>
            </div>
          </header>
        </div>

        <div className="container relative mx-auto max-w-4xl px-4 pb-20 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-16">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-foreground shadow-ios-sm backdrop-blur">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            Esse nome está disponível
          </div>

          <h1
            className="text-balance font-black leading-[0.95] tracking-[-0.04em] text-[#0a2d5e]"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
          >
            linkbiobr.com/
            <span className="italic text-primary">{slug}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg font-medium text-[#0a2d5e]/80 sm:text-xl">
            Reivindique agora. Crie sua página em 60 segundos, sem cartão, sem
            complicação.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-foreground px-7 text-base font-semibold text-background hover:bg-foreground/90"
            >
              <Link href={signupHref}>
                Pegar esse nome
                <ArrowRight className="ml-1 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-foreground/20 bg-white/90 px-7 text-base font-semibold backdrop-blur hover:bg-white"
            >
              <Link href="/">Ver o LinkBio BR</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm font-medium text-[#0a2d5e]/70">
            Grátis para sempre • Sem cartão • 2 minutos pra configurar
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-balance font-black tracking-[-0.03em] text-foreground sm:text-4xl"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
            Tudo que você precisa num link só
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Link na bio, encurtador, QR code e analytics — numa plataforma só,
            com design que converte.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Link2 className="size-5" />}
            title="Link na bio"
            description="Junte Instagram, YouTube, Spotify, WhatsApp e tudo mais num link só. Com 24 temas prontos e editor visual."
          />
          <FeatureCard
            icon={<Zap className="size-5" />}
            title="Encurtador de URLs"
            description="Transforme links gigantes em /s/abc123. Rastreie cliques, adicione UTMs e conecte a campanhas."
          />
          <FeatureCard
            icon={<QrCode className="size-5" />}
            title="QR Code"
            description="Gere QR codes da sua página ou de qualquer link. Perfeito pra cartão, cardápio, adesivo de carro."
          />
          <FeatureCard
            icon={<BarChart3 className="size-5" />}
            title="Analytics completo"
            description="Veja cliques, fontes, dispositivos, países e metas. Exporte CSV. Integre Meta Pixel, GA4, TikTok."
          />
          <FeatureCard
            icon={<Palette className="size-5" />}
            title="Personalização total"
            description="50+ templates, 16 paletas de cores, fontes custom, CSS próprio. Cada bloco estilizável."
          />
          <FeatureCard
            icon={<Sparkles className="size-5" />}
            title="Domínio próprio"
            description="Use seudominio.com. Formulários, captura de e-mail, integração com ferramentas que você já usa."
          />
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:px-8 sm:py-20">
          <h2
            className="text-balance font-black tracking-[-0.03em]"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
          >
            O nome{" "}
            <span className="italic text-primary">/{slug}</span> está esperando.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/70 sm:text-lg">
            Quem chegar primeiro leva. Leva 1 minuto pra garantir.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link href={signupHref}>
                Criar minha página
                <ArrowRight className="ml-1 size-5" />
              </Link>
            </Button>
          </div>
          <ul className="mx-auto mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-background/60">
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              Grátis pra sempre
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              Sem cartão
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-emerald-400" />
              Suporte em PT-BR
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </span>
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              LinkBio <BrazilFlag className="h-4 w-auto" />
            </span>
          </Link>
          <span className="flex items-center gap-1.5">
            © {new Date().getFullYear()} LinkBio{" "}
            <BrazilFlag className="h-3.5 w-auto" />
          </span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-ios-sm transition hover:shadow-ios-md">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
