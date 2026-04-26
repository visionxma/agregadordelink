// Mapeia referrers e UTM sources para nomes amigáveis + ícones (lucide names)

export type TrafficSource = {
  name: string;
  icon: string; // lucide icon name OR emoji
  color: string; // tailwind text color
};

const HOST_MAP: Record<string, TrafficSource> = {
  "instagram.com": { name: "Instagram", icon: "instagram", color: "text-pink-500" },
  "l.instagram.com": { name: "Instagram", icon: "instagram", color: "text-pink-500" },
  "tiktok.com": { name: "TikTok", icon: "🎵", color: "text-zinc-100" },
  "vm.tiktok.com": { name: "TikTok", icon: "🎵", color: "text-zinc-100" },
  "facebook.com": { name: "Facebook", icon: "facebook", color: "text-blue-600" },
  "m.facebook.com": { name: "Facebook", icon: "facebook", color: "text-blue-600" },
  "l.facebook.com": { name: "Facebook", icon: "facebook", color: "text-blue-600" },
  "lm.facebook.com": { name: "Facebook", icon: "facebook", color: "text-blue-600" },
  "twitter.com": { name: "X (Twitter)", icon: "twitter", color: "text-zinc-100" },
  "x.com": { name: "X (Twitter)", icon: "twitter", color: "text-zinc-100" },
  "t.co": { name: "X (Twitter)", icon: "twitter", color: "text-zinc-100" },
  "linkedin.com": { name: "LinkedIn", icon: "linkedin", color: "text-blue-700" },
  "lnkd.in": { name: "LinkedIn", icon: "linkedin", color: "text-blue-700" },
  "youtube.com": { name: "YouTube", icon: "youtube", color: "text-red-600" },
  "m.youtube.com": { name: "YouTube", icon: "youtube", color: "text-red-600" },
  "youtu.be": { name: "YouTube", icon: "youtube", color: "text-red-600" },
  "google.com": { name: "Google", icon: "search", color: "text-blue-500" },
  "google.com.br": { name: "Google", icon: "search", color: "text-blue-500" },
  "bing.com": { name: "Bing", icon: "search", color: "text-cyan-600" },
  "duckduckgo.com": { name: "DuckDuckGo", icon: "search", color: "text-orange-500" },
  "yahoo.com": { name: "Yahoo", icon: "search", color: "text-purple-600" },
  "whatsapp.com": { name: "WhatsApp", icon: "message-circle", color: "text-green-500" },
  "web.whatsapp.com": { name: "WhatsApp", icon: "message-circle", color: "text-green-500" },
  "api.whatsapp.com": { name: "WhatsApp", icon: "message-circle", color: "text-green-500" },
  "wa.me": { name: "WhatsApp", icon: "message-circle", color: "text-green-500" },
  "t.me": { name: "Telegram", icon: "send", color: "text-sky-500" },
  "telegram.org": { name: "Telegram", icon: "send", color: "text-sky-500" },
  "discord.com": { name: "Discord", icon: "message-square", color: "text-indigo-500" },
  "discordapp.com": { name: "Discord", icon: "message-square", color: "text-indigo-500" },
  "pinterest.com": { name: "Pinterest", icon: "pin", color: "text-red-500" },
  "reddit.com": { name: "Reddit", icon: "message-circle", color: "text-orange-600" },
  "snapchat.com": { name: "Snapchat", icon: "ghost", color: "text-yellow-400" },
  "kwai.com": { name: "Kwai", icon: "video", color: "text-orange-500" },
};

const UTM_MAP: Record<string, TrafficSource> = {
  instagram: HOST_MAP["instagram.com"]!,
  ig: HOST_MAP["instagram.com"]!,
  tiktok: HOST_MAP["tiktok.com"]!,
  facebook: HOST_MAP["facebook.com"]!,
  fb: HOST_MAP["facebook.com"]!,
  twitter: HOST_MAP["twitter.com"]!,
  x: HOST_MAP["twitter.com"]!,
  linkedin: HOST_MAP["linkedin.com"]!,
  youtube: HOST_MAP["youtube.com"]!,
  yt: HOST_MAP["youtube.com"]!,
  google: HOST_MAP["google.com"]!,
  bing: HOST_MAP["bing.com"]!,
  whatsapp: HOST_MAP["whatsapp.com"]!,
  wa: HOST_MAP["whatsapp.com"]!,
  telegram: HOST_MAP["t.me"]!,
  tg: HOST_MAP["t.me"]!,
  discord: HOST_MAP["discord.com"]!,
  pinterest: HOST_MAP["pinterest.com"]!,
  reddit: HOST_MAP["reddit.com"]!,
};

/**
 * Detecta a origem do tráfego a partir do referrer ou UTM source.
 * Aceita tanto URLs (`https://instagram.com/...`) quanto strings com prefixo `utm:source-name`.
 */
export function detectTrafficSource(raw: string | null | undefined): TrafficSource {
  if (!raw) return { name: "Direto / App", icon: "globe", color: "text-zinc-500" };

  // Formato utm:source-name
  if (raw.startsWith("utm:")) {
    const utm = raw.slice(4).toLowerCase().trim();
    return (
      UTM_MAP[utm] ?? { name: utm.charAt(0).toUpperCase() + utm.slice(1), icon: "globe", color: "text-zinc-500" }
    );
  }

  // URL completa
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (HOST_MAP[host]) return HOST_MAP[host]!;
    // Trata subdomínios genéricos
    for (const key of Object.keys(HOST_MAP)) {
      if (host.endsWith(`.${key}`) || host === key) return HOST_MAP[key]!;
    }
    // Não conhecido — usa o domínio como nome
    return { name: host, icon: "globe", color: "text-zinc-500" };
  } catch {
    return { name: raw, icon: "globe", color: "text-zinc-500" };
  }
}
