"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Smile, Sparkles } from "lucide-react";
import { socialIconMap, type SocialIconKey } from "@/components/social-icons";
import { cn } from "@/lib/utils";

const SOCIAL_LABELS: Record<SocialIconKey, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
  threads: "Threads",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  twitch: "Twitch",
  spotify: "Spotify",
  "apple-music": "Apple Music",
  soundcloud: "SoundCloud",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  discord: "Discord",
  email: "E-mail",
  website: "Site",
  github: "GitHub",
  pinterest: "Pinterest",
  patreon: "Patreon",
};

const SOCIAL_ORDER: SocialIconKey[] = [
  "whatsapp", "instagram", "twitter", "youtube", "tiktok",
  "facebook", "linkedin", "github", "twitch", "discord",
  "telegram", "threads", "spotify", "apple-music", "soundcloud",
  "pinterest", "patreon", "email", "website",
];

const EMOJI_GROUPS: { name: string; emojis: string[] }[] = [
  {
    name: "Populares",
    emojis: ["🔥", "✨", "⭐", "💥", "🎉", "🚀", "❤️", "👀", "🎯", "💎", "🏆", "💯"],
  },
  {
    name: "Comida",
    emojis: ["🍔", "🍕", "🌭", "🥪", "🌮", "🍣", "🍜", "🍝", "🥗", "🍰", "🍩", "☕", "🍺", "🍷", "🥤"],
  },
  {
    name: "Negócio",
    emojis: ["🛍️", "🛒", "💰", "💳", "📦", "📈", "📊", "💼", "🏢", "🎁", "🏷️", "💸", "🤝", "✅"],
  },
  {
    name: "Mídia",
    emojis: ["📸", "🎥", "🎬", "🎙️", "🎧", "🎵", "📺", "📻", "🎤", "📷", "🎨", "🖼️"],
  },
  {
    name: "Comunicação",
    emojis: ["📱", "💬", "📞", "📧", "📨", "📩", "🔔", "📢", "📣", "💌", "🗣️", "✉️"],
  },
  {
    name: "Lugares",
    emojis: ["📍", "🗺️", "🏠", "🏡", "🏪", "🏨", "✈️", "🚗", "🚙", "🚕", "🛵", "📌"],
  },
  {
    name: "Eventos",
    emojis: ["📅", "🗓️", "⏰", "🎫", "🎪", "🎭", "🎤", "🥂", "🎊", "🎂", "💐", "🌹"],
  },
  {
    name: "Esporte",
    emojis: ["⚽", "🏀", "🎾", "🏐", "🏈", "⚾", "🎱", "🏓", "🥋", "🏋️", "🚴", "🏃"],
  },
  {
    name: "Tech",
    emojis: ["💻", "⌨️", "🖥️", "📲", "🔧", "⚙️", "🤖", "🎮", "🕹️", "💾", "📡", "🔌"],
  },
];

function isSocialKey(v?: string): v is SocialIconKey {
  return !!v && v in socialIconMap;
}

export function LinkIconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "social">(
    isSocialKey(value) ? "social" : "emoji"
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const SocialIcon = isSocialKey(value) ? socialIconMap[value] : null;
  const isEmoji = !!value && !isSocialKey(value);

  function pick(v: string | undefined) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border border-input bg-card px-2.5 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted",
          open && "border-primary/50 ring-2 ring-primary/20"
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-base">
          {SocialIcon ? (
            <SocialIcon className="size-4 text-foreground" />
          ) : isEmoji ? (
            <span className="leading-none">{value}</span>
          ) : (
            <Smile className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="flex-1 truncate text-left text-xs font-medium">
          {SocialIcon
            ? SOCIAL_LABELS[value as SocialIconKey]
            : isEmoji
              ? "Emoji selecionado"
              : "Adicionar ícone"}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              pick(undefined);
            }}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remover ícone"
          >
            <X className="size-3" />
          </button>
        )}
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-ios-lg">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setTab("emoji")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "emoji"
                  ? "bg-card text-foreground shadow-ios-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smile className="size-3.5" /> Emoji
            </button>
            <button
              type="button"
              onClick={() => setTab("social")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === "social"
                  ? "bg-card text-foreground shadow-ios-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="size-3.5" /> Redes
            </button>
          </div>

          {/* Content */}
          <div className="max-h-72 overflow-y-auto p-3">
            {tab === "emoji" ? (
              <>
                {/* Custom emoji input */}
                <div className="mb-3">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Cole qualquer emoji
                  </label>
                  <input
                    type="text"
                    defaultValue={isEmoji ? value : ""}
                    placeholder="🍔"
                    maxLength={4}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v) pick(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) pick(v);
                      }
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-2xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Emoji groups */}
                {EMOJI_GROUPS.map((g) => (
                  <div key={g.name} className="mb-3 last:mb-0">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {g.name}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {g.emojis.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => pick(e)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-primary/10",
                            value === e && "bg-primary/15 ring-2 ring-primary"
                          )}
                          title={e}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {SOCIAL_ORDER.map((k) => {
                  const Icon = socialIconMap[k];
                  const active = value === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => pick(k)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-xs transition-colors hover:bg-muted",
                        active && "border-primary/40 bg-primary/10"
                      )}
                    >
                      <Icon className="size-4 text-foreground" />
                      <span className="truncate font-medium">{SOCIAL_LABELS[k]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Renderiza o ícone (emoji ou ícone social) no tamanho dado. */
export function LinkIconRender({
  icon,
  className,
  size = 20,
}: {
  icon?: string;
  className?: string;
  size?: number;
}) {
  if (!icon) return null;
  if (isSocialKey(icon)) {
    const Comp = socialIconMap[icon];
    return <Comp className={className ?? "shrink-0"} style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center leading-none", className)}
      style={{ fontSize: size }}
    >
      {icon}
    </span>
  );
}

export { isSocialKey };
