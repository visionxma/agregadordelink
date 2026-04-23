import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Palette,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeThumbnail } from "@/components/theme-thumbnail";
import {
  InstagramIcon,
  SpotifyIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@/components/social-icons";
import { BrazilFlag } from "@/components/brazil-flag";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { themePresets } from "@/lib/themes";

export default function HomePage() {
  const featuredThemes = themePresets.slice(0, 6);

  return (
    <main className="min-h-screen text-foreground">
      {/* HERO — gradiente suave com verde e amarelo da bandeira */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #c8f5d6 0%, #fff4a3 55%, #c8f5d6 100%)",
        }}
      >
        {/* Navbar rounded pill no topo */}
        <div className="px-4 pt-5 sm:px-8 sm:pt-6">
          <header className="container mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full bg-white/95 px-4 shadow-ios-lg backdrop-blur sm:px-6">
            <Link href="/" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 sm:flex">
              <Link href="#temas" className="hover:text-foreground">
                Temas
              </Link>
              <Link href="#features" className="hover:text-foreground">
                Recursos
              </Link>
              <Link href="/dashboard/pages/new" className="hover:text-foreground">
                Modelos
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href="/signup">Criar grátis</Link>
              </Button>
            </div>
          </header>
        </div>

        {/* Hero content */}
        <div className="container relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* Copy */}
            <div className="relative z-10">
              <h1
                className="text-balance font-black leading-[0.9] tracking-[-0.04em] text-[#002776]"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                Um link na bio<br />
                feito pra <span className="italic">você</span>.
              </h1>
              <p className="mt-4 max-w-lg text-pretty text-base text-[#002776]/80 sm:text-lg">
                Entre 70 mil criadores que usam o LinkBio BR. Um link só
                pra compartilhar tudo que você cria, coleciona e vende no
                Instagram, TikTok, YouTube e outras redes.
              </p>

              {/* Input + CTA grande */}
              <form
                action="/signup"
                className="mt-6 flex flex-col gap-3 rounded-full bg-white p-2 shadow-ios-lg sm:max-w-md sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-2 px-4">
                  <span className="text-sm font-semibold text-muted-foreground">
                    linkbiobr.com/
                  </span>
                  <input
                    type="text"
                    placeholder="seu-user"
                    className="h-11 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-full px-6 text-base font-semibold"
                >
                  Criar grátis <ArrowRight className="size-4" />
                </Button>
              </form>

              <p className="mt-3 text-sm text-[#002776]/70">
                Sem cartão de crédito · Pronto em 30 segundos
              </p>
            </div>

            {/* Mockup phone à direita */}
            <div className="relative flex items-start justify-center lg:justify-end">
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* THEMES GALLERY */}
      <section id="temas" className="ambient-bg-subtle relative px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Visual
            </span>
            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              Temas com personalidade.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              24 presets feitos à mão. Troca com um clique.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featuredThemes.map((t) => (
              <div key={t.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl ring-1 ring-border transition-all group-hover:-translate-y-1 group-hover:shadow-ios-lg group-hover:ring-primary">
                  <ThemeThumbnail theme={t.theme} label={t.name} />
                </div>
                <div className="mt-3 px-1">
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.vibe}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="glass">
              <Link href="/signup">
                Ver todos os 24 temas <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-14 max-w-3xl">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Recursos
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              Tudo que um link na bio deveria ter
              <br />
              <span className="text-muted-foreground">
                mas nunca teve.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCell
              icon={<Palette className="size-5" />}
              title="Editor visual"
              desc="Drag-and-drop, preview ao vivo, sem código. Aí sim, tipo Canva."
            />
            <FeatureCell
              icon={<Sparkles className="size-5" />}
              title="50+ modelos prontos"
              desc="Criador, negócio, podcast, ecommerce — começa de um e customiza tudo."
            />
            <FeatureCell
              icon={<Zap className="size-5" />}
              title="QR code + encurtador"
              desc="Link curto pra compartilhar + QR em PNG ou SVG."
            />
            <FeatureCell
              icon={<BarChart3 className="size-5" />}
              title="Analytics de verdade"
              desc="Funil visita → clique → compra. Não só contador de clique."
              soon
            />
            <FeatureCell
              icon={<Palette className="size-5" />}
              title="Domínio próprio"
              desc="seunome.com aponta direto pra sua bio. SEO bom, imagem melhor."
            />
            <FeatureCell
              icon={<Sparkles className="size-5" />}
              title="SEO nativo"
              desc="Meta tags, Open Graph, sitemap. Google indexa de verdade."
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div
            className="relative overflow-hidden rounded-[3rem] px-6 py-24 text-center sm:px-16 sm:py-32"
            style={{
              background:
                "linear-gradient(135deg, #002776 0%, #009c3b 55%, #00b84a 100%)",
            }}
          >
            {/* Stars */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 25px 5px, white, transparent), radial-gradient(1.5px 1.5px at 150px 110px, white, transparent), radial-gradient(1px 1px at 200px 50px, white, transparent), radial-gradient(2px 2px at 180px 120px, white, transparent), radial-gradient(1px 1px at 320px 70px, white, transparent), radial-gradient(1.5px 1.5px at 400px 180px, white, transparent)",
                backgroundSize: "300px 300px",
              }}
            />

            {/* Glow orbs */}
            <div
              className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full opacity-50 blur-3xl"
              style={{ background: "#ffdf00" }}
            />
            <div
              className="pointer-events-none absolute -left-40 bottom-0 size-96 rounded-full opacity-40 blur-3xl"
              style={{ background: "#00b84a" }}
            />

            {/* Floating ornaments */}
            <div className="pointer-events-none absolute left-8 top-16 hidden size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl animate-float lg:flex">
              <Sparkles className="size-6 text-white" />
            </div>
            <div className="pointer-events-none absolute right-12 bottom-24 hidden size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl animate-float lg:flex" style={{ animationDelay: "1.5s" }}>
              <Zap className="size-5 text-white" />
            </div>

            <div className="relative">
              {/* Live badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Grátis pra sempre · Sem cartão
              </div>

              {/* Huge title */}
              <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
                Começa agora.
                <br />
                <span
                  className="italic"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(90,200,250,0.6) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Gasta 30 segundos.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-md text-base text-white/70 sm:text-lg">
                Sua página fica pronta antes do café esfriar.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group h-14 rounded-full bg-white px-8 text-base font-semibold text-foreground shadow-2xl hover:bg-white hover:scale-[1.03]"
                >
                  <Link href="/signup">
                    Criar minha página grátis
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur-xl hover:bg-white/10"
                >
                  <Link href="#temas">Ver temas</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                <div className="flex items-center gap-3">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[
                      "#60a5fa",
                      "#34d399",
                      "#fbbf24",
                      "#f87171",
                    ].map((c, i) => (
                      <span
                        key={i}
                        className="inline-block size-8 rounded-full ring-2 ring-[#0a4fa3]"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, white, ${c})`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">70k+</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/60">
                      criadores
                    </p>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/20" />

                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-300 text-amber-300"
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">4.9</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/60">
                      de 2.4k avaliações
                    </p>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/20" />

                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                    <Users className="size-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">50+</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/60">
                      modelos prontos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 px-4 py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-1.5">
            © 2026 LinkBio <BrazilFlag className="h-3.5 w-auto" />. Feito
            pela VisionX no Maranhão, Brasil.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroPhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="relative rounded-[48px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
        <div
          className="relative h-[560px] overflow-hidden rounded-[36px]"
          style={{
            background:
              "linear-gradient(135deg, #002776 0%, #009c3b 55%, #ffdf00 100%)",
          }}
        >
          {/* Conteúdo mockado */}
          <div className="flex h-full flex-col items-center p-6 pt-14 text-white">
            {/* Avatar */}
            <div className="size-20 overflow-hidden rounded-full ring-4 ring-white/40 bg-white/20">
              <div
                className="size-full"
                style={{
                  background:
                    "radial-gradient(circle, #fff 0%, #ffdf00 100%)",
                }}
              />
            </div>
            <h3 className="mt-4 text-lg font-bold">@visionxdev</h3>
            <p className="mt-1 text-xs opacity-80">
              Criador de conteúdo · SP
            </p>

            {/* Ícones sociais */}
            <div className="mt-4 flex gap-3 text-white">
              <InstagramIcon className="size-5" />
              <TiktokIcon className="size-5" />
              <YoutubeIcon className="size-5" />
              <SpotifyIcon className="size-5" />
              <WhatsappIcon className="size-5" />
            </div>

            {/* Botões fake */}
            <div className="mt-6 w-full space-y-2.5">
              {[
                "✨ Meu novo vídeo",
                "🎁 Baixar ebook grátis",
                "📅 Agendar sessão",
                "💌 Newsletter",
              ].map((t) => (
                <div
                  key={t}
                  className="w-full rounded-2xl bg-white py-3 text-center text-sm font-semibold text-[#002776] shadow-sm"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -left-6 top-16 hidden rotate-[-6deg] rounded-2xl bg-white p-3 shadow-ios-lg sm:block">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-3" />
          </span>
          Criado em 30s
        </div>
      </div>
      <div className="absolute -right-4 bottom-20 hidden rotate-[4deg] rounded-2xl bg-white p-3 shadow-ios-lg sm:block">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="size-6 rounded-lg bg-emerald-500" />
          +12 cliques hoje
        </div>
      </div>
    </div>
  );
}

function FeatureCell({
  icon,
  title,
  desc,
  soon,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  soon?: boolean;
}) {
  return (
    <div className="group relative border-b border-border p-8 transition-colors last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&]:border-r lg:last:border-r-0 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0 hover:bg-primary/5">
      <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold">{title}</h3>
        {soon && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            em breve
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
