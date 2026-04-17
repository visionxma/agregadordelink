"use client";

import { useState, useTransition } from "react";
import { ImageIcon, Palette as PaletteIcon, Sparkles } from "lucide-react";
import type {
  AvatarShape,
  ButtonHover,
  ButtonStyle,
  ClickSound,
  CursorStyle,
  Effect,
  EntryAnimation,
  FontKey,
  PageTheme,
  Spacing,
  ThemeBackground,
} from "@/lib/db/schema";
import { ImageUploadButton } from "@/components/image-upload-button";
import { fontNiceName } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhotoPicker } from "@/components/photo-picker";
import { GradientPicker } from "@/components/gradient-picker";
import { updateTheme } from "../../actions";

export function CustomizerPanel({
  pageId,
  theme,
}: {
  pageId: string;
  theme: PageTheme;
}) {
  const [local, setLocal] = useState<PageTheme>(theme);
  const [pending, startTransition] = useTransition();

  function update(patch: Partial<PageTheme>) {
    const next = { ...local, ...patch, preset: undefined };
    setLocal(next);
    startTransition(() => updateTheme(pageId, next));
  }

  function updateBackground(bg: ThemeBackground) {
    update({ background: bg });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-5 shadow-ios-sm">
      <Section title="Fundo">
        <BackgroundControl
          background={local.background}
          onChange={updateBackground}
        />
      </Section>

      <Section title="Cores">
        <div className="grid grid-cols-2 gap-3">
          <ColorInput
            label="Texto"
            value={local.foreground}
            onChange={(v) => update({ foreground: v })}
          />
          <ColorInput
            label="Texto claro"
            value={local.mutedForeground}
            onChange={(v) => update({ mutedForeground: v })}
          />
          <ColorInput
            label="Accent"
            value={local.accent}
            onChange={(v) => update({ accent: v })}
          />
          <ColorInput
            label="Texto do botão"
            value={local.accentForeground}
            onChange={(v) => update({ accentForeground: v })}
          />
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="space-y-3">
          <SelectControl<FontKey>
            label="Fonte do corpo"
            value={local.font}
            onChange={(v) => update({ font: v })}
            options={FONT_OPTIONS}
          />
          <SelectControl<FontKey>
            label="Fonte do título"
            value={local.titleFont ?? local.font}
            onChange={(v) => update({ titleFont: v })}
            options={FONT_OPTIONS}
          />
        </div>
      </Section>

      <Section title="Botões">
        <ButtonStyleGrid
          value={local.buttonStyle}
          onChange={(v) => update({ buttonStyle: v })}
          accent={local.accent}
          accentForeground={local.accentForeground}
          foreground={local.foreground}
        />
      </Section>

      <Section title="Avatar">
        <OptionGrid<AvatarShape>
          value={local.avatarShape}
          onChange={(v) => update({ avatarShape: v })}
          options={AVATAR_OPTIONS}
        />
      </Section>

      <Section title="Espaçamento">
        <OptionGrid<Spacing>
          value={local.spacing}
          onChange={(v) => update({ spacing: v })}
          options={SPACING_OPTIONS}
        />
      </Section>

      <Section title="Efeito">
        <OptionGrid<Effect>
          value={local.effect}
          onChange={(v) => update({ effect: v })}
          options={EFFECT_OPTIONS}
        />
      </Section>

      <Section title="Animação de entrada">
        <OptionGrid<EntryAnimation>
          value={local.entryAnimation ?? "none"}
          onChange={(v) => update({ entryAnimation: v })}
          options={ENTRY_ANIMATION_OPTIONS}
        />
      </Section>

      <Section title="Hover dos botões">
        <OptionGrid<ButtonHover>
          value={local.buttonHover ?? "none"}
          onChange={(v) => update({ buttonHover: v })}
          options={BUTTON_HOVER_OPTIONS}
        />
      </Section>

      <Section title="Cursor">
        <OptionGrid<CursorStyle>
          value={local.cursor ?? "default"}
          onChange={(v) => update({ cursor: v })}
          options={CURSOR_OPTIONS}
        />
      </Section>

      <Section title="Som ao clicar">
        <OptionGrid<ClickSound>
          value={local.clickSound ?? "none"}
          onChange={(v) => update({ clickSound: v })}
          options={CLICK_SOUND_OPTIONS}
        />
      </Section>

      <Section title="Modo claro/escuro">
        <label className="flex items-center gap-2 rounded-xl border border-border p-3">
          <input
            type="checkbox"
            checked={local.darkModeAuto ?? false}
            onChange={(e) => update({ darkModeAuto: e.target.checked })}
            className="size-4"
          />
          <span className="text-sm">
            Seguir modo do dispositivo do visitante
          </span>
        </label>
      </Section>

      <Section title="Fonte customizada">
        <div className="space-y-2">
          {local.customFontUrl ? (
            <div className="rounded-xl border border-border p-3">
              <p className="truncate text-xs font-mono">
                {local.customFontName ?? "Fonte personalizada"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {local.customFontUrl}
              </p>
              <button
                type="button"
                onClick={() =>
                  update({
                    customFontUrl: undefined,
                    customFontName: undefined,
                  })
                }
                className="mt-2 text-xs text-destructive"
              >
                Remover
              </button>
            </div>
          ) : (
            <ImageUploadButton
              onUploaded={(url) => {
                const name = url.split("/").pop()?.split(".")[0] ?? "Custom";
                update({
                  customFontUrl: url,
                  customFontName: name,
                });
              }}
              label="Upload .ttf / .woff"
              className="w-full"
            />
          )}
          <p className="text-[10px] text-muted-foreground">
            Aceita .ttf, .otf, .woff, .woff2 (máx 2MB). Sobrescreve a fonte
            selecionada acima.
          </p>
        </div>
      </Section>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        {pending ? "Salvando..." : "Alterações auto-salvas"}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 cursor-pointer appearance-none rounded border-0 bg-transparent p-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-xs outline-none"
        />
      </div>
    </div>
  );
}

function BackgroundControl({
  background,
  onChange,
}: {
  background: ThemeBackground;
  onChange: (bg: ThemeBackground) => void;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [gradientOpen, setGradientOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
        <TabButton
          active={background.type === "solid"}
          onClick={() =>
            onChange({
              type: "solid",
              color:
                background.type === "solid" ? background.color : "#ffffff",
            })
          }
        >
          Sólido
        </TabButton>
        <TabButton
          active={background.type === "gradient"}
          onClick={() =>
            onChange(
              background.type === "gradient"
                ? background
                : {
                    type: "gradient",
                    from: "#8b5cf6",
                    to: "#ec4899",
                    direction: "to-br",
                  }
            )
          }
        >
          Gradient
        </TabButton>
        <TabButton
          active={background.type === "image"}
          onClick={() =>
            onChange(
              background.type === "image"
                ? background
                : { type: "image", url: "" }
            )
          }
        >
          Foto
        </TabButton>
      </div>

      {background.type === "solid" && (
        <ColorInput
          label="Cor de fundo"
          value={background.color}
          onChange={(color) => onChange({ type: "solid", color })}
        />
      )}

      {background.type === "gradient" && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setGradientOpen(true)}
          >
            <Sparkles className="size-4" />
            Galeria de gradientes
          </Button>
          <div className="rounded-lg border border-dashed p-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            ou crie o seu
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ColorInput
              label="De"
              value={background.from}
              onChange={(from) => onChange({ ...background, from })}
            />
            <ColorInput
              label="Meio"
              value={background.via ?? background.from}
              onChange={(via) => onChange({ ...background, via })}
            />
            <ColorInput
              label="Até"
              value={background.to}
              onChange={(to) => onChange({ ...background, to })}
            />
          </div>
          <SelectControl<GradientDirection>
            label="Direção"
            value={background.direction}
            onChange={(direction) => onChange({ ...background, direction })}
            options={DIRECTION_OPTIONS}
          />
          <GradientPicker
            open={gradientOpen}
            onClose={() => setGradientOpen(false)}
            onPick={(bg) => onChange(bg)}
          />
        </div>
      )}

      {background.type === "image" && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setPhotoOpen(true)}
          >
            <ImageIcon className="size-4" />
            Banco de fotos
          </Button>
          {background.url && (
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={background.url}
                alt=""
                className="h-24 w-full object-cover"
              />
            </div>
          )}
          <div className="rounded-lg border border-dashed p-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            ou cole uma URL
          </div>
          <Input
            type="url"
            placeholder="https://..."
            defaultValue={background.url}
            onBlur={(e) =>
              onChange({
                type: "image",
                url: e.target.value,
                overlay: background.overlay,
              })
            }
          />
          <PhotoPicker
            open={photoOpen}
            onClose={() => setPhotoOpen(false)}
            onPick={(url) =>
              onChange({ type: "image", url, overlay: background.overlay })
            }
            selectedUrl={background.url}
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-card text-foreground shadow-ios-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SelectControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

function OptionGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all",
            value === o.value
              ? "border-primary bg-primary text-primary-foreground shadow-ios-sm"
              : "border-border bg-card/60 text-foreground hover:border-primary/50"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const FONT_OPTIONS: { value: FontKey; label: string }[] = (
  Object.keys(fontNiceName) as FontKey[]
).map((k) => ({ value: k, label: fontNiceName[k] }));

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "sharp", label: "Sharp" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Shadow" },
  { value: "glass", label: "Glass" },
  { value: "neubrutalism", label: "Brutal" },
  { value: "underline", label: "Underline" },
];

function ButtonStyleGrid({
  value,
  onChange,
  accent,
  accentForeground,
  foreground,
}: {
  value: ButtonStyle;
  onChange: (v: ButtonStyle) => void;
  accent: string;
  accentForeground: string;
  foreground: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {BUTTON_STYLES.map((b) => (
        <button
          key={b.value}
          type="button"
          onClick={() => onChange(b.value)}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-xl border bg-card/50 px-2 py-3 transition-all",
            value === b.value
              ? "border-primary shadow-ios-sm ring-2 ring-primary/20"
              : "border-border hover:border-primary/40"
          )}
        >
          <ButtonPreview
            style={b.value}
            accent={accent}
            accentForeground={accentForeground}
            foreground={foreground}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {b.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function ButtonPreview({
  style,
  accent,
  accentForeground,
  foreground,
}: {
  style: ButtonStyle;
  accent: string;
  accentForeground: string;
  foreground: string;
}) {
  const base: React.CSSProperties = {
    display: "inline-block",
    width: "100%",
    padding: "6px 0",
    textAlign: "center",
    fontSize: "10px",
    fontWeight: 700,
  };
  let s: React.CSSProperties = {};
  switch (style) {
    case "rounded":
      s = {
        ...base,
        background: accent,
        color: accentForeground,
        borderRadius: "8px",
      };
      break;
    case "pill":
      s = {
        ...base,
        background: accent,
        color: accentForeground,
        borderRadius: "9999px",
      };
      break;
    case "sharp":
      s = {
        ...base,
        background: accent,
        color: accentForeground,
        borderRadius: 0,
      };
      break;
    case "outline":
      s = {
        ...base,
        background: "transparent",
        color: foreground,
        border: `2px solid ${accent}`,
        borderRadius: "6px",
        padding: "4px 0",
      };
      break;
    case "shadow":
      s = {
        ...base,
        background: accent,
        color: accentForeground,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      };
      break;
    case "glass":
      s = {
        ...base,
        background: "rgba(255,255,255,0.3)",
        color: foreground,
        border: "1px solid rgba(255,255,255,0.5)",
        borderRadius: "8px",
        backdropFilter: "blur(8px)",
      };
      break;
    case "neubrutalism":
      s = {
        ...base,
        background: accent,
        color: accentForeground,
        border: `2px solid ${foreground}`,
        borderRadius: 0,
        boxShadow: `3px 3px 0 ${foreground}`,
        padding: "4px 0",
      };
      break;
    case "underline":
      s = {
        ...base,
        background: "transparent",
        color: foreground,
        borderBottom: `2px solid ${foreground}`,
        borderRadius: 0,
        padding: "4px 0",
      };
      break;
  }
  return <span style={s}>Botão</span>;
}

const AVATAR_OPTIONS: { value: AvatarShape; label: string }[] = [
  { value: "circle", label: "Círculo" },
  { value: "rounded", label: "Arredondado" },
  { value: "square", label: "Quadrado" },
  { value: "hexagon", label: "Hexágono" },
];

const SPACING_OPTIONS: { value: Spacing; label: string }[] = [
  { value: "tight", label: "Apertado" },
  { value: "normal", label: "Normal" },
  { value: "loose", label: "Largo" },
];

const EFFECT_OPTIONS: { value: Effect; label: string }[] = [
  { value: "none", label: "Nenhum" },
  { value: "grid", label: "Grid" },
  { value: "stars", label: "Estrelas" },
  { value: "noise", label: "Noise" },
  { value: "gradient-mesh", label: "Mesh" },
];

const ENTRY_ANIMATION_OPTIONS: {
  value: EntryAnimation;
  label: string;
}[] = [
  { value: "none", label: "Nenhuma" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide up" },
  { value: "scale", label: "Scale" },
  { value: "stagger", label: "Cascata ⭐" },
];

const BUTTON_HOVER_OPTIONS: { value: ButtonHover; label: string }[] = [
  { value: "none", label: "Nenhum" },
  { value: "lift", label: "Lift" },
  { value: "tilt", label: "3D Tilt" },
  { value: "glare", label: "Glare" },
];

const CURSOR_OPTIONS: { value: CursorStyle; label: string }[] = [
  { value: "default", label: "Padrão" },
  { value: "pointer", label: "Pointer" },
  { value: "sparkle", label: "✨ Sparkle" },
  { value: "heart", label: "❤️ Heart" },
  { value: "fire", label: "🔥 Fire" },
  { value: "star", label: "⭐ Star" },
];

const CLICK_SOUND_OPTIONS: { value: ClickSound; label: string }[] = [
  { value: "none", label: "Sem som" },
  { value: "pop", label: "Pop" },
  { value: "click", label: "Click" },
  { value: "ding", label: "Ding" },
  { value: "tap", label: "Tap" },
];

type GradientDirection = "to-br" | "to-bl" | "to-tr" | "to-tl" | "to-r" | "to-b";

const DIRECTION_OPTIONS: { value: GradientDirection; label: string }[] = [
  { value: "to-br", label: "↘ Diagonal" },
  { value: "to-bl", label: "↙ Diagonal" },
  { value: "to-tr", label: "↗ Diagonal" },
  { value: "to-tl", label: "↖ Diagonal" },
  { value: "to-r", label: "→ Horizontal" },
  { value: "to-b", label: "↓ Vertical" },
];
