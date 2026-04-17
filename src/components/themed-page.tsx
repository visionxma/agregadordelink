"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AvatarShape,
  BlockData,
  ButtonStyle,
  Effect,
  PageTheme,
  Spacing,
  ThemeBackground,
} from "@/lib/db/schema";
import { fontCssVarMap } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  CountdownBlock,
  EventsBlock,
  FaqBlock,
  FormBlock,
  MapBlock,
  MusicBlock,
  NewsletterBlock,
  ProductsBlock,
  SocialEmbedBlock,
  TestimonialsBlock,
  WhatsappBlock,
} from "./advanced-blocks";
import { cursorCss, playClickSound, TiltWrapper } from "./theme-fx";

// Declara tipos das libs de tracking injetadas (Meta / GA / TikTok / GTM)
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
    };
    dataLayer?: Record<string, unknown>[];
  }
}

// UTM params automáticos — adiciona ?utm_source=linkhub&utm_medium=bio&utm_campaign=<slug>
function withUtm(url: string, campaign: string): string {
  if (!url) return url;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  try {
    const u = new URL(url);
    // Não sobrescreve UTMs que o usuário já colocou
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "linkhub");
    }
    if (!u.searchParams.has("utm_medium")) {
      u.searchParams.set("utm_medium", "bio");
    }
    if (!u.searchParams.has("utm_campaign") && campaign) {
      u.searchParams.set("utm_campaign", campaign);
    }
    return u.toString();
  } catch {
    return url;
  }
}

function dispatchPixelClick(label: string, url: string) {
  if (typeof window === "undefined") return;
  const params = {
    content_name: label,
    content_category: "link_click",
    destination_url: url,
  };
  try {
    window.fbq?.("track", "Lead", params);
  } catch {}
  try {
    window.gtag?.("event", "click_link", params);
  } catch {}
  try {
    window.ttq?.track("ClickButton", params);
  } catch {}
  try {
    window.dataLayer?.push({ event: "link_click", ...params });
  } catch {}
}

export type PreviewBlock = { id: string; type: string; data: BlockData };

export function ThemedPage({
  pageId,
  pageSlug,
  title,
  description,
  avatarUrl,
  coverUrl,
  theme,
  blocks,
  verified = false,
  trackEvents = true,
}: {
  pageId: string;
  pageSlug?: string;
  title: string;
  description: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  theme: PageTheme;
  blocks: PreviewBlock[];
  verified?: boolean;
  trackEvents?: boolean;
}) {
  const viewed = useRef(false);
  useEffect(() => {
    if (!trackEvents || viewed.current) return;
    viewed.current = true;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", pageId }),
      keepalive: true,
    }).catch(() => {});
  }, [pageId, trackEvents]);

  // Som ao clicar — listener global
  useEffect(() => {
    if (!theme.clickSound || theme.clickSound === "none") return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, [role=button]")) {
        playClickSound(theme.clickSound);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [theme.clickSound]);

  const bgStyle = backgroundStyle(theme.background);
  const defaultFontVar = fontCssVarMap[theme.font];
  const defaultTitleVar = fontCssVarMap[theme.titleFont ?? theme.font];
  const fontVar = theme.customFontUrl
    ? `"LinkHubCustomFont", ${defaultFontVar}`
    : defaultFontVar;
  const titleVar = theme.customFontUrl
    ? `"LinkHubCustomFont", ${defaultTitleVar}`
    : defaultTitleVar;
  const spacingCls = spacingClass(theme.spacing);
  const cursorValue = cursorCss(theme.cursor);
  const entryAnim = theme.entryAnimation ?? "none";

  const hasCover = !!coverUrl;
  const bgColorSolid =
    theme.background.type === "solid"
      ? theme.background.color
      : theme.background.type === "gradient"
        ? theme.background.from
        : "rgba(255,255,255,0.1)";

  return (
    <main
      className="relative flex min-h-screen flex-col items-center overflow-hidden antialiased"
      style={{
        ...bgStyle,
        color: theme.foreground,
        fontFamily: fontVar,
        cursor: cursorValue,
      }}
    >
      {theme.customFontUrl && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face { font-family: "LinkHubCustomFont"; src: url("${theme.customFontUrl}"); font-display: swap; }`,
          }}
        />
      )}
      {theme.darkModeAuto && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (prefers-color-scheme: dark) { .auto-dark-wrap > *:not(img):not(video):not(iframe) { filter: invert(1) hue-rotate(180deg); } }`,
          }}
        />
      )}
      <EffectLayer effect={theme.effect} accent={theme.accent} />

      {/* COVER — full-width no topo */}
      {hasCover && (
        <div className="relative z-10 w-full max-w-md overflow-hidden">
          <div className="relative aspect-[3/1] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl!}
              alt=""
              className="size-full object-cover"
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative z-10 w-full max-w-md px-4",
          hasCover ? "pb-12 -mt-12" : "py-12",
          !hasCover && spacingCls
        )}
      >
        <header className="flex flex-col items-center text-center">
          {avatarUrl && (
            <div
              className={cn(
                "mb-4 size-24 overflow-hidden",
                avatarShapeClass(theme.avatarShape),
                hasCover && "ring-4"
              )}
              style={
                hasCover
                  ? { boxShadow: `0 0 0 4px ${bgColorSolid}, 0 8px 24px rgba(0,0,0,0.12)` }
                  : { boxShadow: `0 0 0 2px ${bgColorSolid}` }
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={title}
                className="size-full object-cover"
              />
            </div>
          )}
          <h1
            className="inline-flex items-center gap-1.5 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: titleVar }}
          >
            {title}
            {verified && <VerifiedBadge color={theme.accent} />}
          </h1>
          {description && (
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: theme.mutedForeground }}
            >
              {description}
            </p>
          )}
        </header>

        <div className={cn("mt-8", blocksGapClass(theme.spacing))}>
          {blocks.map((b, i) => (
            <AnimatedWrap key={b.id} index={i} animation={entryAnim}>
              <BlockView
                block={b}
                theme={theme}
                pageId={pageId}
                pageSlug={pageSlug}
                trackEvents={trackEvents}
              />
            </AnimatedWrap>
          ))}
        </div>

        <footer
          className="flex flex-col items-center gap-2 pt-12 text-center text-xs"
          style={{ color: theme.mutedForeground }}
        >
          <span>
            Feito com{" "}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
              style={{ color: theme.foreground }}
            >
              LinkHub
            </a>
          </span>
          {pageSlug && (
            <ReportButton pageId={pageId} pageSlug={pageSlug} />
          )}
        </footer>
      </div>
    </main>
  );
}

function backgroundStyle(bg: ThemeBackground): React.CSSProperties {
  if (bg.type === "solid") return { background: bg.color };
  if (bg.type === "gradient") {
    const dir = {
      "to-br": "to bottom right",
      "to-bl": "to bottom left",
      "to-tr": "to top right",
      "to-tl": "to top left",
      "to-r": "to right",
      "to-b": "to bottom",
    }[bg.direction];
    const stops = bg.via
      ? `${bg.from}, ${bg.via}, ${bg.to}`
      : `${bg.from}, ${bg.to}`;
    return { background: `linear-gradient(${dir}, ${stops})` };
  }
  return {
    backgroundImage: `url(${bg.url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

function avatarShapeClass(shape: AvatarShape): string {
  switch (shape) {
    case "circle":
      return "rounded-full";
    case "square":
      return "rounded-none";
    case "rounded":
      return "rounded-2xl";
    case "hexagon":
      return "rounded-[30%]";
  }
}

function spacingClass(s: Spacing): string {
  return s === "tight" ? "py-4" : s === "loose" ? "py-10" : "py-6";
}

function blocksGapClass(s: Spacing): string {
  return s === "tight"
    ? "flex flex-col gap-2"
    : s === "loose"
      ? "flex flex-col gap-5"
      : "flex flex-col gap-3";
}

function AnimatedWrap({
  children,
  index,
  animation,
}: {
  children: React.ReactNode;
  index: number;
  animation: "none" | "fade" | "slide-up" | "scale" | "stagger";
}) {
  if (animation === "none") return <>{children}</>;
  const cls =
    animation === "fade"
      ? "animate-fade-in"
      : animation === "scale"
        ? "animate-scale-in"
        : "animate-slide-up";
  const delay = animation === "stagger" ? Math.min(index * 70, 700) : 0;
  return (
    <div
      className={cls}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

function VerifiedBadge({ color }: { color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      title="Perfil verificado"
      style={{
        width: "0.85em",
        height: "0.85em",
        background: color,
        color: "white",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="60%"
        height="60%"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function ReportButton({
  pageId,
  pageSlug,
}: {
  pageId: string;
  pageSlug: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] underline underline-offset-2 opacity-50 hover:opacity-100"
      >
        Denunciar esta página
      </button>
      {open && (
        <ReportModal
          pageId={pageId}
          pageSlug={pageSlug}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ReportModal({
  pageId,
  pageSlug,
  onClose,
}: {
  pageId: string;
  pageSlug: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/report-abuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, pageSlug, reason, description, email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-left text-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center">
            <p className="text-lg font-bold">Obrigado</p>
            <p className="mt-1 text-sm text-neutral-600">
              Nossa equipe vai revisar em até 24h.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Denunciar página</h3>
              <p className="text-sm text-neutral-600">
                Essa página viola nossas regras?
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Motivo</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="spam">Spam / enganosa</option>
                <option value="phishing">Phishing / golpe</option>
                <option value="adult">Conteúdo adulto</option>
                <option value="violence">Violência</option>
                <option value="copyright">Violação de direitos autorais</option>
                <option value="hate">Discurso de ódio</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Detalhes (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                placeholder="Conta mais sobre o problema..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Seu email (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                placeholder="pra te avisar do resultado"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Denunciar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EffectLayer({
  effect,
  accent,
}: {
  effect: Effect;
  accent: string;
}) {
  if (effect === "none") return null;

  if (effect === "stars") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 25px 5px, white, transparent), radial-gradient(1px 1px at 50px 25px, white, transparent), radial-gradient(1px 1px at 125px 20px, white, transparent), radial-gradient(1.5px 1.5px at 150px 110px, white, transparent), radial-gradient(1px 1px at 200px 50px, white, transparent), radial-gradient(2px 2px at 180px 120px, white, transparent)",
            backgroundSize: "200px 200px",
          }}
        />
      </div>
    );
  }

  if (effect === "grid") {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    );
  }

  if (effect === "noise") {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23noise)' /></svg>\")",
        }}
      />
    );
  }

  if (effect === "gradient-mesh") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 size-96 rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />
        <div
          className="absolute -bottom-20 -right-20 size-96 rounded-full opacity-20 blur-3xl"
          style={{ background: accent }}
        />
      </div>
    );
  }

  return null;
}

function BlockView({
  block,
  theme,
  pageId,
  pageSlug,
  trackEvents,
}: {
  block: PreviewBlock;
  theme: PageTheme;
  pageId: string;
  pageSlug?: string;
  trackEvents: boolean;
}) {
  function trackClick(label: string, url: string) {
    // Pixels externos (Meta, GA, TikTok, GTM)
    dispatchPixelClick(label, url);
    // Analytics interno
    if (!trackEvents) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click", pageId, blockId: block.id }),
      keepalive: true,
    }).catch(() => {});
  }

  const d = block.data;

  if (d.kind === "link") {
    const campaign = pageSlug ?? "bio";
    const finalUrl = withUtm(d.url || "#", campaign);
    const hover = theme.buttonHover ?? "none";
    const hoverCls =
      hover === "lift"
        ? "hover:-translate-y-1 hover:shadow-2xl"
        : hover === "none"
          ? "hover:scale-[1.02]"
          : "";
    const linkEl = (
      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(d.label, finalUrl)}
        className={cn(
          "group block w-full text-center font-semibold transition-all duration-200 active:scale-[0.98]",
          hoverCls
        )}
        style={buttonStyleCss(
          theme.buttonStyle,
          theme.accent,
          theme.accentForeground,
          theme.foreground
        )}
      >
        {d.label || "Meu link"}
      </a>
    );
    if (hover === "tilt" || hover === "glare") {
      return <TiltWrapper hoverStyle={hover}>{linkEl}</TiltWrapper>;
    }
    return linkEl;
  }

  if (d.kind === "text") {
    return (
      <p
        className="py-2 text-sm leading-relaxed"
        style={{
          textAlign: d.align ?? "center",
          color: theme.mutedForeground,
        }}
      >
        {d.content}
      </p>
    );
  }

  if (d.kind === "image") {
    const campaign = pageSlug ?? "bio";
    const finalHref = d.href ? withUtm(d.href, campaign) : undefined;
    const img = d.url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={d.url}
        alt={d.alt ?? ""}
        className="w-full rounded-2xl"
      />
    ) : (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed text-sm opacity-60">
        Adicione uma URL de imagem
      </div>
    );
    return finalHref ? (
      <a
        href={finalHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(d.alt ?? "Imagem", finalHref)}
      >
        {img}
      </a>
    ) : (
      img
    );
  }

  if (d.kind === "video") {
    if (!d.videoId) {
      return (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed text-sm opacity-60">
          Adicione um ID de vídeo
        </div>
      );
    }
    const src =
      d.provider === "youtube"
        ? `https://www.youtube.com/embed/${d.videoId}`
        : `https://player.vimeo.com/video/${d.videoId}`;
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl">
        <iframe
          src={src}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  if (d.kind === "divider") {
    return (
      <hr
        className="my-2 opacity-20"
        style={{ borderColor: theme.foreground }}
      />
    );
  }

  if (d.kind === "newsletter") {
    return (
      <NewsletterBlock
        pageId={pageId}
        blockId={block.id}
        data={d}
        theme={theme}
      />
    );
  }

  if (d.kind === "whatsapp") {
    const btnStyle = buttonStyleCss(
      theme.buttonStyle,
      "#25d366",
      "#ffffff",
      theme.foreground
    );
    return (
      <WhatsappBlock
        data={d}
        theme={theme}
        buttonStyle={btnStyle}
        onClick={() => trackClick(d.label, `https://wa.me/${d.phone}`)}
      />
    );
  }

  if (d.kind === "music") return <MusicBlock data={d} />;

  if (d.kind === "social-embed") return <SocialEmbedBlock data={d} />;

  if (d.kind === "form") {
    return (
      <FormBlock pageId={pageId} blockId={block.id} data={d} theme={theme} />
    );
  }

  if (d.kind === "countdown") return <CountdownBlock data={d} theme={theme} />;

  if (d.kind === "faq") return <FaqBlock data={d} theme={theme} />;

  if (d.kind === "testimonials")
    return <TestimonialsBlock data={d} theme={theme} />;

  if (d.kind === "map") return <MapBlock data={d} theme={theme} />;

  if (d.kind === "events") return <EventsBlock data={d} theme={theme} />;

  if (d.kind === "products") {
    return (
      <ProductsBlock
        data={d}
        theme={theme}
        onProductClick={(title, url) => trackClick(title, url)}
      />
    );
  }

  return null;
}

function buttonStyleCss(
  style: ButtonStyle,
  accent: string,
  accentFg: string,
  fg: string
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "14px 20px",
    display: "block",
  };

  switch (style) {
    case "rounded":
      return {
        ...base,
        background: accent,
        color: accentFg,
        borderRadius: "14px",
      };
    case "sharp":
      return {
        ...base,
        background: accent,
        color: accentFg,
        borderRadius: "0",
      };
    case "pill":
      return {
        ...base,
        background: accent,
        color: accentFg,
        borderRadius: "9999px",
      };
    case "outline":
      return {
        ...base,
        background: "transparent",
        color: fg,
        border: `2px solid ${accent}`,
        borderRadius: "12px",
      };
    case "neubrutalism":
      return {
        ...base,
        background: accent,
        color: accentFg,
        border: `3px solid ${fg}`,
        borderRadius: "0",
        boxShadow: `6px 6px 0 ${fg}`,
      };
    case "glass":
      return {
        ...base,
        background: "rgba(255,255,255,0.1)",
        color: fg,
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "14px",
        backdropFilter: "blur(10px)",
      };
    case "shadow":
      return {
        ...base,
        background: accent,
        color: accentFg,
        borderRadius: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      };
    case "underline":
      return {
        ...base,
        background: "transparent",
        color: fg,
        borderBottom: `2px solid ${fg}`,
        borderRadius: "0",
        padding: "12px 0",
      };
  }
}
