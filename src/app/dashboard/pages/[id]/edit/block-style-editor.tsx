"use client";

import { useState, useTransition } from "react";
import { Palette, RotateCcw } from "lucide-react";
import type { BlockStyle, FontKey } from "@/lib/db/schema";
import { fontNiceName } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { updateBlockStyle } from "../../actions";

export function BlockStyleEditor({
  blockId,
  currentStyle,
}: {
  blockId: string;
  currentStyle: BlockStyle;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<BlockStyle>(currentStyle);
  const [, startTransition] = useTransition();

  function patch(p: Partial<BlockStyle>) {
    const next = { ...style, ...p };
    setStyle(next);
    startTransition(() => updateBlockStyle(blockId, next));
  }

  function reset() {
    setStyle({});
    startTransition(() => updateBlockStyle(blockId, {}));
  }

  const hasStyle = Object.keys(style).length > 0;

  return (
    <div className="rounded-lg border border-border bg-secondary/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <Palette className="size-3.5" />
          Estilo do bloco
          {hasStyle && (
            <span className="rounded-full bg-primary/15 px-1.5 text-[9px] text-primary">
              custom
            </span>
          )}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {open ? "fechar" : "abrir"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-3 text-xs">
          <Row label="Cor de fundo">
            <ColorPicker
              value={style.background ?? ""}
              onChange={(v) => patch({ background: v })}
              placeholder="auto"
            />
          </Row>

          <Row label="Cor do texto">
            <ColorPicker
              value={style.color ?? ""}
              onChange={(v) => patch({ color: v })}
              placeholder="auto"
            />
          </Row>

          <Row label="Tamanho da fonte">
            <Slider
              value={style.fontSize ?? 0}
              min={10}
              max={48}
              step={1}
              onChange={(v) => patch({ fontSize: v || undefined })}
              suffix="px"
            />
          </Row>

          <Row label="Peso da fonte">
            <Select
              value={style.fontWeight ?? 0}
              options={[
                { value: 0, label: "auto" },
                { value: 400, label: "400 normal" },
                { value: 500, label: "500" },
                { value: 600, label: "600 semibold" },
                { value: 700, label: "700 bold" },
                { value: 800, label: "800" },
                { value: 900, label: "900 black" },
              ]}
              onChange={(v) =>
                patch({
                  fontWeight:
                    v === 0 ? undefined : (v as BlockStyle["fontWeight"]),
                })
              }
            />
          </Row>

          <Row label="Família de fonte">
            <SelectString
              value={style.fontFamily ?? ""}
              options={[
                { value: "", label: "auto (da página)" },
                ...Object.keys(fontNiceName).map((k) => ({
                  value: k,
                  label: fontNiceName[k as FontKey],
                })),
              ]}
              onChange={(v) =>
                patch({
                  fontFamily: v ? (v as FontKey) : undefined,
                })
              }
            />
          </Row>

          <Row label="Arredondar borda">
            <Slider
              value={style.borderRadius ?? -1}
              min={0}
              max={48}
              step={1}
              onChange={(v) =>
                patch({ borderRadius: v === -1 ? undefined : v })
              }
              suffix="px"
              allowAuto
            />
          </Row>

          <Row label="Espessura da borda">
            <Slider
              value={style.borderWidth ?? 0}
              min={0}
              max={6}
              step={1}
              onChange={(v) => patch({ borderWidth: v || undefined })}
              suffix="px"
            />
          </Row>

          <Row label="Cor da borda">
            <ColorPicker
              value={style.borderColor ?? ""}
              onChange={(v) => patch({ borderColor: v })}
              placeholder="auto"
            />
          </Row>

          <Row label="Padding interno">
            <Slider
              value={style.padding ?? -1}
              min={8}
              max={32}
              step={1}
              onChange={(v) => patch({ padding: v === -1 ? undefined : v })}
              suffix="px"
              allowAuto
            />
          </Row>

          <Row label="Alinhamento">
            <SelectString
              value={style.textAlign ?? ""}
              options={[
                { value: "", label: "auto" },
                { value: "left", label: "Esquerda" },
                { value: "center", label: "Centro" },
                { value: "right", label: "Direita" },
              ]}
              onChange={(v) =>
                patch({
                  textAlign: v ? (v as BlockStyle["textAlign"]) : undefined,
                })
              }
            />
          </Row>

          {hasStyle && (
            <button
              type="button"
              onClick={reset}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3" /> Reset estilo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-center gap-2">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-input bg-transparent px-1.5 py-1">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-5 cursor-pointer rounded"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "#000000"}
        className="flex-1 bg-transparent text-[11px] outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-[10px] text-muted-foreground hover:text-destructive"
        >
          ×
        </button>
      )}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  allowAuto,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  allowAuto?: boolean;
}) {
  const isAuto = allowAuto && value === -1;
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={allowAuto ? -1 : min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span
        className={cn(
          "w-12 text-right font-mono text-[10px]",
          isAuto ? "text-muted-foreground" : ""
        )}
      >
        {isAuto ? "auto" : `${value}${suffix ?? ""}`}
      </span>
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SelectString({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
