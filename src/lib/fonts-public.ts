// Fontes usadas APENAS na página pública do usuário e no preview.
// Separado de fonts.ts (que só tem Inter, usada em toda a app) pra não
// carregar as 11 fontes pesadas no dashboard/landing.

import {
  Bebas_Neue,
  Caveat,
  Dancing_Script,
  DM_Sans,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Mulish,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import type { FontKey } from "@/lib/db/schema";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const publicFontVariables = [
  poppins.variable,
  spaceGrotesk.variable,
  dmSans.variable,
  manrope.variable,
  mulish.variable,
  playfair.variable,
  bebas.variable,
  jetbrainsMono.variable,
  instrumentSerif.variable,
  caveat.variable,
  dancingScript.variable,
].join(" ");

// Re-exporta maps pra compatibilidade com código existente
export type { FontKey };
