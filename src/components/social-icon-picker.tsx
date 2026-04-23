"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  socialIconMap,
  type SocialIconKey,
} from "@/components/social-icons";
import { cn } from "@/lib/utils";

const LABELS: Record<SocialIconKey, string> = {
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

const ORDER: SocialIconKey[] = [
  "whatsapp",
  "instagram",
  "twitter",
  "youtube",
  "facebook",
  "github",
  "tiktok",
  "linkedin",
  "twitch",
  "discord",
  "telegram",
  "threads",
  "spotify",
  "apple-music",
  "soundcloud",
  "pinterest",
  "patreon",
  "email",
  "website",
];

export function SocialIconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const isValid = value && value in socialIconMap;
  const Icon = isValid ? socialIconMap[value as SocialIconKey] : null;
  const label = isValid ? LABELS[value as SocialIconKey] : "escolher ícone";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border border-input bg-card px-2 py-1.5 text-xs transition-colors hover:bg-muted"
      >
        {Icon ? (
          <Icon className="size-4 text-foreground" />
        ) : (
          <span className="size-4 rounded border border-dashed border-muted-foreground" />
        )}
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="mt-1 grid grid-cols-6 gap-1 rounded-md border border-input bg-card p-1.5">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground transition-colors hover:bg-muted",
              !value && "border-primary bg-primary/10 text-primary"
            )}
            title="Sem ícone"
          >
            —
          </button>
          {ORDER.map((key) => {
            const I = socialIconMap[key];
            const active = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                title={LABELS[key]}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                <I className="size-4" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
