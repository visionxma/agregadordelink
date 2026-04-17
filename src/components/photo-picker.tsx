"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  photoCategories,
  type PhotoItem,
} from "@/lib/photo-bank";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export function PhotoPicker({
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
  const [activeCategory, setActiveCategory] = useState(photoCategories[0].id);

  useBodyScrollLock(open);

  if (!open) return null;

  const current =
    photoCategories.find((c) => c.id === activeCategory) ?? photoCategories[0];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-8">
        <div
          className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Banco de fotos</h2>
            <p className="text-sm text-muted-foreground">
              Selecione uma foto. Fotos aleatórias de alta qualidade.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b px-6 py-3">
          {photoCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 lg:grid-cols-5">
          {current.items.map((item) => (
            <PhotoCard
              key={item.id}
              item={item}
              selected={selectedUrl === item.url}
              onClick={() => {
                onPick(item.url);
                onClose();
              }}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

function PhotoCard({
  item,
  selected,
  onClick,
}: {
  item: PhotoItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02]",
        selected ? "border-foreground" : "border-transparent"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumb}
        alt={item.name}
        className="size-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      {selected && (
        <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="size-3.5" />
        </div>
      )}
    </button>
  );
}
