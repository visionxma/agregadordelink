"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown, X, Smile, Sparkles, Shapes, Search,
  // ─── Curated lucide set (categorias) ──────────────────────────
  ShoppingBag, ShoppingCart, Store, Tag, Package, Wallet, CreditCard,
  Receipt, Briefcase, Building2, BadgeDollarSign, Gift,
  UtensilsCrossed, Pizza, Coffee, Wine, Beer, Cake, IceCream,
  ChefHat, Apple, Cookie, Soup, Sandwich,
  Video, Camera, Mic, Headphones, Film, Image as ImageIcon, Music, Radio,
  Tv, PlayCircle, Podcast, Disc,
  Mail, MessageCircle, MessageSquare, Phone, Send, Bell, Megaphone, AtSign, Inbox,
  MapPin, Map, Home, Building, Plane, Car, Bus, Bike, Compass, Globe,
  Calendar, CalendarDays, Clock, Ticket, Star, PartyPopper, Trophy, Award,
  Book, BookOpen, GraduationCap, School, Lightbulb, Brain, Library, NotebookPen, FileText,
  Dumbbell, Medal, Footprints, Activity, Target,
  Laptop, Smartphone, Monitor, Gamepad2, Cpu, Code, Terminal, Wifi, Cloud, Database, Settings,
  Heart, ThumbsUp, Eye, Download, Upload, ExternalLink, Link as LinkIcon,
  Share2, Bookmark, Flag, Lock, Unlock, User, Users, Zap, Sun, Moon, Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  { name: "Populares", emojis: ["🔥", "✨", "⭐", "💥", "🎉", "🚀", "❤️", "👀", "🎯", "💎", "🏆", "💯"] },
  { name: "Comida", emojis: ["🍔", "🍕", "🌭", "🥪", "🌮", "🍣", "🍜", "🍝", "🥗", "🍰", "🍩", "☕", "🍺", "🍷", "🥤"] },
  { name: "Negócio", emojis: ["🛍️", "🛒", "💰", "💳", "📦", "📈", "📊", "💼", "🏢", "🎁", "🏷️", "💸", "🤝", "✅"] },
  { name: "Mídia", emojis: ["📸", "🎥", "🎬", "🎙️", "🎧", "🎵", "📺", "📻", "🎤", "📷", "🎨", "🖼️"] },
  { name: "Comunicação", emojis: ["📱", "💬", "📞", "📧", "📨", "📩", "🔔", "📢", "📣", "💌", "🗣️", "✉️"] },
  { name: "Lugares", emojis: ["📍", "🗺️", "🏠", "🏡", "🏪", "🏨", "✈️", "🚗", "🚙", "🚕", "🛵", "📌"] },
  { name: "Eventos", emojis: ["📅", "🗓️", "⏰", "🎫", "🎪", "🎭", "🎤", "🥂", "🎊", "🎂", "💐", "🌹"] },
  { name: "Esporte", emojis: ["⚽", "🏀", "🎾", "🏐", "🏈", "⚾", "🎱", "🏓", "🥋", "🏋️", "🚴", "🏃"] },
  { name: "Tech", emojis: ["💻", "⌨️", "🖥️", "📲", "🔧", "⚙️", "🤖", "🎮", "🕹️", "💾", "📡", "🔌"] },
];

// ─── Lucide curated set ───────────────────────────────────────────────────────
// Format armazenado: "l:NomeDoIcone" (ex.: "l:ShoppingBag")
const LUCIDE_MAP: Record<string, LucideIcon> = {
  // Negócio
  ShoppingBag, ShoppingCart, Store, Tag, Package, Wallet, CreditCard, Receipt,
  Briefcase, Building2, BadgeDollarSign, Gift,
  // Comida
  UtensilsCrossed, Pizza, Coffee, Wine, Beer, Cake, IceCream, ChefHat, Apple,
  Cookie, Soup, Sandwich,
  // Mídia
  Video, Camera, Mic, Headphones, Film, Image: ImageIcon, Music, Radio, Tv,
  PlayCircle, Podcast, Disc,
  // Comunicação
  Mail, MessageCircle, MessageSquare, Phone, Send, Bell, Megaphone, AtSign, Inbox,
  // Lugares
  MapPin, Map, Home, Building, Plane, Car, Bus, Bike, Compass, Globe,
  // Eventos
  Calendar, CalendarDays, Clock, Ticket, Star, PartyPopper, Trophy, Award,
  // Educação
  Book, BookOpen, GraduationCap, School, Lightbulb, Brain, Library, NotebookPen,
  FileText,
  // Esporte
  Dumbbell, Medal, Footprints, Activity, Target,
  // Tech
  Laptop, Smartphone, Monitor, Gamepad2, Cpu, Code, Terminal, Wifi, Cloud,
  Database, Settings,
  // Geral
  Heart, ThumbsUp, Eye, Download, Upload, ExternalLink, Link: LinkIcon,
  Share2, Bookmark, Flag, Lock, Unlock, User, Users, Zap, Sun, Moon, Flame,
};

const LUCIDE_GROUPS: { name: string; icons: string[] }[] = [
  { name: "Negócio", icons: ["ShoppingBag", "ShoppingCart", "Store", "Tag", "Package", "Wallet", "CreditCard", "Receipt", "Briefcase", "Building2", "BadgeDollarSign", "Gift"] },
  { name: "Comida", icons: ["UtensilsCrossed", "Pizza", "Coffee", "Wine", "Beer", "Cake", "IceCream", "ChefHat", "Apple", "Cookie", "Soup", "Sandwich"] },
  { name: "Mídia", icons: ["Video", "Camera", "Mic", "Headphones", "Film", "Image", "Music", "Radio", "Tv", "PlayCircle", "Podcast", "Disc"] },
  { name: "Comunicação", icons: ["Mail", "MessageCircle", "MessageSquare", "Phone", "Send", "Bell", "Megaphone", "AtSign", "Inbox"] },
  { name: "Lugares", icons: ["MapPin", "Map", "Home", "Building", "Plane", "Car", "Bus", "Bike", "Compass", "Globe"] },
  { name: "Eventos", icons: ["Calendar", "CalendarDays", "Clock", "Ticket", "Star", "PartyPopper", "Trophy", "Award"] },
  { name: "Educação", icons: ["Book", "BookOpen", "GraduationCap", "School", "Lightbulb", "Brain", "Library", "NotebookPen", "FileText"] },
  { name: "Esporte", icons: ["Dumbbell", "Medal", "Footprints", "Activity", "Target"] },
  { name: "Tech", icons: ["Laptop", "Smartphone", "Monitor", "Gamepad2", "Cpu", "Code", "Terminal", "Wifi", "Cloud", "Database", "Settings"] },
  { name: "Geral", icons: ["Heart", "ThumbsUp", "Eye", "Download", "Upload", "ExternalLink", "Link", "Share2", "Bookmark", "Flag", "Lock", "Unlock", "User", "Users", "Zap", "Sun", "Moon", "Flame"] },
];

const ALL_LUCIDE = LUCIDE_GROUPS.flatMap((g) => g.icons);

function isSocialKey(v?: string): v is SocialIconKey {
  return !!v && v in socialIconMap;
}
function isLucideKey(v?: string): boolean {
  return !!v && v.startsWith("l:") && v.slice(2) in LUCIDE_MAP;
}
function lucideKeyName(v: string) {
  return v.slice(2);
}

export function LinkIconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const initialTab: "emoji" | "social" | "lucide" = isSocialKey(value)
    ? "social"
    : isLucideKey(value)
      ? "lucide"
      : "emoji";
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "social" | "lucide">(initialTab);
  const [search, setSearch] = useState("");
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
  const LucideComp = isLucideKey(value!) ? LUCIDE_MAP[lucideKeyName(value!)] : null;
  const isEmoji = !!value && !isSocialKey(value) && !isLucideKey(value);

  const triggerLabel = SocialIcon
    ? SOCIAL_LABELS[value as SocialIconKey]
    : LucideComp
      ? lucideKeyName(value!)
      : isEmoji
        ? "Emoji selecionado"
        : "Adicionar ícone";

  function pick(v: string | undefined) {
    onChange(v);
    setOpen(false);
  }

  // Filtro de busca em lucide
  const filteredLucide = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return ALL_LUCIDE.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  return (
    <div ref={ref} className="relative">
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
          ) : LucideComp ? (
            <LucideComp className="size-4 text-foreground" />
          ) : isEmoji ? (
            <span className="leading-none">{value}</span>
          ) : (
            <Smile className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="flex-1 truncate text-left text-xs font-medium">
          {triggerLabel}
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

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-ios-lg">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/40 p-1">
            {[
              { id: "emoji", label: "Emoji", icon: Smile },
              { id: "lucide", label: "Ícones", icon: Shapes },
              { id: "social", label: "Redes", icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id as typeof tab)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
                  tab === id
                    ? "bg-card text-foreground shadow-ios-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto p-3">
            {tab === "emoji" && (
              <>
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
            )}

            {tab === "lucide" && (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar (ex.: shopping, video, calendar)"
                    className="w-full rounded-lg border border-input bg-background pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {filteredLucide ? (
                  filteredLucide.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      Nenhum ícone encontrado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-7 gap-1">
                      {filteredLucide.map((name) => {
                        const Icon = LUCIDE_MAP[name]!;
                        const key = `l:${name}`;
                        const active = value === key;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => pick(key)}
                            title={name}
                            className={cn(
                              "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-primary/10",
                              active && "bg-primary/15 ring-2 ring-primary"
                            )}
                          >
                            <Icon className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  LUCIDE_GROUPS.map((g) => (
                    <div key={g.name} className="mb-3 last:mb-0">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {g.name}
                      </p>
                      <div className="grid grid-cols-7 gap-1">
                        {g.icons.map((name) => {
                          const Icon = LUCIDE_MAP[name]!;
                          const key = `l:${name}`;
                          const active = value === key;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => pick(key)}
                              title={name}
                              className={cn(
                                "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-primary/10",
                                active && "bg-primary/15 ring-2 ring-primary"
                              )}
                            >
                              <Icon className="size-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {tab === "social" && (
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

/** Renderiza o ícone (emoji, ícone social ou lucide) no tamanho dado. */
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
  if (isLucideKey(icon)) {
    const Comp = LUCIDE_MAP[lucideKeyName(icon)]!;
    return <Comp className={cn("shrink-0", className)} style={{ width: size, height: size }} aria-hidden />;
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
