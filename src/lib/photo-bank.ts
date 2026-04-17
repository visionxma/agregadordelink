// Banco de mídia — 100% CDNs públicas, sem API key.
// - Fotos: picsum.photos (seed-based, sempre determinístico)
// - Avatares: api.dicebear.com (geração procedural SVG)
// - Gradientes: CSS inline

export type PhotoItem = {
  id: string;
  name: string;
  url: string;
  thumb: string;
};

export type PhotoCategory = {
  id: string;
  name: string;
  emoji: string;
  items: PhotoItem[];
};

export type GradientItem = {
  id: string;
  name: string;
  css: string;
};

export type AvatarItem = {
  id: string;
  name: string;
  url: string;
};

// ============== FOTOS (Picsum) ==============

function picsum(seed: string, w = 1200, h = 800): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
function picsumThumb(seed: string): string {
  return picsum(seed, 320, 200);
}

export const photoCategories: PhotoCategory[] = [
  {
    id: "nature",
    name: "Natureza",
    emoji: "🌲",
    items: [
      "forest-1", "mountain-a", "lake-2", "ocean-x", "beach-7", "sunset-k", "waterfall-b", "trees-rain", "meadow-3", "canyon-9",
    ].map((seed, i) => ({
      id: seed,
      name: `Natureza ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "urban",
    name: "Cidade",
    emoji: "🏙",
    items: [
      "nyc-1", "tokyo-night", "paris-2", "london-rain", "neon-city", "bridge-a", "street-7", "skyline-3", "metro-b", "downtown-9",
    ].map((seed, i) => ({
      id: seed,
      name: `Cidade ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "abstract",
    name: "Abstrato",
    emoji: "🎨",
    items: [
      "abs-pink", "abs-blue", "abs-purple", "abs-neon", "abs-smoke", "abs-paint", "abs-glass", "abs-metallic", "abs-watercolor", "abs-foil",
    ].map((seed, i) => ({
      id: seed,
      name: `Abstrato ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "texture",
    name: "Textura",
    emoji: "🧵",
    items: [
      "tx-paper", "tx-marble", "tx-concrete", "tx-wood", "tx-fabric", "tx-leather", "tx-metal", "tx-stone", "tx-sand", "tx-velvet",
    ].map((seed, i) => ({
      id: seed,
      name: `Textura ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "food",
    name: "Comida",
    emoji: "☕",
    items: [
      "coffee-a", "cafe-2", "brunch-3", "pasta-7", "donut-k", "cocktail-b", "salad-4", "pizza-9", "breakfast-x", "bistro-1",
    ].map((seed, i) => ({
      id: seed,
      name: `Comida ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "fitness",
    name: "Fitness",
    emoji: "💪",
    items: [
      "gym-1", "run-a", "yoga-x", "weights-3", "box-7", "crossfit-2", "bike-k", "swim-9", "stretch-b", "trail-4",
    ].map((seed, i) => ({
      id: seed,
      name: `Fitness ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
  {
    id: "night",
    name: "Noite",
    emoji: "🌙",
    items: [
      "night-1", "moon-a", "stars-x", "aurora-2", "cosmos-7", "nebula-k", "galaxy-3", "dark-sky-b", "lights-9", "midnight-4",
    ].map((seed, i) => ({
      id: seed,
      name: `Noite ${i + 1}`,
      url: picsum(seed),
      thumb: picsumThumb(seed),
    })),
  },
];

export function allPhotos(): PhotoItem[] {
  return photoCategories.flatMap((c) => c.items);
}

// ============== GRADIENTES ==============

export const gradients: GradientItem[] = [
  { id: "royal", name: "Royal", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "peach", name: "Peach", css: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { id: "cosmic", name: "Cosmic", css: "linear-gradient(135deg, #0f0b29 0%, #1e1b4b 50%, #312e81 100%)" },
  { id: "sunset", name: "Sunset", css: "linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #8b5cf6 100%)" },
  { id: "mint", name: "Mint", css: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" },
  { id: "fire", name: "Fire", css: "linear-gradient(135deg, #f83600 0%, #fe8c00 100%)" },
  { id: "lavender", name: "Lavender", css: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { id: "ocean", name: "Ocean", css: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)" },
  { id: "berry", name: "Berry", css: "linear-gradient(135deg, #e11d48 0%, #be185d 50%, #6b21a8 100%)" },
  { id: "gold", name: "Gold", css: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  { id: "forest", name: "Forest", css: "linear-gradient(135deg, #065f46 0%, #10b981 100%)" },
  { id: "candy", name: "Candy", css: "linear-gradient(135deg, #fce7f3 0%, #ddd6fe 50%, #bfdbfe 100%)" },
  { id: "matrix", name: "Matrix", css: "linear-gradient(135deg, #050505 0%, #064e3b 100%)" },
  { id: "rose-gold", name: "Rose Gold", css: "linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)" },
  { id: "sky", name: "Sky", css: "linear-gradient(to bottom, #38bdf8 0%, #a5f3fc 100%)" },
  { id: "plum", name: "Plum", css: "linear-gradient(135deg, #581c87 0%, #a21caf 100%)" },
  { id: "sand", name: "Sand", css: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)" },
  { id: "ice", name: "Ice", css: "linear-gradient(135deg, #e0f2fe 0%, #67e8f9 100%)" },
  { id: "grape", name: "Grape", css: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)" },
  { id: "lava", name: "Lava", css: "linear-gradient(135deg, #7f1d1d 0%, #f97316 100%)" },
];

// Parse CSS gradient de volta pro schema (from, to, direction)
export function parseGradientToTheme(css: string): {
  from: string;
  via?: string;
  to: string;
  direction: "to-br" | "to-bl" | "to-tr" | "to-tl" | "to-r" | "to-b";
} | null {
  const match = css.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
  if (!match) return null;

  const dirRaw = match[1].trim();
  const stopsRaw = match[2];
  const colorMatches = stopsRaw.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
  if (colorMatches.length < 2) return null;

  const dirMap: Record<string, "to-br" | "to-bl" | "to-tr" | "to-tl" | "to-r" | "to-b"> = {
    "135deg": "to-br",
    "45deg": "to-tr",
    "225deg": "to-bl",
    "315deg": "to-tl",
    "90deg": "to-r",
    "180deg": "to-b",
    "to bottom right": "to-br",
    "to bottom left": "to-bl",
    "to top right": "to-tr",
    "to top left": "to-tl",
    "to right": "to-r",
    "to bottom": "to-b",
  };
  const direction = dirMap[dirRaw] ?? "to-br";

  const first = colorMatches[0]!;
  const last = colorMatches[colorMatches.length - 1]!;
  if (colorMatches.length === 2) {
    return { from: first, to: last, direction };
  }
  return {
    from: first,
    via: colorMatches[1]!,
    to: last,
    direction,
  };
}

// ============== AVATARES (DiceBear) ==============

// DiceBear SVG API: https://www.dicebear.com/
function dicebear(style: string, seed: string): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

const avatarSeeds = [
  "alex", "luna", "maya", "noah", "ruby", "kai", "mia", "leo", "zoe", "eli",
  "nova", "sky", "lyra", "neo", "iris", "axel",
];

export const avatarStyles: { id: string; name: string; emoji: string }[] = [
  { id: "notionists", name: "Ilustrado", emoji: "🎨" },
  { id: "avataaars", name: "Cartoon", emoji: "🧑" },
  { id: "adventurer", name: "Aventureiro", emoji: "🤠" },
  { id: "bottts", name: "Robô", emoji: "🤖" },
  { id: "pixel-art", name: "Pixel", emoji: "👾" },
  { id: "lorelei", name: "Minimal", emoji: "💫" },
  { id: "shapes", name: "Formas", emoji: "🔷" },
  { id: "identicon", name: "Abstrato", emoji: "🎭" },
];

export function avatarsForStyle(styleId: string): AvatarItem[] {
  return avatarSeeds.map((seed) => ({
    id: `${styleId}-${seed}`,
    name: seed,
    url: dicebear(styleId, seed),
  }));
}

export function allAvatarCategories(): {
  style: (typeof avatarStyles)[number];
  items: AvatarItem[];
}[] {
  return avatarStyles.map((s) => ({
    style: s,
    items: avatarsForStyle(s.id),
  }));
}
