"use client";

import { useEffect, useState } from "react";
import type { BlockData, PageTheme } from "@/lib/db/schema";
import { socialIconMap, type SocialIconKey } from "@/components/social-icons";
import { cn } from "@/lib/utils";

// ============== NEWSLETTER ==============

export function NewsletterBlock({
  pageId,
  blockId,
  data,
  theme,
}: {
  pageId: string;
  blockId: string;
  data: Extract<BlockData, { kind: "newsletter" }>;
  theme: PageTheme;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, blockId, email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: theme.accent + "15" }}
    >
      <h3 className="text-center font-bold" style={{ color: theme.foreground }}>
        {data.title}
      </h3>
      {data.description && (
        <p
          className="mt-1 text-center text-sm"
          style={{ color: theme.mutedForeground }}
        >
          {data.description}
        </p>
      )}
      {sent ? (
        <p
          className="mt-4 text-center text-sm font-semibold"
          style={{ color: theme.accent }}
        >
          ✓ Obrigado! Inscrição confirmada.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={data.placeholder}
            required
            className="flex-1 rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none"
            style={{ color: "#0a0a0a" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: theme.accent, color: theme.accentForeground }}
          >
            {loading ? "..." : data.buttonLabel}
          </button>
        </form>
      )}
    </div>
  );
}

// ============== WHATSAPP ==============

export function WhatsappBlock({
  data,
  theme,
  buttonStyle,
  onClick,
}: {
  data: Extract<BlockData, { kind: "whatsapp" }>;
  theme: PageTheme;
  buttonStyle: React.CSSProperties;
  onClick: () => void;
}) {
  const msg = data.message ? `?text=${encodeURIComponent(data.message)}` : "";
  const href = `https://wa.me/${data.phone}${msg}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="block w-full text-center font-semibold transition-transform hover:scale-[1.02]"
      style={buttonStyle}
    >
      {data.label}
    </a>
  );
}

// ============== MUSIC (Spotify / Apple) ==============

export function MusicBlock({
  data,
}: {
  data: Extract<BlockData, { kind: "music" }>;
}) {
  const embedUrl = toMusicEmbed(data);
  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed text-sm opacity-60">
        Adicione um link de {data.provider}
      </div>
    );
  }
  const height =
    data.provider === "spotify" ? 152 : 175; // Apple precisa um pouco mais
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={height}
      allow="encrypted-media; clipboard-write; autoplay *; fullscreen *"
      className="rounded-2xl"
      loading="lazy"
    />
  );
}

function toMusicEmbed(
  data: Extract<BlockData, { kind: "music" }>
): string | null {
  const url = data.url?.trim();
  if (!url) return null;
  try {
    if (data.provider === "spotify") {
      // https://open.spotify.com/track/ID → embed
      const u = new URL(url);
      if (!u.hostname.includes("spotify.com")) return null;
      const path = u.pathname.replace("/embed", "");
      return `https://open.spotify.com${path.startsWith("/") ? "/embed" : "/embed/"}${path.replace(/^\//, "")}`;
    }
    if (data.provider === "apple") {
      const u = new URL(url);
      if (!u.hostname.includes("music.apple.com")) return null;
      // apple usa mesmo URL, só trocar hostname
      return `https://embed.music.apple.com${u.pathname}${u.search}`;
    }
  } catch {}
  return null;
}

// ============== SOCIAL EMBED (Instagram / TikTok) ==============

export function SocialEmbedBlock({
  data,
}: {
  data: Extract<BlockData, { kind: "social-embed" }>;
}) {
  const url = data.url?.trim();
  if (!url) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed text-sm opacity-60">
        Adicione link do post
      </div>
    );
  }

  if (data.provider === "instagram") {
    // Instagram tem endpoint /embed/ nos posts
    let embed = url.replace(/\/?$/, "/");
    if (!embed.includes("/embed")) embed += "embed/";
    return (
      <iframe
        src={embed}
        width="100%"
        height={500}
        allow="encrypted-media"
        frameBorder={0}
        scrolling="no"
        className="rounded-2xl"
        loading="lazy"
      />
    );
  }

  if (data.provider === "tiktok") {
    // Extrai videoId da URL
    const match = url.match(/video\/(\d+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) {
      return (
        <div className="rounded-2xl border-2 border-dashed p-4 text-center text-xs opacity-60">
          URL inválida do TikTok
        </div>
      );
    }
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        width="100%"
        height={740}
        allow="encrypted-media"
        frameBorder={0}
        scrolling="no"
        className="rounded-2xl"
        loading="lazy"
      />
    );
  }

  return null;
}

// ============== FORM ==============

export function FormBlock({
  pageId,
  blockId,
  data,
  theme,
}: {
  pageId: string;
  blockId: string;
  data: Extract<BlockData, { kind: "form" }>;
  theme: PageTheme;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/form-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, blockId, data: values }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: theme.accent + "15" }}
      >
        <p className="font-semibold" style={{ color: theme.foreground }}>
          ✓ {data.successMessage ?? "Recebido!"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: theme.accent + "15" }}
    >
      <h3 className="font-bold" style={{ color: theme.foreground }}>
        {data.title}
      </h3>
      {data.fields.map((f) => (
        <div key={f.id}>
          <label
            className="mb-1 block text-xs"
            style={{ color: theme.mutedForeground }}
          >
            {f.label}
            {f.required && " *"}
          </label>
          {f.type === "textarea" ? (
            <textarea
              required={f.required}
              value={values[f.id] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.id]: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none"
              style={{ color: "#0a0a0a" }}
            />
          ) : (
            <input
              type={
                f.type === "email"
                  ? "email"
                  : f.type === "phone"
                    ? "tel"
                    : "text"
              }
              inputMode={f.type === "phone" ? "tel" : undefined}
              placeholder={
                f.type === "phone" ? "(11) 99999-9999" : undefined
              }
              required={f.required}
              value={values[f.id] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.id]: e.target.value }))
              }
              className="w-full rounded-lg border bg-white/80 px-3 py-2 text-sm outline-none"
              style={{ color: "#0a0a0a" }}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
        style={{ background: theme.accent, color: theme.accentForeground }}
      >
        {loading ? "Enviando..." : data.submitLabel}
      </button>
    </form>
  );
}

// ============== COUNTDOWN ==============

export function CountdownBlock({
  data,
  theme,
}: {
  data: Extract<BlockData, { kind: "countdown" }>;
  theme: PageTheme;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const target = new Date(data.targetDate).getTime();
  const diff = target - now;
  const finished = diff <= 0;

  if (finished) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: theme.accent, color: theme.accentForeground }}
      >
        <p className="text-lg font-black tracking-tight">
          {data.finishedMessage ?? "Acabou!"}
        </p>
      </div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return (
    <div
      className="rounded-2xl p-5 text-center"
      style={{ background: theme.accent + "15" }}
    >
      <p
        className="mb-3 text-sm font-semibold"
        style={{ color: theme.mutedForeground }}
      >
        {data.title}
      </p>
      <div className="flex items-center justify-center gap-2 font-mono text-2xl font-black tabular-nums">
        <CountdownCell value={days} label="dias" />
        <span style={{ color: theme.mutedForeground }}>:</span>
        <CountdownCell value={hours} label="h" />
        <span style={{ color: theme.mutedForeground }}>:</span>
        <CountdownCell value={mins} label="min" />
        <span style={{ color: theme.mutedForeground }}>:</span>
        <CountdownCell value={secs} label="s" />
      </div>
    </div>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span>{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
        {label}
      </span>
    </span>
  );
}

// ============== FAQ ==============

export function FaqBlock({
  data,
  theme,
}: {
  data: Extract<BlockData, { kind: "faq" }>;
  theme: PageTheme;
}) {
  return (
    <div className="space-y-2">
      {data.items.map((item, i) => (
        <details
          key={i}
          className="group rounded-xl border p-3"
          style={{
            borderColor: theme.mutedForeground + "30",
            color: theme.foreground,
          }}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-semibold">
            <span>{item.q}</span>
            <span className="transition-transform group-open:rotate-45">+</span>
          </summary>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: theme.mutedForeground }}
          >
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

// ============== TESTIMONIALS ==============

export function TestimonialsBlock({
  data,
  theme,
}: {
  data: Extract<BlockData, { kind: "testimonials" }>;
  theme: PageTheme;
}) {
  return (
    <div className="space-y-3">
      {data.items.map((t, i) => (
        <blockquote
          key={i}
          className="rounded-2xl p-4"
          style={{ background: theme.accent + "12" }}
        >
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: theme.foreground }}
          >
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className="mt-3 flex items-center gap-2">
            {t.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.avatarUrl}
                alt={t.name}
                className="size-8 rounded-full object-cover"
              />
            )}
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: theme.foreground }}
              >
                {t.name}
              </p>
              {t.role && (
                <p
                  className="text-[10px]"
                  style={{ color: theme.mutedForeground }}
                >
                  {t.role}
                </p>
              )}
            </div>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

// ============== MAP ==============

type MapSrc = { src: string; openUrl: string } | null;

export function toMapSrc(input: string): MapSrc {
  const q = input.trim();
  if (!q) return null;

  // 1. URL de embed direto do Google Maps (Compartilhar → Incorporar um mapa)
  if (q.includes("/maps/embed?pb=")) {
    return { src: q, openUrl: q };
  }

  // 2. URL do Google Maps com coordenadas — /@lat,lng,zoom
  const coordMatch = q.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return {
      src: `https://www.google.com/maps?q=${lat},${lng}&hl=pt-BR&z=16&output=embed`,
      openUrl: q,
    };
  }

  // 3. URL /place/Nome/... — extrai o nome do place
  const placeMatch = q.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1]!.replace(/\+/g, " "));
    return {
      src: `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`,
      openUrl: q,
    };
  }

  // 4. Short link (maps.app.goo.gl / goo.gl/maps) — não dá pra resolver client-side.
  //    Usa o próprio link como embed (funciona parcialmente em alguns casos) + link pra abrir.
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/.test(q)) {
    return {
      src: q,
      openUrl: q,
    };
  }

  // 5. Qualquer outra URL do Google Maps
  if (/^https?:\/\/(www\.)?(google\.com|maps\.google\.com)/i.test(q)) {
    return {
      src: q,
      openUrl: q,
    };
  }

  // 6. Endereço livre / coordenadas em texto
  const encoded = encodeURIComponent(q);
  return {
    src: `https://www.google.com/maps?q=${encoded}&output=embed`,
    openUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  };
}

export function MapBlock({
  data,
  theme,
}: {
  data: Extract<BlockData, { kind: "map" }>;
  theme: PageTheme;
}) {
  const resolved = toMapSrc(data.query);

  if (!resolved) {
    return (
      <div
        className="flex aspect-[2/1] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center text-xs"
        style={{
          borderColor: theme.mutedForeground + "40",
          color: theme.mutedForeground,
        }}
      >
        <p className="font-semibold">📍 Adicione endereço ou link do Google Maps</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl">
      {data.label && (
        <div
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold"
          style={{
            background: theme.accent + "15",
            color: theme.foreground,
          }}
        >
          <span>📍 {data.label}</span>
          <a
            href={resolved.openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Abrir no Maps
          </a>
        </div>
      )}
      <iframe
        src={resolved.src}
        width="100%"
        height={220}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block"
      />
    </div>
  );
}

// ============== EVENTS ==============

export function EventsBlock({
  data,
  theme,
}: {
  data: Extract<BlockData, { kind: "events" }>;
  theme: PageTheme;
}) {
  const future = data.items
    .filter((e) => e.title && e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-2">
      {future.map((e, i) => {
        const d = new Date(e.date);
        const day = d.getDate();
        const month = d.toLocaleString("pt-BR", { month: "short" });
        const content = (
          <>
            <div
              className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-center"
              style={{
                background: theme.accent,
                color: theme.accentForeground,
              }}
            >
              <span className="text-xs font-semibold uppercase">{month}</span>
              <span className="text-lg font-black leading-none">{day}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-semibold"
                style={{ color: theme.foreground }}
              >
                {e.title}
              </p>
              <p
                className="text-xs"
                style={{ color: theme.mutedForeground }}
              >
                {d.toLocaleString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {e.city && ` · ${e.city}`}
              </p>
            </div>
          </>
        );
        return e.url ? (
          <a
            key={i}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border p-2 transition-transform hover:scale-[1.01]"
            style={{ borderColor: theme.mutedForeground + "30" }}
          >
            {content}
          </a>
        ) : (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border p-2"
            style={{ borderColor: theme.mutedForeground + "30" }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

// ============== PRODUCTS ==============

export function ProductsBlock({
  data,
  theme,
  onProductClick,
}: {
  data: Extract<BlockData, { kind: "products" }>;
  theme: PageTheme;
  onProductClick?: (title: string, url: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {data.items.map((p, i) => {
        const inner = (
          <>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.title}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-black/5 text-xs opacity-50">
                sem imagem
              </div>
            )}
            <p
              className="mt-2 truncate text-xs font-semibold"
              style={{ color: theme.foreground }}
            >
              {p.title}
            </p>
            {p.price && (
              <p
                className="text-[11px] font-bold"
                style={{ color: theme.accent }}
              >
                {p.price}
              </p>
            )}
          </>
        );
        return p.url ? (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onProductClick?.(p.title, p.url!)}
            className="rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </a>
        ) : (
          <div
            key={i}
            className="rounded-2xl p-2"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

// ============== GRID (genérico) ==============

function gridColsClass(n: 1 | 2 | 3): string {
  return n === 1 ? "grid-cols-1" : n === 3 ? "grid-cols-3" : "grid-cols-2";
}

export function GridBlock({
  data,
  theme,
  onItemClick,
}: {
  data: Extract<BlockData, { kind: "grid" }>;
  theme: PageTheme;
  onItemClick?: (title: string, url: string) => void;
}) {
  return (
    <div className={`grid ${gridColsClass(data.columns)} gap-2`}>
      {data.items.map((it, i) => {
        const inner = (
          <>
            {it.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.imageUrl}
                alt={it.title ?? ""}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-black/5 text-xs opacity-50">
                sem imagem
              </div>
            )}
            {it.title && (
              <p
                className="mt-2 truncate text-center text-xs font-semibold"
                style={{ color: theme.foreground }}
              >
                {it.title}
              </p>
            )}
          </>
        );
        return it.url ? (
          <a
            key={i}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onItemClick?.(it.title ?? "Item", it.url!)}
            className="rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </a>
        ) : (
          <div
            key={i}
            className="rounded-2xl p-2"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

// ============== IMAGE CAROUSEL ==============

export function ImageCarouselBlock({
  data,
  onItemClick,
}: {
  data: Extract<BlockData, { kind: "image-carousel" }>;
  theme: PageTheme;
  onItemClick?: (title: string, url: string) => void;
}) {
  const aspectStr = data.aspect ?? "3:4";
  const ratio = aspectStr.replace(":", "/");
  // Paisagem (W > H): largura fixa em 18rem mas nunca ultrapassa o
  // container (maxWidth 100%) — garante que não vaza em telas pequenas.
  // Retrato/quadrado: altura fixa em 14rem, largura calculada pela razão.
  const [w, h] = aspectStr.split(":").map(Number);
  const isLandscape = (w ?? 1) > (h ?? 1);
  const cardStyle: React.CSSProperties = isLandscape
    ? {
        aspectRatio: ratio,
        width: "18rem",
        maxWidth: "100%",
        height: "auto",
      }
    : {
        aspectRatio: ratio,
        height: "14rem",
        width: "auto",
      };
  return (
    <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.items.map((it, i) => {
        const card = it.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={it.imageUrl}
            alt={it.caption ?? ""}
            className="rounded-2xl object-cover"
            style={cardStyle}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-2xl bg-black/5 text-xs opacity-50"
            style={cardStyle}
          >
            sem imagem
          </div>
        );
        const content = it.caption ? (
          <>
            {card}
            <p className="truncate px-1 text-center text-[11px] opacity-70">
              {it.caption}
            </p>
          </>
        ) : (
          card
        );
        const wrapCls = "flex-shrink-0 snap-start space-y-1";
        return it.url ? (
          <a
            key={i}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onItemClick?.(it.caption ?? "Imagem", it.url!)}
            className={wrapCls}
          >
            {content}
          </a>
        ) : (
          <div key={i} className={wrapCls}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

// ============== PRODUCT GRID (colunas configuráveis) ==============

export function ProductGridBlock({
  data,
  theme,
  onProductClick,
}: {
  data: Extract<BlockData, { kind: "product-grid" }>;
  theme: PageTheme;
  onProductClick?: (title: string, url: string) => void;
}) {
  return (
    <div className={`grid ${gridColsClass(data.columns)} gap-2`}>
      {data.items.map((p, i) => {
        const inner = (
          <>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.title}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-black/5 text-xs opacity-50">
                sem imagem
              </div>
            )}
            <p
              className="mt-2 truncate text-xs font-semibold"
              style={{ color: theme.foreground }}
            >
              {p.title}
            </p>
            {p.price && (
              <p
                className="text-[11px] font-bold"
                style={{ color: theme.accent }}
              >
                {p.price}
              </p>
            )}
          </>
        );
        return p.url ? (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onProductClick?.(p.title, p.url!)}
            className="rounded-2xl p-2 transition-transform hover:scale-[1.02]"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </a>
        ) : (
          <div
            key={i}
            className="rounded-2xl p-2"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

// ============== PRODUCT CAROUSEL ==============

export function ProductCarouselBlock({
  data,
  theme,
  onProductClick,
}: {
  data: Extract<BlockData, { kind: "product-carousel" }>;
  theme: PageTheme;
  onProductClick?: (title: string, url: string) => void;
}) {
  return (
    <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.items.map((p, i) => {
        const inner = (
          <>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.title}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-black/5 text-xs opacity-50">
                sem imagem
              </div>
            )}
            <p
              className="mt-2 truncate text-xs font-semibold"
              style={{ color: theme.foreground }}
            >
              {p.title}
            </p>
            {p.price && (
              <p
                className="text-[11px] font-bold"
                style={{ color: theme.accent }}
              >
                {p.price}
              </p>
            )}
          </>
        );
        const card = (
          <div
            className="w-40 flex-shrink-0 snap-start rounded-2xl p-2"
            style={{ background: theme.accent + "10" }}
          >
            {inner}
          </div>
        );
        return p.url ? (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onProductClick?.(p.title, p.url!)}
            className="flex-shrink-0 snap-start"
          >
            {card}
          </a>
        ) : (
          <div key={i} className="flex-shrink-0 snap-start">
            {card}
          </div>
        );
      })}
    </div>
  );
}

// ============== BUTTON GRID ==============

export function ButtonGridBlock({
  data,
  theme,
  onButtonClick,
}: {
  data: Extract<BlockData, { kind: "button-grid" }>;
  theme: PageTheme;
  onButtonClick?: (label: string, url: string) => void;
}) {
  const isPlain = (data.style ?? "filled") === "plain";
  return (
    <div className={`grid ${gridColsClass(data.columns)} gap-2`}>
      {data.items.map((b, i) => {
        const Icon =
          b.icon && b.icon in socialIconMap
            ? socialIconMap[b.icon as SocialIconKey]
            : null;
        const hasLabel = Boolean(b.label && b.label.trim());
        const iconOnly = !hasLabel && Icon !== null;
        const style: React.CSSProperties = isPlain
          ? { color: theme.foreground }
          : { background: theme.accent, color: theme.accentForeground };
        return (
          <a
            key={i}
            href={b.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (b.url) onButtonClick?.(b.label || b.icon || "Botão", b.url);
            }}
            className={cn(
              "relative flex items-center justify-center gap-2 text-sm font-semibold transition-transform active:scale-[0.95]",
              // Hover scoped para devices com mouse — evita sticky hover em mobile
              isPlain ? "[@media(hover:hover)]:hover:scale-110" : "[@media(hover:hover)]:hover:scale-[1.02] rounded-xl",
              iconOnly
                ? isPlain
                  ? "aspect-square p-2"
                  : "aspect-square rounded-xl p-3"
                : isPlain
                  ? "py-1"
                  : "rounded-xl px-3 py-3"
            )}
            style={{ ...style, touchAction: "manipulation", pointerEvents: "auto", zIndex: 2 }}
            aria-label={b.label || b.icon || "botão"}
          >
            {Icon && (
              <Icon
                className={cn(
                  "flex-shrink-0",
                  iconOnly
                    ? isPlain
                      ? "size-10"
                      : "size-6"
                    : isPlain
                      ? "size-5"
                      : "size-4"
                )}
              />
            )}
            {hasLabel && <span className="truncate">{b.label}</span>}
            {!Icon && !hasLabel && <span>Botão</span>}
          </a>
        );
      })}
    </div>
  );
}
