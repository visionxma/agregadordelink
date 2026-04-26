"use client";

import { useState, useTransition } from "react";
import {
  Palette,
  RotateCcw,
  Type as TypeIcon,
  Square,
  Image as ImageIcon,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import type { BlockStyle, FontKey } from "@/lib/db/schema";
import { fontNiceName } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { updateBlockStyle } from "../../actions";

type Tab = "background" | "text" | "border";

export function BlockStyleEditor({
  blockId,
  currentStyle,
}: {
  blockId: string;
  currentStyle: BlockStyle;
}) {
  const [tab, setTab] = useState<Tab>("background");
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
    <div className="rounded-xl border border-border bg-card shadow-ios-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold">
          <Palette className="size-3.5 text-primary" />
          Estilo do bloco
          {hasStyle && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              CUSTOM
            </span>
          )}
        </span>
        {hasStyle && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Resetar todos os estilos"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <TabButton active={tab === "background"} onClick={() => setTab("background")} icon={<Sparkles className="size-3.5" />} label="Fundo" />
        <TabButton active={tab === "text"} onClick={() => setTab("text")} icon={<TypeIcon className="size-3.5" />} label="Texto" />
        <TabButton active={tab === "border"} onClick={() => setTab("border")} icon={<Square className="size-3.5" />} label="Borda" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {tab === "background" && <BackgroundTab style={style} patch={patch} />}
        {tab === "text" && <TextTab style={style} patch={patch} />}
        {tab === "border" && <BorderTab style={style} patch={patch} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors border-b-2",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── BACKGROUND TAB ──────────────────────────────────────────────────────────

function BackgroundTab({ style, patch }: { style: BlockStyle; patch: (p: Partial<BlockStyle>) => void }) {
  const hasGradient = !!(style.gradientFrom || style.gradientTo);
  const hasImage = !!style.bgImage;

  return (
    <>
      {/* Cor sólida */}
      <Section title="Cor sólida">
        <ColorPicker
          value={style.background ?? ""}
          onChange={(v) => patch({ background: v })}
          placeholder="Sem cor"
        />
      </Section>

      {/* Gradiente */}
      <Section
        title="Gradiente"
        action={
          hasGradient ? (
            <ClearButton onClick={() => patch({ gradientFrom: undefined, gradientTo: undefined, gradientAngle: undefined })} />
          ) : null
        }
        hint="Substitui a cor sólida quando definido"
      >
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Inicial" value={style.gradientFrom ?? ""} onChange={(v) => patch({ gradientFrom: v })} />
          <ColorField label="Final" value={style.gradientTo ?? ""} onChange={(v) => patch({ gradientTo: v })} />
        </div>
        {hasGradient && (
          <>
            <SliderField
              label="Direção"
              value={style.gradientAngle ?? 90}
              min={0}
              max={360}
              step={15}
              suffix="°"
              onChange={(v) => patch({ gradientAngle: v })}
            />
            <GradientPreview from={style.gradientFrom!} to={style.gradientTo!} angle={style.gradientAngle ?? 90} />
          </>
        )}
      </Section>

      {/* Imagem */}
      <Section
        title="Imagem de fundo"
        action={hasImage ? <ClearButton onClick={() => patch({ bgImage: undefined, bgImagePosition: undefined })} /> : null}
        hint="Sobrepõe gradiente e cor"
      >
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card/60 px-2 py-1.5">
          <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="url"
            value={style.bgImage ?? ""}
            onChange={(e) => patch({ bgImage: e.target.value || undefined })}
            placeholder="https://..."
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        {hasImage && (
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { v: "right", l: "Canto direito" },
              { v: "left", l: "Canto esquerdo" },
              { v: "cover", l: "Cobrir tudo" },
              { v: "center", l: "Centro" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => patch({ bgImagePosition: opt.v })}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors",
                  (style.bgImagePosition ?? "right") === opt.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ─── TEXT TAB ────────────────────────────────────────────────────────────────

function TextTab({ style, patch }: { style: BlockStyle; patch: (p: Partial<BlockStyle>) => void }) {
  return (
    <>
      <Section title="Cor do texto">
        <ColorPicker
          value={style.color ?? ""}
          onChange={(v) => patch({ color: v })}
          placeholder="Cor do tema"
        />
      </Section>

      <Section title="Tipografia">
        <SliderField
          label="Tamanho"
          value={style.fontSize ?? 14}
          min={10}
          max={48}
          step={1}
          suffix="px"
          onChange={(v) => patch({ fontSize: v })}
        />
        <SelectRow
          label="Peso"
          value={style.fontWeight ?? 0}
          options={[
            { value: 0, label: "Auto" },
            { value: 400, label: "Normal" },
            { value: 500, label: "Médio" },
            { value: 600, label: "Semibold" },
            { value: 700, label: "Bold" },
            { value: 800, label: "Extra" },
            { value: 900, label: "Black" },
          ]}
          onChange={(v) =>
            patch({ fontWeight: v === 0 ? undefined : (v as BlockStyle["fontWeight"]) })
          }
        />
        <SelectRowString
          label="Família"
          value={style.fontFamily ?? ""}
          options={[
            { value: "", label: "Da página" },
            ...Object.keys(fontNiceName).map((k) => ({ value: k, label: fontNiceName[k as FontKey] })),
          ]}
          onChange={(v) => patch({ fontFamily: v ? (v as FontKey) : undefined })}
        />
      </Section>

      <Section title="Alinhamento">
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { v: "left", icon: <AlignLeft className="size-3.5" /> },
            { v: "center", icon: <AlignCenter className="size-3.5" /> },
            { v: "right", icon: <AlignRight className="size-3.5" /> },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => patch({ textAlign: style.textAlign === opt.v ? undefined : opt.v })}
              className={cn(
                "flex items-center justify-center rounded-md border px-2 py-2 transition-colors",
                style.textAlign === opt.v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── BORDER TAB ──────────────────────────────────────────────────────────────

function BorderTab({ style, patch }: { style: BlockStyle; patch: (p: Partial<BlockStyle>) => void }) {
  return (
    <>
      <Section title="Cantos arredondados">
        <SliderField
          label="Raio"
          value={style.borderRadius ?? -1}
          min={-1}
          max={48}
          step={1}
          suffix={style.borderRadius === -1 || style.borderRadius === undefined ? "" : "px"}
          allowAuto
          onChange={(v) => patch({ borderRadius: v === -1 ? undefined : v })}
        />
      </Section>

      <Section title="Borda">
        <SliderField
          label="Espessura"
          value={style.borderWidth ?? 0}
          min={0}
          max={6}
          step={1}
          suffix="px"
          onChange={(v) => patch({ borderWidth: v || undefined })}
        />
        {(style.borderWidth ?? 0) > 0 && (
          <ColorField label="Cor da borda" value={style.borderColor ?? ""} onChange={(v) => patch({ borderColor: v })} />
        )}
      </Section>

      <Section title="Espaçamento interno">
        <SliderField
          label="Padding"
          value={style.padding ?? -1}
          min={-1}
          max={32}
          step={1}
          suffix={style.padding === -1 || style.padding === undefined ? "" : "px"}
          allowAuto
          onChange={(v) => patch({ padding: v === -1 ? undefined : v })}
        />
      </Section>
    </>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary/40 p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        {action}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
      {children}
    </div>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-semibold text-destructive/80 hover:text-destructive"
    >
      Limpar
    </button>
  );
}

function GradientPreview({ from, to, angle }: { from: string; to: string; angle: number }) {
  return (
    <div
      className="h-6 rounded-md border border-border"
      style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
    />
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
    <div className="flex items-center gap-2 rounded-lg border border-input bg-card/60 px-2 py-1.5">
      <div
        className="size-6 shrink-0 rounded-md border border-border overflow-hidden cursor-pointer relative"
        style={{ background: value || "linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), linear-gradient(45deg, #f0f0f0 25%, #fff 25%, #fff 75%, #f0f0f0 75%)" , backgroundSize: value ? undefined : "8px 8px", backgroundPosition: value ? undefined : "0 0, 4px 4px"}}
      >
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "#000000"}
        className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/60"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-base text-muted-foreground hover:text-destructive leading-none"
          title="Limpar"
        >
          ×
        </button>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      <ColorPicker value={value} onChange={onChange} placeholder="—" />
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  allowAuto,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  allowAuto?: boolean;
  onChange: (v: number) => void;
}) {
  const isAuto = allowAuto && value === -1;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-muted-foreground">{label}</label>
        <span className={cn("font-mono text-[10px]", isAuto ? "text-muted-foreground" : "font-semibold")}>
          {isAuto ? "auto" : `${value}${suffix ?? ""}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[60px_1fr] items-center gap-2">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 rounded-md border border-input bg-card/60 px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectRowString({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[60px_1fr] items-center gap-2">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-card/60 px-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
