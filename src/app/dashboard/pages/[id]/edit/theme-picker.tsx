"use client";

import { useState, useTransition } from "react";
import { Check, Palette, X } from "lucide-react";
import { themePresets } from "@/lib/themes";
import { ThemeThumbnail } from "@/components/theme-thumbnail";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";
import { cn } from "@/lib/utils";
import type { PageTheme } from "@/lib/db/schema";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { applyThemePreset } from "../../actions";

export function ThemePicker({
  pageId,
  currentPreset,
}: {
  pageId: string;
  currentPreset?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(currentPreset);

  useBodyScrollLock(open);

  function handleApply(id: string) {
    setSelectedId(id);
    startTransition(async () => {
      await applyThemePreset(pageId, id);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <Palette className="size-4" />
        Trocar tema
      </Button>

      {open && (
        <ModalPortal>
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center py-8">
            <div
              className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
            <header className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold">Galeria de temas</h2>
                <p className="text-sm text-muted-foreground">
                  Clica num tema pra aplicar na hora.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </header>

            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
              {themePresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={pending}
                  onClick={() => handleApply(p.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 text-left transition-all hover:scale-[1.02]",
                    selectedId === p.id
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <ThemeThumbnail theme={p.theme} label={p.name} />
                  <div className="bg-background px-3 py-2">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.vibe}
                    </p>
                  </div>
                  {selectedId === p.id && (
                    <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
}

export function SimpleColorRow({ theme }: { theme: PageTheme }) {
  const colors = [
    theme.background.type === "solid"
      ? theme.background.color
      : theme.background.type === "gradient"
        ? theme.background.from
        : "#888",
    theme.foreground,
    theme.accent,
  ];
  return (
    <div className="flex gap-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="size-4 rounded border border-foreground/10"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
