"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gradients, parseGradientToTheme } from "@/lib/photo-bank";
import type { ThemeBackground } from "@/lib/db/schema";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export function GradientPicker({
  open,
  onClose,
  onPick,
  selectedId,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (bg: Extract<ThemeBackground, { type: "gradient" }>) => void;
  selectedId?: string;
}) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-8">
        <div
          className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Galeria de gradientes</h2>
            <p className="text-sm text-muted-foreground">
              20 combinações escolhidas a dedo.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>

        <div className="grid grid-cols-3 gap-3 p-6 sm:grid-cols-4 lg:grid-cols-5">
          {gradients.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                const parsed = parseGradientToTheme(g.css);
                if (!parsed) return;
                onPick({ type: "gradient", ...parsed });
                onClose();
              }}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.03]",
                selectedId === g.id ? "border-foreground" : "border-transparent"
              )}
              style={{ background: g.css }}
            >
              <div className="absolute inset-x-0 bottom-0 bg-black/30 px-2 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {g.name}
              </div>
              {selectedId === g.id && (
                <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white text-black">
                  <Check className="size-3" />
                </div>
              )}
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
