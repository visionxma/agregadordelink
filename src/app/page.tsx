import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Palette,
  Sparkles,
  Zap,
  Globe,
  Code2,
  ShieldCheck,
  Users,
  QrCode,
  Link2,
  Mail,
  ListChecks,
  MessageCircle,
  Check,
  Crown,
  Star,
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
import { PLAN_LIST } from "@/lib/plans";

export const metadata: Metadata = {
  title: "LinkBio BR — Sua bio, muito além do link",
  description:
    "Crie sua mini-landing page com links, formulários, newsletter, QR code, encurtador, analytics e domínio próprio. Plataforma brasileira, em português, com pagamento em PIX.",
  alternates: { canonical: "https://linkbiobr.com" },
  openGraph: {
    title: "LinkBio BR — Sua bio, muito além do link",
    description:
      "40 temas, 120+ modelos, 22 tipos de blocos. Plataforma brasileira, em português, com pagamento em PIX.",
    url: "https://linkbiobr.com",
    type: "website",
    siteName: "LinkBio BR",
    locale: "pt_BR",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "LinkBio BR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkBio BR — Sua bio, muito além do link",
    description:
      "40 temas, 120+ modelos, 22 tipos de blocos. Plataforma brasileira, em português, com pagamento em PIX.",
    images: ["/og-default.png"],
  },
};

const THEMES_TOTAL = themePresets.length;
const TEMPLATES_TOTAL = 120;
const BLOCK_TYPES_TOTAL = 22;

export default function HomePage() {
  const featuredThemes = themePresets.slice(0, 6);

  return (
    <main className="min-h-screen text-foreground">
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #c8f5d6 0%, #fff4a3 55%, #c8f5d6 100%)",
        }}
      >
        <div className="px-4 pt-5 sm:px-8 sm:pt-6">
          <header className="container mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full bg-white/95 px-4 shadow-ios-lg backdrop-blur sm:px-6">
            <Link href="/" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 sm:flex">
              <Link href="#recursos" className="hover:text-foreground">
                Recursos
              </Link>
              <Link href="#temas" className="hover:text-foreground">
                Temas
              </Link>
              <Link href="#planos" className="hover:text-foreground">
                Planos
              </Link>
              <Link href="#faq" className="hover:text-foreground">
                FAQ
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

        <div className="container relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#002776] shadow-ios-sm backdrop-blur">
                <BrazilFlag className="h-3 w-auto" /> Plataforma 100% brasileira
              </span>
              <h1
                className="mt-4 text-balance font-black leading-[0.9] tracking-[-0.04em] text-[#002776]"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                Um link na bio<br />
                feito pra <span className="italic">você</span>.
              </h1>
              <p className="mt-4 max-w-lg text-pretty text-base text-[#002776]/80 sm:text-lg">
                Crie sua mini-landing page em português com {BLOCK_TYPES_TOTAL} tipos
                de blocos: links, formulários, newsletter, vídeos, produtos, FAQ,
                contagem regressiva, mapa e mais. Pagamento em PIX, suporte BR.
              </p>

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
                    name="slug"
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
                Sem cartão de crédito · Plano gratuito sem prazo
              </p>
            </div>

            <div className="relative flex items-start justify-center lg:justify-end">
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* STATS REAIS — números do produto */}
      <section className="ambient-bg-subtle border-y border-border/50 px-4 py-10">
        <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: `${THEMES_TOTAL}`, label: "Temas prontos" },
            { value: `${TEMPLATES_TOTAL}+`, label: "Modelos por nicho" },
            { value: `${BLOCK_TYPES_TOTAL}`, label: "Tipos de blocos" },
            { value: "PIX", label: "Pagamento nacional" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black tracking-tight sm:text-4xl">
                <span className="brand-gradient-text">{s.value}</span>
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-14 max-w-3xl">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Recursos
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              Tudo que cabe num link.
              <br />
              <span className="text-muted-foreground">
                Sem código, sem complicação.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCell
              icon={<Palette className="size-5" />}
              title="Editor visual"
              desc="Drag-and-drop com preview ao vivo. Ajusta cor, fonte, sombra, espaçamento e formato dos botões."
            />
            <FeatureCell
              icon={<Sparkles className="size-5" />}
              title={`${TEMPLATES_TOTAL}+ modelos prontos`}
              desc="Criador, restaurante, agência, ecommerce, podcast, evento — começa de um nicho e personaliza."
            />
            <FeatureCell
              icon={<ListChecks className="size-5" />}
              title={`${BLOCK_TYPES_TOTAL} tipos de blocos`}
              desc="Links, texto, imagem, vídeo, formulário, FAQ, depoimentos, contagem regressiva, mapa, eventos, produtos e mais."
            />
            <FeatureCell
              icon={<QrCode className="size-5" />}
              title="QR Code + encurtador"
              desc="Gere QR personalizado e links curtos linkbiobr.com/s para campanhas, flyers e impressos."
            />
            <FeatureCell
              icon={<Mail className="size-5" />}
              title="Newsletter + formulários"
              desc="Capture emails e respostas direto na sua página. Exporte CSV quando precisar."
            />
            <FeatureCell
              icon={<MessageCircle className="size-5" />}
              title="WhatsApp Business"
              desc="Botão direto para conversa, com pré-mensagem configurável e atalho na home."
            />
            <FeatureCell
              icon={<Globe className="size-5" />}
              title="Domínio próprio"
              desc="Conecte seunome.com.br e mantenha a marca. Verificação automática via DNS."
            />
            <FeatureCell
              icon={<BarChart3 className="size-5" />}
              title="Analytics nativo"
              desc="Visitas, cliques, país, dispositivo e fonte de tráfego. Sem precisar de plugin externo."
            />
            <FeatureCell
              icon={<Code2 className="size-5" />}
              title="Pixels + CSS/JS"
              desc="Meta Pixel, GA4, TikTok Pixel. CSS personalizado no Pro, JS no Business."
            />
          </div>
        </div>
      </section>

      {/* TEMAS */}
      <section id="temas" className="ambient-bg-subtle relative px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Visual
            </span>
            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              {THEMES_TOTAL} temas com personalidade.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Presets feitos à mão. Troca completa de aparência com um clique.
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
                Ver todos os {THEMES_TOTAL} temas <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Planos
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              Comece grátis.
              <br />
              <span className="text-muted-foreground">
                Pague só quando crescer.
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pagamento via PIX ou cartão (Abacate Pay). Sem fidelidade, cancele a
              qualquer momento direto pelo painel.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {PLAN_LIST.map((p) => {
              const isFree = p.id === "free";
              const isPro = p.id === "pro";
              const isBiz = p.id === "business";
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-3xl border p-6 shadow-ios-sm transition-all hover:-translate-y-1 hover:shadow-ios-lg sm:p-8 ${
                    isPro
                      ? "border-primary/40 bg-gradient-to-br from-primary/5 via-card to-accent/10"
                      : "border-border bg-card"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-ios-sm">
                      {p.badge}
                    </span>
                  )}

                  <div className="mb-5 flex items-center gap-2">
                    {isFree && (
                      <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Sparkles className="size-4" />
                      </span>
                    )}
                    {isPro && (
                      <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <Star className="size-4 fill-primary" />
                      </span>
                    )}
                    {isBiz && (
                      <span className="flex size-9 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <Crown className="size-4" />
                      </span>
                    )}
                    <h3 className="text-xl font-black">{p.name}</h3>
                  </div>

                  <div className="mb-3">
                    <p className="text-4xl font-black tracking-tight">
                      {isFree ? (
                        <span>Grátis</span>
                      ) : (
                        <>
                          R$ <span>{Math.floor(p.price / 100)}</span>
                          <span className="text-base font-bold text-muted-foreground">
                            /mês
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  </div>

                  <ul className="mb-6 space-y-2 border-t border-border pt-5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className={`mt-auto w-full rounded-full ${
                      isPro
                        ? ""
                        : isBiz
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : ""
                    }`}
                    variant={isFree ? "outline" : "default"}
                  >
                    <Link href="/signup">
                      {isFree ? "Começar grátis" : "Assinar agora"}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Preços em reais (BRL). Os planos pagos incluem teste grátis no
            primeiro acesso. Os recursos exatos por plano estão detalhados em{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              /pricing
            </Link>
            .
          </p>
        </div>
      </section>

      {/* RECURSOS PROFUNDOS */}
      <section className="ambient-bg-subtle px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Por dentro
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
              Feito com ferramentas sérias.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              icon={<ShieldCheck className="size-5" />}
              title="LGPD por padrão"
              desc="Dados em servidores brasileiros, exportação de dados em 1 clique e exclusão pela conta."
            />
            <DetailCard
              icon={<Users className="size-5" />}
              title="Colaboração em equipe"
              desc="Convide editores e visualizadores por página. Pro 3 / Business ilimitado."
            />
            <DetailCard
              icon={<Link2 className="size-5" />}
              title="Encurtador integrado"
              desc="Links linkbiobr.com/s/abc com cliques rastreados, dispositivo e país."
            />
            <DetailCard
              icon={<Zap className="size-5" />}
              title="IA criativa"
              desc="Gere bio, títulos e descrições otimizadas com modelos de IA já integrados."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-24">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Dúvidas frequentes
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Perguntas que recebemos.
            </h2>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-ios-sm">
            {[
              {
                q: "É grátis mesmo? Tem pegadinha?",
                a: "Sim, o plano Free não expira e não pede cartão. Inclui 1 página, até 10 blocos, 24 temas, 50 modelos, encurtador (5), QR Code (3) e analytics de 7 dias. Você só paga se quiser limites maiores ou recursos avançados.",
              },
              {
                q: "Como funciona o pagamento?",
                a: "Aceitamos PIX e cartão de crédito via Abacate Pay (gateway brasileiro). Cobrança mensal, sem fidelidade. Cancele direto na página de Conta a qualquer momento.",
              },
              {
                q: "Posso usar meu próprio domínio?",
                a: "Sim, no plano Pro você conecta 1 domínio (ex.: seusite.com.br) e no Business até 5. Configura o DNS conforme as instruções do painel — costuma ficar pronto em poucos minutos.",
              },
              {
                q: "Os dados são meus?",
                a: "100%. Você pode exportar a qualquer momento (CSV em formulários e newsletter, JSON da página). Para excluir a conta, acesse /dashboard/account ou /exclusao-de-dados.",
              },
              {
                q: "Tem limite de visitas?",
                a: "Não. Sua página suporta visitas ilimitadas em qualquer plano. O que muda é a retenção do histórico do analytics: 7 dias no Free, 90 no Pro, 1 ano no Business.",
              },
              {
                q: "Como entro em contato?",
                a: "O suporte é por email no Pro e prioritário no Business. Para tirar dúvidas gerais ou reportar abuso, abra um chamado pelo seu painel.",
              },
            ].map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {item.q}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45">
                    <ArrowRight className="size-3.5 rotate-45" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div
            className="relative overflow-hidden rounded-[3rem] px-6 py-20 text-center sm:px-16 sm:py-28"
            style={{
              background:
                "linear-gradient(135deg, #002776 0%, #009c3b 55%, #00b84a 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full opacity-50 blur-3xl"
              style={{ background: "#ffdf00" }}
            />
            <div
              className="pointer-events-none absolute -left-40 bottom-0 size-96 rounded-full opacity-40 blur-3xl"
              style={{ background: "#00b84a" }}
            />

            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Plano gratuito sem prazo · Sem cartão
              </div>

              <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl">
                Crie sua página
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
                  em minutos.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-md text-base text-white/70 sm:text-lg">
                Cadastro com email ou Google. Começa publicando hoje mesmo.
              </p>

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
                  <Link href="#planos">Comparar planos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/30 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <LinkBioLogo size="md" />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Plataforma brasileira de mini-landing pages. Feita pela VisionX,
                no Maranhão.
              </p>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <BrazilFlag className="h-3 w-auto" /> Hospedado e operado no
                Brasil
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
                Produto
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#recursos" className="hover:text-foreground">Recursos</Link></li>
                <li><Link href="#temas" className="hover:text-foreground">Temas</Link></li>
                <li><Link href="#planos" className="hover:text-foreground">Planos e preços</Link></li>
                <li><Link href="/dashboard/pages/new" className="hover:text-foreground">Modelos</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
                Conta
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground">Entrar</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Criar conta</Link></li>
                <li><Link href="/forgot-password" className="hover:text-foreground">Recuperar senha</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Painel</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
                Legal
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/termos" className="hover:text-foreground">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-foreground">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/exclusao-de-dados" className="hover:text-foreground">
                    Exclusão de dados
                  </Link>
                </li>
                <li className="text-xs text-muted-foreground/80">
                  Conformidade com LGPD
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>
              © {new Date().getFullYear()} LinkBio BR · Operado por VisionX. Todos
              os direitos reservados.
            </p>
            <div className="flex gap-5">
              <Link href="/termos" className="hover:text-foreground">
                Termos
              </Link>
              <Link href="/privacidade" className="hover:text-foreground">
                Privacidade
              </Link>
              <Link href="/exclusao-de-dados" className="hover:text-foreground">
                Excluir dados
              </Link>
            </div>
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
          <div className="flex h-full flex-col items-center p-6 pt-14 text-white">
            <div className="size-20 overflow-hidden rounded-full ring-4 ring-white/40 bg-white/20">
              <div
                className="size-full"
                style={{
                  background:
                    "radial-gradient(circle, #fff 0%, #ffdf00 100%)",
                }}
              />
            </div>
            <h3 className="mt-4 text-lg font-bold">@seunome</h3>
            <p className="mt-1 text-xs opacity-80">
              Sua bio em uma página
            </p>

            <div className="mt-4 flex gap-3 text-white">
              <InstagramIcon className="size-5" />
              <TiktokIcon className="size-5" />
              <YoutubeIcon className="size-5" />
              <SpotifyIcon className="size-5" />
              <WhatsappIcon className="size-5" />
            </div>

            <div className="mt-6 w-full space-y-2.5">
              {[
                "🛍️ Loja virtual",
                "📅 Agendar atendimento",
                "📨 Newsletter",
                "💬 WhatsApp",
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

      <div className="absolute -left-6 top-16 hidden rotate-[-6deg] rounded-2xl bg-white p-3 shadow-ios-lg sm:block">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-3" />
          </span>
          Pronto em minutos
        </div>
      </div>
      <div className="absolute -right-4 bottom-20 hidden rotate-[4deg] rounded-2xl bg-white p-3 shadow-ios-lg sm:block">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <BarChart3 className="size-3" />
          </span>
          Analytics nativo
        </div>
      </div>
    </div>
  );
}

function FeatureCell({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative border-b border-border p-8 transition-colors last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&]:border-r lg:last:border-r-0 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0 hover:bg-primary/5">
      <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function DetailCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-ios-sm transition-all hover:-translate-y-0.5 hover:shadow-ios">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
