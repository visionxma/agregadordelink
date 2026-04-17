// Fontes principais. Inter carrega em toda a app (inclui dashboard e landing).
// As 11 fontes customizáveis são carregadas sob demanda apenas em rotas que
// usam `ThemedPage` (público e editor) via `lib/fonts-public.ts`.

import { Inter } from "next/font/google";
import type { FontKey } from "@/lib/db/schema";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Apenas Inter no root — demais fontes só são carregadas em rotas públicas
export const allFontVariables = inter.variable;

export const fontClassMap: Record<FontKey, string> = {
  inter: "font-[var(--font-inter)]",
  poppins: "font-[var(--font-poppins)]",
  "space-grotesk": "font-[var(--font-space-grotesk)]",
  "dm-sans": "font-[var(--font-dm-sans)]",
  manrope: "font-[var(--font-manrope)]",
  mulish: "font-[var(--font-mulish)]",
  playfair: "font-[var(--font-playfair)]",
  bebas: "font-[var(--font-bebas)]",
  "jetbrains-mono": "font-[var(--font-jetbrains-mono)]",
  "instrument-serif": "font-[var(--font-instrument-serif)]",
  caveat: "font-[var(--font-caveat)]",
  "dancing-script": "font-[var(--font-dancing-script)]",
};

export const fontCssVarMap: Record<FontKey, string> = {
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  "space-grotesk": "var(--font-space-grotesk)",
  "dm-sans": "var(--font-dm-sans)",
  manrope: "var(--font-manrope)",
  mulish: "var(--font-mulish)",
  playfair: "var(--font-playfair)",
  bebas: "var(--font-bebas)",
  "jetbrains-mono": "var(--font-jetbrains-mono)",
  "instrument-serif": "var(--font-instrument-serif)",
  caveat: "var(--font-caveat)",
  "dancing-script": "var(--font-dancing-script)",
};

export const fontNiceName: Record<FontKey, string> = {
  inter: "Inter",
  poppins: "Poppins",
  "space-grotesk": "Space Grotesk",
  "dm-sans": "DM Sans",
  manrope: "Manrope",
  mulish: "Mulish",
  playfair: "Playfair Display",
  bebas: "Bebas Neue",
  "jetbrains-mono": "JetBrains Mono",
  "instrument-serif": "Instrument Serif",
  caveat: "Caveat (cursiva)",
  "dancing-script": "Dancing Script (cursiva)",
};
