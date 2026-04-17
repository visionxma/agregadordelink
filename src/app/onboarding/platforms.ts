import type { SocialIconKey } from "@/components/social-icons";

export type Platform = {
  id: SocialIconKey;
  name: string;
  urlBase: string;
  placeholder: string;
  label: string; // rótulo padrão no botão da página
};

export const platforms: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    urlBase: "https://instagram.com/",
    placeholder: "seu_user",
    label: "Instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    urlBase: "https://tiktok.com/@",
    placeholder: "seu_user",
    label: "TikTok",
  },
  {
    id: "youtube",
    name: "YouTube",
    urlBase: "https://youtube.com/@",
    placeholder: "seu_canal",
    label: "YouTube",
  },
  {
    id: "spotify",
    name: "Spotify",
    urlBase: "https://open.spotify.com/artist/",
    placeholder: "id_do_artista",
    label: "Spotify",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    urlBase: "https://wa.me/55",
    placeholder: "11999999999",
    label: "WhatsApp",
  },
  {
    id: "website",
    name: "Site",
    urlBase: "https://",
    placeholder: "meusite.com",
    label: "Meu site",
  },
  {
    id: "twitter",
    name: "X",
    urlBase: "https://x.com/",
    placeholder: "seu_user",
    label: "X",
  },
  {
    id: "threads",
    name: "Threads",
    urlBase: "https://threads.net/@",
    placeholder: "seu_user",
    label: "Threads",
  },
  {
    id: "facebook",
    name: "Facebook",
    urlBase: "https://facebook.com/",
    placeholder: "seu_user",
    label: "Facebook",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    urlBase: "https://linkedin.com/in/",
    placeholder: "seu_user",
    label: "LinkedIn",
  },
  {
    id: "twitch",
    name: "Twitch",
    urlBase: "https://twitch.tv/",
    placeholder: "seu_canal",
    label: "Twitch",
  },
  {
    id: "email",
    name: "Email",
    urlBase: "mailto:",
    placeholder: "voce@email.com",
    label: "Email",
  },
];

export function getPlatform(id: string): Platform | undefined {
  return platforms.find((p) => p.id === id);
}

export function buildPlatformUrl(platform: Platform, input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  const cleaned = trimmed.replace(/^@/, "");
  return platform.urlBase + cleaned;
}
