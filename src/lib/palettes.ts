// Paletas são só combinações de cores — diferente dos temas (que incluem
// fontes, botões, efeitos, etc). Aplicar uma paleta mantém a fonte/botão atuais
// e só troca as 5 cores principais.

export type ColorPalette = {
  id: string;
  name: string;
  vibe: string;
  background: string; // usado só como cor sólida
  foreground: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
};

export const colorPalettes: ColorPalette[] = [
  {
    id: "mono",
    name: "Mono",
    vibe: "preto & branco",
    background: "#ffffff",
    foreground: "#0a0a0a",
    mutedForeground: "#737373",
    accent: "#0a0a0a",
    accentForeground: "#ffffff",
  },
  {
    id: "ivory",
    name: "Ivory",
    vibe: "cremoso · editorial",
    background: "#f9f3e7",
    foreground: "#3d2818",
    mutedForeground: "#8c6a4e",
    accent: "#bf3e2b",
    accentForeground: "#f9f3e7",
  },
  {
    id: "navy",
    name: "Navy",
    vibe: "marinho · clássico",
    background: "#0f1e3c",
    foreground: "#ffffff",
    mutedForeground: "#9ab0d4",
    accent: "#f5c04f",
    accentForeground: "#0f1e3c",
  },
  {
    id: "forest",
    name: "Forest",
    vibe: "floresta · profundo",
    background: "#0f3d2e",
    foreground: "#ecf3ec",
    mutedForeground: "#9ec2a8",
    accent: "#d97757",
    accentForeground: "#ffffff",
  },
  {
    id: "desert",
    name: "Desert",
    vibe: "areia · terroso",
    background: "#e8d4b8",
    foreground: "#4a2818",
    mutedForeground: "#8c5f3f",
    accent: "#a83a1e",
    accentForeground: "#ffffff",
  },
  {
    id: "candy",
    name: "Candy",
    vibe: "pastel · doce",
    background: "#fce7f3",
    foreground: "#500724",
    mutedForeground: "#9f1239",
    accent: "#0891b2",
    accentForeground: "#ffffff",
  },
  {
    id: "night",
    name: "Night",
    vibe: "noturno · neon",
    background: "#0a0a0a",
    foreground: "#fafafa",
    mutedForeground: "#a3a3a3",
    accent: "#00e5ff",
    accentForeground: "#0a0a0a",
  },
  {
    id: "mint",
    name: "Mint",
    vibe: "menta · fresco",
    background: "#d1fae5",
    foreground: "#064e3b",
    mutedForeground: "#059669",
    accent: "#fb7185",
    accentForeground: "#ffffff",
  },
  {
    id: "sunset",
    name: "Sunset",
    vibe: "pôr-do-sol",
    background: "#fed7aa",
    foreground: "#3b0764",
    mutedForeground: "#7e22ce",
    accent: "#ea580c",
    accentForeground: "#ffffff",
  },
  {
    id: "wine",
    name: "Wine",
    vibe: "vinho · sofisticado",
    background: "#4a1128",
    foreground: "#fdf4e7",
    mutedForeground: "#e7c7ae",
    accent: "#f5c04f",
    accentForeground: "#4a1128",
  },
  {
    id: "steel",
    name: "Steel",
    vibe: "aço · industrial",
    background: "#1e293b",
    foreground: "#e2e8f0",
    mutedForeground: "#94a3b8",
    accent: "#84cc16",
    accentForeground: "#0a0a0a",
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    vibe: "rosa · divertido",
    background: "#ff3db2",
    foreground: "#ffffff",
    mutedForeground: "#ffd4ec",
    accent: "#fde047",
    accentForeground: "#701a75",
  },
  {
    id: "retro",
    name: "Retro",
    vibe: "mostarda · anos 70",
    background: "#eab308",
    foreground: "#1e3a8a",
    mutedForeground: "#3730a3",
    accent: "#f43f5e",
    accentForeground: "#ffffff",
  },
  {
    id: "ocean",
    name: "Ocean",
    vibe: "oceano · profundo",
    background: "#003355",
    foreground: "#e0f2fe",
    mutedForeground: "#7dd3fc",
    accent: "#22d3ee",
    accentForeground: "#003355",
  },
  {
    id: "lavender",
    name: "Lavender",
    vibe: "lavanda · calmo",
    background: "#ede9fe",
    foreground: "#4c1d95",
    mutedForeground: "#7c3aed",
    accent: "#e11d48",
    accentForeground: "#ffffff",
  },
  {
    id: "concrete",
    name: "Concrete",
    vibe: "cinza · urbano",
    background: "#737373",
    foreground: "#fafafa",
    mutedForeground: "#d4d4d4",
    accent: "#dc2626",
    accentForeground: "#ffffff",
  },
];

export function getPaletteById(id: string): ColorPalette | undefined {
  return colorPalettes.find((p) => p.id === id);
}
