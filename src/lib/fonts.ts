import {
  Bebas_Neue,
  Caveat,
  Dancing_Script,
  DM_Sans,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Mulish,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import type { FontKey } from "@/lib/db/schema";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const allFontVariables = [
  inter.variable,
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
