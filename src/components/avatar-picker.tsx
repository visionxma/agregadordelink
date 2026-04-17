"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  avatarStyles,
  avatarsForStyle,
  type AvatarItem,
} from "@/lib/photo-bank";

export function AvatarPicker({
  open,
  onClose,
  onPick,
  selectedUrl,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
  selectedUrl?: string;
}) {
  const [activeStyle, setActiveStyle] = useState(avatarStyles[0].id);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Escolha seu avatar</h2>
            <p className="text-sm text-muted-foreground">
              Avatares gerados em SVG — leve e sempre bonito.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b px-6 py-3">
          {avatarStyles.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStyle(s.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeStyle === s.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              <span>{s.emoji}</span>
              {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 overflow-y-auto p-6 sm:grid-cols-6 lg:grid-cols-8">
          {avatarsForStyle(activeStyle).map((a) => (
            <AvatarCard
              key={a.id}
              item={a}
              selected={selectedUrl === a.url}
              onClick={() => {
                onPick(a.url);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AvatarCard({
  item,
  selected,
  onClick,
}: {
  item: AvatarItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-full border-2 bg-muted transition-all hover:scale-[1.05]",
        selected ? "border-foreground" : "border-transparent"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.name}
        className="size-full"
        loading="lazy"
      />
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Check className="size-5 text-white" />
        </div>
      )}
    </button>
  );
}
