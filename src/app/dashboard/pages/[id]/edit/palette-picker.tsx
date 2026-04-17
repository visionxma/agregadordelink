"use client";

import { useTransition } from "react";
import { colorPalettes, type ColorPalette } from "@/lib/palettes";
import { cn } from "@/lib/utils";
import { applyColorPalette } from "../../actions";

export function PalettePicker({ pageId }: { pageId: string }) {
  const [pending, startTransition] = useTransition();

  function apply(id: string) {
    startTransition(() => applyColorPalette(pageId, id));
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Paletas de cor
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {colorPalettes.map((p) => (
          <PaletteSwatch
            key={p.id}
            palette={p}
            onClick={() => apply(p.id)}
            disabled={pending}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Aplica as 5 cores principais. Fonte, botão e efeitos mantidos.
      </p>
    </div>
  );
}

function PaletteSwatch({
  palette,
  onClick,
  disabled,
}: {
  palette: ColorPalette;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group shrink-0 overflow-hidden rounded-xl border border-border transition-all hover:scale-105 hover:border-foreground disabled:opacity-50"
      )}
      style={{ background: palette.background }}
      title={`${palette.name} — ${palette.vibe}`}
    >
      <div className="flex flex-col items-center gap-1 px-2 py-2">
        <div className="flex gap-0.5">
          <span
            className="size-3 rounded-full ring-1 ring-black/10"
            style={{ background: palette.accent }}
          />
          <span
            className="size-3 rounded-full ring-1 ring-black/10"
            style={{ background: palette.foreground }}
          />
          <span
            className="size-3 rounded-full ring-1 ring-black/10"
            style={{ background: palette.mutedForeground }}
          />
        </div>
        <span
          className="mt-0.5 whitespace-nowrap text-[9px] font-bold"
          style={{ color: palette.foreground }}
        >
          {palette.name}
        </span>
      </div>
    </button>
  );
}
