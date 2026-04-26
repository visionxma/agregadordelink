import type { PageTheme } from "@/lib/db/schema";
import { themePresets } from "@/lib/themes";

const fallback = themePresets.find((p) => p.id === "minimal-white")!.theme;

export function normalizeTheme(raw: unknown): PageTheme {
  if (!raw || typeof raw !== "object") return fallback;
  const t = raw as Record<string, unknown>;

  const background =
    typeof t.background === "string"
      ? ({ type: "solid", color: t.background } as PageTheme["background"])
      : (t.background as PageTheme["background"] | undefined) ??
        fallback.background;

  return {
    preset: (t.preset as string | undefined) ?? undefined,
    background,
    foreground: (t.foreground as string | undefined) ?? fallback.foreground,
    mutedForeground:
      (t.mutedForeground as string | undefined) ?? fallback.mutedForeground,
    accent: (t.accent as string | undefined) ?? fallback.accent,
    accentForeground:
      (t.accentForeground as string | undefined) ?? fallback.accentForeground,
    font: (t.font as PageTheme["font"] | undefined) ?? fallback.font,
    titleFont:
      (t.titleFont as PageTheme["titleFont"] | undefined) ??
      (t.font as PageTheme["titleFont"] | undefined) ??
      fallback.titleFont,
    buttonStyle:
      (t.buttonStyle as PageTheme["buttonStyle"] | undefined) ??
      fallback.buttonStyle,
    avatarShape:
      (t.avatarShape as PageTheme["avatarShape"] | undefined) ??
      fallback.avatarShape,
    spacing:
      (t.spacing as PageTheme["spacing"] | undefined) ?? fallback.spacing,
    effect: (t.effect as PageTheme["effect"] | undefined) ?? fallback.effect,
    entryAnimation:
      (t.entryAnimation as PageTheme["entryAnimation"] | undefined) ?? "none",
    buttonHover:
      (t.buttonHover as PageTheme["buttonHover"] | undefined) ?? "none",
    buttonWidth:
      (t.buttonWidth as PageTheme["buttonWidth"] | undefined) ?? "full",
    customFontUrl: (t.customFontUrl as string | undefined) ?? undefined,
    customFontName: (t.customFontName as string | undefined) ?? undefined,
    darkModeAuto: Boolean(t.darkModeAuto),
    cursor: (t.cursor as PageTheme["cursor"] | undefined) ?? "default",
    clickSound:
      (t.clickSound as PageTheme["clickSound"] | undefined) ?? "none",
    hideBranding: Boolean(t.hideBranding),
    coverFade: Boolean(t.coverFade),
    avatarPlain: Boolean(t.avatarPlain),
    coverPlain: Boolean(t.coverPlain),
    headerLayout:
      (t.headerLayout as PageTheme["headerLayout"] | undefined) ?? "centered",
  };
}
