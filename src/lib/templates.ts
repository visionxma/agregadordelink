import type { BlockData, BlockType, BlockStyle, PageTheme } from "@/lib/db/schema";
import { getPresetById, themePresets } from "@/lib/themes";

export type TemplateBlock = {
  type: BlockType;
  data: BlockData;
  style?: BlockStyle;
};

export type PageTemplate = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  themePresetId: string;
  suggestedTitle: string;
  suggestedBio: string;
  blocks: TemplateBlock[];
  featured?: boolean;
  suggestedCoverUrl?: string;
  themeOverride?: Partial<PageTheme>;
};

// ============== HELPERS ==============

const link = (label: string, url: string, style?: BlockStyle): TemplateBlock => ({
  type: "link",
  data: { kind: "link", label, url },
  ...(style ? { style } : {}),
});
const text = (content: string, align: "left" | "center" | "right" = "center", style?: BlockStyle): TemplateBlock => ({
  type: "text",
  data: { kind: "text", content, align },
  ...(style ? { style } : {}),
});
const divider: TemplateBlock = { type: "divider", data: { kind: "divider" } };

const whatsapp = (label: string, phone: string, message?: string): TemplateBlock => ({
  type: "whatsapp",
  data: { kind: "whatsapp", label, phone, message },
});

const image = (url: string, alt?: string, href?: string): TemplateBlock => ({
  type: "image",
  data: { kind: "image", url, alt, href },
});

const music = (provider: "spotify" | "apple", url: string): TemplateBlock => ({
  type: "music",
  data: { kind: "music", provider, url },
});

const video = (videoId: string, provider: "youtube" | "vimeo" = "youtube"): TemplateBlock => ({
  type: "video",
  data: { kind: "video", provider, videoId },
});

const map = (query: string, label?: string): TemplateBlock => ({
  type: "map",
  data: { kind: "map", query, label },
});

const countdown = (title: string, daysFromNow: number, finishedMessage?: string): TemplateBlock => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return {
    type: "countdown",
    data: {
      kind: "countdown",
      title,
      targetDate: d.toISOString(),
      finishedMessage,
    },
  };
};

const faq = (items: { q: string; a: string }[]): TemplateBlock => ({
  type: "faq",
  data: { kind: "faq", items },
});

const testimonials = (
  items: { name: string; role?: string; quote: string; avatarUrl?: string }[]
): TemplateBlock => ({
  type: "testimonials",
  data: { kind: "testimonials", items },
});

const events = (
  items: { title: string; date: string; city?: string; url?: string }[]
): TemplateBlock => ({
  type: "events",
  data: { kind: "events", items },
});

const buttonGrid = (
  items: { label: string; url: string; icon?: string }[],
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 2,
  style: "filled" | "plain" = "filled"
): TemplateBlock => ({
  type: "button-grid",
  data: { kind: "button-grid", columns, style, items },
});

const productGrid = (
  items: { title: string; price?: string; imageUrl?: string; url?: string }[],
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 2
): TemplateBlock => ({
  type: "product-grid",
  data: { kind: "product-grid", columns, items },
});

const productCarousel = (
  items: { title: string; price?: string; imageUrl?: string; url?: string }[]
): TemplateBlock => ({
  type: "product-carousel",
  data: { kind: "product-carousel", items },
});

const imageCarousel = (
  items: { imageUrl: string; caption?: string; url?: string }[],
  aspect: "1:1" | "3:4" | "12:16" | "9:16" | "4:3" | "16:12" | "16:9" = "1:1"
): TemplateBlock => ({
  type: "image-carousel",
  data: { kind: "image-carousel", aspect, items },
});

const grid = (
  items: { title?: string; imageUrl?: string; url?: string }[],
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 2
): TemplateBlock => ({
  type: "grid",
  data: { kind: "grid", columns, items },
});

const form = (
  title: string,
  fields: { id: string; label: string; type: "text" | "email" | "textarea" | "phone"; required?: boolean }[],
  submitLabel = "Enviar"
): TemplateBlock => ({
  type: "form",
  data: {
    kind: "form",
    title,
    submitLabel,
    successMessage: "Recebemos sua mensagem! Em breve entramos em contato 🙌",
    fields,
  },
});

const newsletter = (
  title: string,
  description: string,
  buttonLabel = "Assinar"
): TemplateBlock => ({
  type: "newsletter",
  data: {
    kind: "newsletter",
    title,
    description,
    buttonLabel,
    placeholder: "seu@email.com",
    provider: "internal",
  },
});

const socialEmbed = (provider: "instagram" | "tiktok", url: string): TemplateBlock => ({
  type: "social-embed",
  data: { kind: "social-embed", provider, url },
});

// ============== CDN DE FOTOS (Unsplash) ==============

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// ============== TEMPLATES PREMIUM ==============

export const pageTemplates: PageTemplate[] = [
  // ═══════════════════════════════════════════════════════
  // CRIADOR DE CONTEÚDO
  // ═══════════════════════════════════════════════════════
  {
    id: "creator-premium",
    name: "Criador Premium",
    category: "Criador",
    emoji: "✨",
    description: "Dark glass + grid de reels + parcerias. Tudo que um criador sério precisa.",
    themePresetId: "midnight-glow",
    suggestedTitle: "@seunick",
    suggestedBio: "✨ Criador de conteúdo · Brasil\n🤝 Parcerias abertas",
    featured: true,
    suggestedCoverUrl: img("1522071820081-009f0129c71c"),
    themeOverride: {
      entryAnimation: "stagger",
      buttonHover: "lift",
      buttonStyle: "glass",
      buttonWidth: "full",
      effect: "gradient-mesh",
      titleFont: "space-grotesk",
    },
    blocks: [
      text("✨ NOVO CONTEÚDO TODO DIA"),
      buttonGrid(
        [
          { label: "📸 Instagram", url: "https://instagram.com/" },
          { label: "🎵 TikTok", url: "https://tiktok.com/@" },
          { label: "▶️ YouTube", url: "https://youtube.com/@" },
          { label: "𝕏 Twitter", url: "https://x.com/" },
        ],
        2,
        "filled"
      ),
      divider,
      text("🔥 Últimos posts em destaque"),
      imageCarousel(
        [
          { imageUrl: img("1611262588024-d12430b98920"), url: "https://instagram.com/" },
          { imageUrl: img("1517292987719-0369a794ec0f"), url: "https://instagram.com/" },
          { imageUrl: img("1513070285999-93e9c6e93fd5"), url: "https://instagram.com/" },
          { imageUrl: img("1517842645767-c639042777db"), url: "https://instagram.com/" },
        ],
        "1:1"
      ),
      divider,
      testimonials([
        {
          name: "Marca XYZ",
          role: "Parceria 2026",
          quote: "Melhor entrega de campanha que tivemos no trimestre.",
        },
        {
          name: "Brand ABC",
          role: "Creator parceiro",
          quote: "Profissionalismo altíssimo. Já marquei a próxima.",
        },
      ]),
      link("💼 Fale com meu agente — parcerias", "mailto:agente@email.com"),
      newsletter(
        "Entre no clube",
        "Bastidores, lançamentos antecipados e conteúdo exclusivo direto no seu e-mail."
      ),
    ],
  },

  {
    id: "creator-y2k",
    name: "Creator Y2K Chrome",
    category: "Criador",
    emoji: "💿",
    description: "Estética Y2K chrome + bordas grossas + tipografia Bebas. Pop e ousado.",
    themePresetId: "y2k",
    suggestedTitle: "@seunick",
    suggestedBio: "🦋 Y2K · Pop · Vintage",
    featured: true,
    themeOverride: {
      buttonStyle: "neubrutalism",
      entryAnimation: "scale",
      titleFont: "bebas",
      font: "dm-sans",
      buttonHover: "lift",
      effect: "grid",
    },
    blocks: [
      text("★ ＬＩＮＫＳ ★"),
      link("INSTAGRAM", "https://instagram.com/"),
      link("TIKTOK", "https://tiktok.com/@"),
      link("YOUTUBE", "https://youtube.com/@"),
      divider,
      text("💿 ＭＥＵＳ ＰＲＯＤＵＴＯＳ"),
      productGrid(
        [
          {
            title: "Preset Y2K",
            price: "R$ 19",
            imageUrl: img("1620287341056-49a2f1ab2fdc"),
            url: "https://",
          },
          {
            title: "E-book Moda",
            price: "R$ 29",
            imageUrl: img("1490481651871-ab68de25d43d"),
            url: "https://",
          },
        ],
        2
      ),
      newsletter("NEWSLETTER", "Drops semanais direto na caixa."),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MÚSICA
  // ═══════════════════════════════════════════════════════
  {
    id: "artist-album",
    name: "Artista — Novo Álbum",
    category: "Música",
    emoji: "🎤",
    description: "Countdown do álbum + Spotify embed + turnê + redes. Cinemático.",
    themePresetId: "img-concert",
    suggestedTitle: "Nome do Artista",
    suggestedBio: "🎤 Cantor(a) · Novo álbum fora dia [data] 🔥",
    featured: true,
    suggestedCoverUrl: img("1493225457124-a3eb161ffa5f"),
    themeOverride: {
      entryAnimation: "slide-up",
      buttonHover: "glare",
      titleFont: "space-grotesk",
    },
    blocks: [
      countdown("🔥 Novo álbum cai em", 14, "🚀 JÁ DISPONÍVEL!"),
      text("Ouça em todas as plataformas"),
      buttonGrid(
        [
          { label: "🎧 Spotify", url: "https://open.spotify.com/" },
          { label: "🍎 Apple Music", url: "https://music.apple.com/" },
          { label: "▶️ YouTube Music", url: "https://music.youtube.com/" },
          { label: "🎵 Deezer", url: "https://deezer.com/" },
        ],
        2
      ),
      divider,
      text("🎫 Próximos shows"),
      events([
        { title: "São Paulo · Espaço Unimed", date: "2026-05-15", city: "SP", url: "https://" },
        { title: "Rio de Janeiro · Vivo Rio", date: "2026-05-22", city: "RJ", url: "https://" },
        { title: "Belo Horizonte · Mineirão", date: "2026-06-05", city: "MG", url: "https://" },
      ]),
      divider,
      socialEmbed("instagram", "https://instagram.com/p/"),
      link("📸 Instagram", "https://instagram.com/"),
      link("💼 Contato profissional", "mailto:booking@email.com"),
    ],
  },

  {
    id: "dj-neon",
    name: "DJ Neon / Cyber",
    category: "Música",
    emoji: "🎧",
    description: "Visual cyber grid + Bebas + monospace. Pra DJ, produtor e rave.",
    themePresetId: "cyber",
    suggestedTitle: "DJ NAME",
    suggestedBio: "🎧 HOUSE · TECHNO · BRAZIL 🇧🇷",
    featured: true,
    themeOverride: {
      buttonStyle: "outline",
      buttonHover: "glare",
      entryAnimation: "stagger",
      font: "jetbrains-mono",
      titleFont: "bebas",
      effect: "grid",
    },
    blocks: [
      countdown("> next set in", 7),
      text("// STREAMING"),
      buttonGrid(
        [
          { label: "▶ SOUNDCLOUD", url: "https://soundcloud.com/" },
          { label: "▶ SPOTIFY", url: "https://open.spotify.com/" },
          { label: "▶ BEATPORT", url: "https://beatport.com/" },
          { label: "▶ YOUTUBE", url: "https://youtube.com/@" },
        ],
        2,
        "plain"
      ),
      divider,
      text("// UPCOMING GIGS"),
      events([
        { title: "Warung Beach Club", date: "2026-05-03", city: "SC" },
        { title: "D-Edge", date: "2026-05-17", city: "SP" },
        { title: "Laroc Club", date: "2026-06-14", city: "SP" },
      ]),
      link("📧 BOOKING", "mailto:booking@email.com"),
      link("📸 INSTAGRAM", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GASTRONOMIA / RESTAURANTE
  // ═══════════════════════════════════════════════════════
  {
    id: "restaurant-gourmet",
    name: "Restaurante Gourmet",
    category: "Gastronomia",
    emoji: "🍽️",
    description: "Foto de prato + cardápio destaque + reservas + map. Sofisticado.",
    themePresetId: "img-restaurant",
    suggestedTitle: "Restaurante [Nome]",
    suggestedBio: "🍽️ Alta gastronomia · [Cidade]\n⭐ Reservas obrigatórias",
    featured: true,
    suggestedCoverUrl: img("1414235077428-338989a2e8c0"),
    themeOverride: {
      titleFont: "playfair",
      font: "dm-sans",
      entryAnimation: "fade",
      buttonHover: "lift",
      buttonStyle: "rounded",
    },
    blocks: [
      text("“Uma experiência gastronômica que transforma ingredientes em memória.”", "center", {
        fontFamily: "playfair",
        fontSize: 16,
      }),
      link("📅 Reservar mesa online", "https://"),
      whatsapp("💬 Reservas pelo WhatsApp", "5511999999999", "Oi! Quero fazer uma reserva."),
      divider,
      text("🍷 Pratos em destaque"),
      productCarousel([
        {
          title: "Risoto de funghi",
          price: "R$ 98",
          imageUrl: img("1476124369491-e7addf5db371"),
        },
        {
          title: "Bife Ancho 400g",
          price: "R$ 146",
          imageUrl: img("1544025162-d76694265947"),
        },
        {
          title: "Ceviche da casa",
          price: "R$ 72",
          imageUrl: img("1559847844-5315695dadae"),
        },
        {
          title: "Tiramisù clássico",
          price: "R$ 38",
          imageUrl: img("1571877227200-a0d98ea607e9"),
        },
      ]),
      link("📋 Cardápio completo (PDF)", "https://"),
      divider,
      testimonials([
        {
          name: "Folha de S.Paulo",
          role: "Guia Gastronômico",
          quote: "Entre os 10 melhores restaurantes novos de 2026.",
        },
        {
          name: "Beatriz M.",
          role: "Cliente Google ⭐⭐⭐⭐⭐",
          quote: "Atendimento impecável, comida memorável. Já voltei 3 vezes.",
        },
      ]),
      map("Restaurante XYZ, São Paulo, SP", "Como chegar"),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  {
    id: "coffee-specialty",
    name: "Café Especial",
    category: "Gastronomia",
    emoji: "☕",
    description: "Warm vibe + grãos + cardápio + evento de degustação.",
    themePresetId: "img-coffee",
    suggestedTitle: "Café [Nome]",
    suggestedBio: "☕ Grãos especiais · [Cidade]",
    featured: true,
    suggestedCoverUrl: img("1495474472287-4d71bcdd2085"),
    themeOverride: {
      titleFont: "playfair",
      buttonStyle: "rounded",
      buttonHover: "lift",
      entryAnimation: "fade",
    },
    blocks: [
      text("“Cada xícara conta uma história.”", "center", { fontFamily: "playfair", fontSize: 15 }),
      buttonGrid(
        [
          { label: "📋 Cardápio", url: "https://" },
          { label: "📦 Peça online", url: "https://" },
        ],
        2
      ),
      divider,
      text("☕ Nossos especiais"),
      productGrid(
        [
          {
            title: "Catuaí Amarelo",
            price: "R$ 58",
            imageUrl: img("1559525839-d9acfd1a7c7d"),
            url: "https://",
          },
          {
            title: "Geisha Natural",
            price: "R$ 120",
            imageUrl: img("1587049352847-81a56d773cae"),
            url: "https://",
          },
        ],
        2
      ),
      events([
        { title: "Degustação de microlotes", date: "2026-05-10", city: "Grátis" },
        { title: "Workshop de métodos coados", date: "2026-05-17", city: "R$ 80" },
      ]),
      map("Café Especial, São Paulo, SP"),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BELEZA / BARBEARIA / SALÃO
  // ═══════════════════════════════════════════════════════
  {
    id: "barber-modern",
    name: "Barbearia Moderna",
    category: "Beleza & Estética",
    emoji: "💈",
    description: "Neubrutalism + preços + portfólio + agendar. Raiz e moderno.",
    themePresetId: "img-barber",
    suggestedTitle: "Barbearia [Nome]",
    suggestedBio: "💈 Cortes clássicos e modernos\n📍 [Endereço]",
    featured: true,
    suggestedCoverUrl: img("1503951914875-452162b0f3f1"),
    themeOverride: {
      buttonStyle: "neubrutalism",
      buttonHover: "lift",
      titleFont: "bebas",
      font: "dm-sans",
      entryAnimation: "slide-up",
    },
    blocks: [
      link("📅 AGENDAR HORÁRIO", "https://"),
      whatsapp("💬 WHATSAPP", "5511999999999", "Oi! Quero agendar um horário."),
      divider,
      text("✂️ TABELA DE SERVIÇOS"),
      buttonGrid(
        [
          { label: "Corte · R$ 50", url: "https://" },
          { label: "Barba · R$ 40", url: "https://" },
          { label: "Combo · R$ 80", url: "https://" },
          { label: "Pezinho · R$ 20", url: "https://" },
        ],
        2,
        "plain"
      ),
      divider,
      text("🔥 PORTFÓLIO"),
      imageCarousel(
        [
          { imageUrl: img("1621605815971-fbc98d665033") },
          { imageUrl: img("1622287162716-f311baa1a2b8") },
          { imageUrl: img("1599351431202-1e0f0137899a") },
          { imageUrl: img("1503951914875-452162b0f3f1") },
        ],
        "1:1"
      ),
      testimonials([
        {
          name: "Lucas F.",
          role: "Cliente ⭐⭐⭐⭐⭐",
          quote: "Melhor barbearia da região. Já sabem meu corte.",
        },
      ]),
      map("Barbearia [Nome], [Cidade]"),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  {
    id: "salon-elegant",
    name: "Salão de Beleza Elegante",
    category: "Beleza & Estética",
    emoji: "💇",
    description: "Rosé + serif + pill buttons + agendamento + portfólio de trabalhos.",
    themePresetId: "rose",
    suggestedTitle: "Salão [Nome]",
    suggestedBio: "💇 Coloração · Corte · Maquiagem\n📍 [Cidade]",
    featured: true,
    suggestedCoverUrl: img("1560066984-138dadb4c035"),
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "tilt",
      titleFont: "playfair",
      entryAnimation: "fade",
      effect: "noise",
    },
    blocks: [
      text("“Realçamos o melhor de você.”", "center", { fontFamily: "playfair", fontSize: 15 }),
      link("📅 Agendar no app", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999", "Oi! Quero agendar."),
      divider,
      text("💖 Nossos serviços"),
      buttonGrid(
        [
          { label: "Coloração", url: "https://" },
          { label: "Corte feminino", url: "https://" },
          { label: "Maquiagem", url: "https://" },
          { label: "Manicure", url: "https://" },
          { label: "Escova", url: "https://" },
          { label: "Hidratação", url: "https://" },
        ],
        2
      ),
      divider,
      text("✨ Trabalhos recentes"),
      imageCarousel(
        [
          { imageUrl: img("1522337360788-8b13dee7a37e") },
          { imageUrl: img("1580618672591-eb180b1a973f") },
          { imageUrl: img("1595163254897-fb44cbf29889") },
        ],
        "3:4"
      ),
      testimonials([
        {
          name: "Mariana S.",
          role: "Cliente fiel",
          quote: "Melhor mãos do Brasil. Minha coloração fica perfeita.",
        },
      ]),
      map("Salão [Nome], [Cidade]"),
    ],
  },

  {
    id: "tattoo-studio",
    name: "Tattoo Studio",
    category: "Beleza & Estética",
    emoji: "🖋️",
    description: "Dark + portfólio 1:1 + orçamento + FAQ de dúvidas. Pro tatuador.",
    themePresetId: "img-tattoo",
    suggestedTitle: "Studio [Nome]",
    suggestedBio: "🖋️ Tattoo Artist · [Estilo]\n📍 [Cidade]",
    featured: true,
    suggestedCoverUrl: img("1530026186672-2cd00ffc50fe"),
    themeOverride: {
      buttonStyle: "outline",
      buttonHover: "lift",
      titleFont: "space-grotesk",
      entryAnimation: "slide-up",
    },
    blocks: [
      link("📅 Agendar sessão", "https://"),
      whatsapp("💬 WhatsApp — orçamento", "5511999999999", "Oi! Gostaria de orçar uma tatuagem."),
      divider,
      text("🎨 Portfólio"),
      imageCarousel(
        [
          { imageUrl: img("1542856391-010fb87dcfed") },
          { imageUrl: img("1565058432513-d6bd7c4b3cc6") },
          { imageUrl: img("1568515045052-f9a854d70bfd") },
          { imageUrl: img("1611691543353-9e97e5eba83d") },
          { imageUrl: img("1586103516265-d0746b6bca36") },
        ],
        "1:1"
      ),
      divider,
      faq([
        {
          q: "Quanto custa uma tatuagem?",
          a: "Depende do tamanho, estilo e detalhes. Mande a referência no WhatsApp para um orçamento personalizado.",
        },
        {
          q: "Preciso de sinal pra agendar?",
          a: "Sim. Cobramos 30% de sinal pra reservar o horário, descontado no valor final.",
        },
        {
          q: "Tem material estéril?",
          a: "Tudo descartável e esterilizado. Você pode conferir o lacre na hora.",
        },
        {
          q: "Posso levar acompanhante?",
          a: "Sim, mas apenas uma pessoa. O estúdio é pequeno.",
        },
      ]),
      testimonials([
        {
          name: "Rafael G.",
          role: "Cliente",
          quote: "Profissional de verdade. Cicatrização perfeita, traço limpíssimo.",
        },
      ]),
      map("Studio [Nome], [Cidade]"),
      link("📸 Instagram — portfólio completo", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FITNESS / SAÚDE
  // ═══════════════════════════════════════════════════════
  {
    id: "personal-trainer",
    name: "Personal Trainer Beast",
    category: "Fitness & Saúde",
    emoji: "💪",
    description: "Gym bg + planos de treino + transformações + lead form. Motivação pura.",
    themePresetId: "img-gym",
    suggestedTitle: "[Seu Nome] | Personal",
    suggestedBio: "💪 Personal Trainer · CREF [nº]\n🎯 Emagrecimento · Hipertrofia",
    featured: true,
    suggestedCoverUrl: img("1534438327077-1af4ffe9c60f"),
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "lift",
      titleFont: "bebas",
      entryAnimation: "stagger",
    },
    blocks: [
      text("🔥 TRANSFORMAÇÕES REAIS, RESULTADOS REAIS", "center", {
        fontFamily: "bebas",
        fontSize: 18,
      }),
      whatsapp("💬 Avaliação grátis no WhatsApp", "5511999999999", "Oi! Quero uma avaliação."),
      divider,
      text("💰 PLANOS"),
      productGrid(
        [
          {
            title: "Online · 1 mês",
            price: "R$ 197",
            imageUrl: img("1549576490-b0b4831ef60a"),
            url: "https://",
          },
          {
            title: "Online · 3 meses",
            price: "R$ 497",
            imageUrl: img("1571019614242-c5c5dee9f50b"),
            url: "https://",
          },
          {
            title: "Presencial",
            price: "R$ 997",
            imageUrl: img("1540497077202-7c8a3999166f"),
            url: "https://",
          },
        ],
        2
      ),
      divider,
      text("🏆 ALUNOS QUE MUDARAM A VIDA"),
      testimonials([
        {
          name: "Pedro A.",
          role: "Aluno há 1 ano",
          quote: "Perdi 18kg e virei outra pessoa. O método funciona, só depende de você.",
        },
        {
          name: "Camila T.",
          role: "Aluna online",
          quote: "Melhor investimento. Treino em casa com orientação real.",
        },
      ]),
      form(
        "Quer uma avaliação?",
        [
          { id: "name", label: "Seu nome", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "phone", label: "WhatsApp", type: "phone", required: true },
          { id: "goal", label: "Qual seu objetivo?", type: "textarea" },
        ],
        "Quero minha avaliação"
      ),
    ],
  },

  {
    id: "nutritionist-online",
    name: "Nutricionista Online",
    category: "Fitness & Saúde",
    emoji: "🥗",
    description: "Clean green + planos + depoimentos + FAQ. Ideal pra nutri online.",
    themePresetId: "pine",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🥗 Nutricionista · CRN [nº]\n📱 Consultas online",
    featured: true,
    themeOverride: {
      buttonStyle: "shadow",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "fade",
    },
    blocks: [
      text("“Alimentação saudável é hábito, não dieta.”", "center", {
        fontFamily: "playfair",
        fontSize: 15,
      }),
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("💚 Planos"),
      productGrid(
        [
          {
            title: "Consulta única",
            price: "R$ 200",
            imageUrl: img("1490645935967-10de6ba17061"),
            url: "https://",
          },
          {
            title: "Acompanhamento 3 meses",
            price: "R$ 497",
            imageUrl: img("1490818387583-1baba5e638af"),
            url: "https://",
          },
        ],
        1
      ),
      divider,
      faq([
        {
          q: "A consulta é online?",
          a: "Sim, 100% por videochamada. Você recebe o plano por PDF.",
        },
        {
          q: "Atende plano de saúde?",
          a: "Não trabalho com planos, mas emito nota fiscal pra você usar como reembolso.",
        },
        {
          q: "Quanto tempo dura a primeira consulta?",
          a: "Cerca de 1h. Avaliação completa e montamos a estratégia juntos.",
        },
      ]),
      testimonials([
        {
          name: "Fernanda L.",
          quote: "Perdi 12kg de forma saudável. Sem crash, sem restrição maluca.",
        },
      ]),
      newsletter("Receitas semanais", "Receitas práticas direto no seu e-mail toda segunda."),
    ],
  },

  {
    id: "yoga-zen",
    name: "Yoga / Bem-estar",
    category: "Fitness & Saúde",
    emoji: "🧘",
    description: "Pastel zen + aulas semanais + planos + noise texture. Calmo e espiritual.",
    themePresetId: "pastel-paper",
    suggestedTitle: "Yoga [Nome]",
    suggestedBio: "🧘 Hatha · Vinyasa · Yin\n📍 [Cidade] + online",
    suggestedCoverUrl: img("1545389336-cf090694435e"),
    themeOverride: {
      buttonStyle: "rounded",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "fade",
      effect: "noise",
    },
    blocks: [
      text("namastê 🙏", "center", { fontFamily: "caveat", fontSize: 24 }),
      link("📅 Ver agenda de aulas", "https://"),
      whatsapp("💬 Reservar aula", "5511999999999"),
      divider,
      text("🕊️ Aulas da semana"),
      events([
        { title: "Hatha Flow · 07h", date: "2026-05-02", city: "Presencial" },
        { title: "Vinyasa · 19h", date: "2026-05-02", city: "Online" },
        { title: "Yin Yoga · 09h", date: "2026-05-04", city: "Presencial" },
        { title: "Meditação guiada · 21h", date: "2026-05-04", city: "Online" },
      ]),
      divider,
      productGrid(
        [
          { title: "Aula única", price: "R$ 60", url: "https://" },
          { title: "Mensal ilimitado", price: "R$ 280", url: "https://" },
        ],
        1
      ),
      map("Estúdio Yoga [Nome], [Cidade]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MODA / E-COMMERCE
  // ═══════════════════════════════════════════════════════
  {
    id: "fashion-editorial",
    name: "Moda Editorial",
    category: "Moda & E-commerce",
    emoji: "👗",
    description: "Editorial preto + lookbook + newsletter + underline buttons. Premium.",
    themePresetId: "img-fashion",
    suggestedTitle: "[Marca / Nome]",
    suggestedBio: "👗 Autoral · Sustentável · Brasil",
    featured: true,
    suggestedCoverUrl: img("1558618666-fcd25c85cd64"),
    themeOverride: {
      buttonStyle: "underline",
      titleFont: "instrument-serif",
      font: "inter",
      entryAnimation: "fade",
      buttonHover: "lift",
    },
    blocks: [
      text("SS · 26 — coleção nova no ar", "center", {
        fontFamily: "instrument-serif",
        fontSize: 18,
      }),
      link("SHOP NOW", "https://"),
      divider,
      text("Lookbook"),
      imageCarousel(
        [
          { imageUrl: img("1490481651871-ab68de25d43d") },
          { imageUrl: img("1496747611176-843222e1e57c") },
          { imageUrl: img("1469334031218-e382a71b716b") },
          { imageUrl: img("1509631179647-0177331693ae") },
        ],
        "3:4"
      ),
      divider,
      text("Destaques da coleção"),
      productCarousel([
        {
          title: "Vestido Longo Azul",
          price: "R$ 349",
          imageUrl: img("1572804013309-59a88b7e92f1"),
          url: "https://",
        },
        {
          title: "Blazer Oversized",
          price: "R$ 459",
          imageUrl: img("1591047139829-d91aecb6caea"),
          url: "https://",
        },
        {
          title: "Calça Alfaiataria",
          price: "R$ 289",
          imageUrl: img("1551698618-1dfe5d97d256"),
          url: "https://",
        },
      ]),
      newsletter("Seja o primeiro", "Avisamos quando a próxima coleção sair."),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  {
    id: "shop-minimalist",
    name: "Loja Minimalista",
    category: "Moda & E-commerce",
    emoji: "🛍️",
    description: "Branco + serif + produtos em grade. Clean pra brands premium.",
    themePresetId: "minimal-white",
    suggestedTitle: "[Marca]",
    suggestedBio: "🛍️ E-commerce · Envios para todo Brasil",
    themeOverride: {
      buttonStyle: "underline",
      titleFont: "instrument-serif",
      entryAnimation: "fade",
      buttonHover: "lift",
    },
    blocks: [
      text("Itens selecionados, feitos com cuidado.", "center", {
        fontFamily: "instrument-serif",
        fontSize: 16,
      }),
      link("Ver loja completa", "https://"),
      divider,
      text("Mais vendidos"),
      productGrid(
        [
          {
            title: "Camiseta Básica",
            price: "R$ 89",
            imageUrl: img("1521572163474-6864f9cf17ab"),
            url: "https://",
          },
          {
            title: "Moletom Essencial",
            price: "R$ 189",
            imageUrl: img("1556821840-3a63f95609a7"),
            url: "https://",
          },
          {
            title: "Bolsa de couro",
            price: "R$ 349",
            imageUrl: img("1548036328-c9fa89d128fa"),
            url: "https://",
          },
          {
            title: "Óculos vintage",
            price: "R$ 129",
            imageUrl: img("1511499767150-a48a237f0083"),
            url: "https://",
          },
        ],
        2
      ),
      divider,
      whatsapp("💬 Atendimento rápido", "5511999999999"),
      newsletter("Novidades em primeira mão", "Fique sabendo de lançamentos e descontos."),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PORTFÓLIO / PROFISSIONAL
  // ═══════════════════════════════════════════════════════
  {
    id: "photographer-premium",
    name: "Fotógrafo Premium",
    category: "Portfólio",
    emoji: "📸",
    description: "Dark + carrossel em 4:5 + contato. Pra book e ensaios.",
    themePresetId: "noir",
    suggestedTitle: "[Nome] · Fotografia",
    suggestedBio: "📸 Ensaios · Casamento · Editorial",
    featured: true,
    suggestedCoverUrl: img("1518281361980-b26bfd556770"),
    themeOverride: {
      buttonStyle: "outline",
      buttonHover: "glare",
      titleFont: "instrument-serif",
      entryAnimation: "fade",
    },
    blocks: [
      text("“A luz conta a história.”", "center", {
        fontFamily: "instrument-serif",
        fontSize: 16,
      }),
      divider,
      text("Portfólio"),
      imageCarousel(
        [
          { imageUrl: img("1519741497674-611481863552") },
          { imageUrl: img("1529636798458-92182e662485") },
          { imageUrl: img("1519225421980-716cf45eda24") },
          { imageUrl: img("1511285560929-80b456fea0bc") },
          { imageUrl: img("1522673607200-164d1b6ce486") },
        ],
        "3:4"
      ),
      divider,
      text("Especialidades"),
      buttonGrid(
        [
          { label: "Casamento", url: "https://" },
          { label: "Ensaio gestante", url: "https://" },
          { label: "Editorial", url: "https://" },
          { label: "Corporativo", url: "https://" },
        ],
        2,
        "plain"
      ),
      testimonials([
        {
          name: "Mariana & Pedro",
          role: "Noivos 2025",
          quote: "Capturou o dia mais importante das nossas vidas. Obrigado pra sempre.",
        },
      ]),
      form(
        "Vamos conversar",
        [
          { id: "name", label: "Nome", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "event", label: "Tipo de evento/ensaio", type: "text" },
          { id: "message", label: "Me conta sua ideia", type: "textarea" },
        ],
        "Enviar briefing"
      ),
    ],
  },

  {
    id: "architect-minimal",
    name: "Arquitetura Minimalista",
    category: "Portfólio",
    emoji: "🏛️",
    description: "Branco + serif + portfólio 16:9 + briefing. Clean e editorial.",
    themePresetId: "minimal-white",
    suggestedTitle: "[Nome] · Arquitetura",
    suggestedBio: "🏛️ Projetos residenciais e comerciais",
    themeOverride: {
      buttonStyle: "underline",
      titleFont: "instrument-serif",
      entryAnimation: "fade",
    },
    blocks: [
      text("“Menos, porém melhor.”", "center", {
        fontFamily: "instrument-serif",
        fontSize: 18,
      }),
      divider,
      text("Projetos recentes"),
      imageCarousel(
        [
          { imageUrl: img("1486406146926-c627a92ad1ab") },
          { imageUrl: img("1505843513577-22bb7d21e455") },
          { imageUrl: img("1493809842364-78817add7ffb") },
          { imageUrl: img("1502672260266-1c1ef2d93688") },
        ],
        "16:9"
      ),
      divider,
      testimonials([
        {
          name: "Família M.",
          role: "Casa de praia · 2025",
          quote: "Entregou mais do que imaginamos. Detalhismo impressionante.",
        },
      ]),
      form(
        "Solicitar briefing",
        [
          { id: "name", label: "Nome", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "type", label: "Tipo de projeto", type: "text" },
          { id: "area", label: "Metragem aproximada", type: "text" },
          { id: "message", label: "Conte-me sobre o projeto", type: "textarea" },
        ],
        "Enviar briefing"
      ),
    ],
  },

  {
    id: "lawyer-professional",
    name: "Advogado Profissional",
    category: "Portfólio",
    emoji: "⚖️",
    description: "Noir + serif + áreas de atuação + consulta. Confiança e seriedade.",
    themePresetId: "bordeaux",
    suggestedTitle: "Dr(a). [Nome Completo]",
    suggestedBio: "⚖️ OAB/XX [número]\n📍 [Cidade]",
    themeOverride: {
      buttonStyle: "rounded",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "fade",
    },
    blocks: [
      text("“Dedicação e resultado com ética.”", "center", {
        fontFamily: "playfair",
        fontSize: 15,
      }),
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("Áreas de atuação"),
      buttonGrid(
        [
          { label: "Trabalhista", url: "https://" },
          { label: "Previdenciário", url: "https://" },
          { label: "Família", url: "https://" },
          { label: "Cível", url: "https://" },
        ],
        2,
        "plain"
      ),
      divider,
      faq([
        {
          q: "Primeira consulta é gratuita?",
          a: "Uma conversa inicial de 20 minutos é gratuita para entender seu caso.",
        },
        {
          q: "Trabalham com honorários de êxito?",
          a: "Sim, em casos trabalhistas e cíveis analisamos honorários de êxito.",
        },
        {
          q: "Atendem online?",
          a: "Sim, atendemos em todo o Brasil por videochamada.",
        },
      ]),
      testimonials([
        {
          name: "João R.",
          role: "Cliente · Ação trabalhista",
          quote: "Ganhei a causa em 8 meses. Atendimento humano e técnico impecável.",
        },
      ]),
      form(
        "Entre em contato",
        [
          { id: "name", label: "Nome completo", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "phone", label: "Telefone", type: "phone", required: true },
          { id: "case", label: "Resumo do caso", type: "textarea", required: true },
        ],
        "Solicitar análise"
      ),
    ],
  },

  {
    id: "realtor-luxury",
    name: "Imobiliário Luxury",
    category: "Portfólio",
    emoji: "🏡",
    description: "Bordeaux + playfair + carrossel de imóveis. Para alto padrão.",
    themePresetId: "pine",
    suggestedTitle: "[Nome] · Imobiliário",
    suggestedBio: "🏡 CRECI [nº] · Alto padrão",
    suggestedCoverUrl: img("1560518883-ce09059eeffa"),
    themeOverride: {
      buttonStyle: "shadow",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "fade",
    },
    blocks: [
      text("Imóveis selecionados. Acompanhamento premium.", "center", {
        fontFamily: "playfair",
        fontSize: 16,
      }),
      link("🔥 Imóveis em destaque", "https://"),
      whatsapp("💬 Falar no WhatsApp", "5511999999999"),
      divider,
      text("Em destaque"),
      productCarousel([
        {
          title: "Cobertura 3 suítes · Jardins",
          price: "R$ 4.900.000",
          imageUrl: img("1564013799919-ab600027ffc6"),
          url: "https://",
        },
        {
          title: "Casa condomínio · Alphaville",
          price: "R$ 2.800.000",
          imageUrl: img("1570129477492-45c003edd2be"),
          url: "https://",
        },
        {
          title: "Apartamento 2 quartos · Itaim",
          price: "R$ 1.350.000",
          imageUrl: img("1502672260266-1c1ef2d93688"),
          url: "https://",
        },
      ]),
      testimonials([
        {
          name: "Família S.",
          quote: "Encontrou nosso lar em 2 semanas. Negociação impecável.",
        },
      ]),
      form(
        "O que você procura?",
        [
          { id: "name", label: "Nome", type: "text", required: true },
          { id: "phone", label: "WhatsApp", type: "phone", required: true },
          { id: "region", label: "Região de interesse", type: "text" },
          { id: "budget", label: "Faixa de valor", type: "text" },
        ],
        "Receber sugestões"
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EDUCAÇÃO / CURSOS
  // ═══════════════════════════════════════════════════════
  {
    id: "course-creator",
    name: "Infoprodutor / Cursos",
    category: "Educação",
    emoji: "🎓",
    description: "Countdown da turma + depoimentos + FAQ + lead. Alto convertedor.",
    themePresetId: "electric",
    suggestedTitle: "[Seu Nome]",
    suggestedBio: "🎓 Ensino [tema]\n🔥 Próxima turma [mês]",
    featured: true,
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "lift",
      titleFont: "poppins",
      entryAnimation: "scale",
    },
    blocks: [
      countdown("🚀 Próxima turma em", 21, "🎓 INSCRIÇÕES ABERTAS!"),
      text("2.400+ alunos já transformaram suas carreiras", "center", {
        fontWeight: 700,
        fontSize: 14,
      }),
      link("🎯 QUERO GARANTIR MINHA VAGA", "https://"),
      divider,
      text("📚 Meus cursos"),
      productGrid(
        [
          {
            title: "Curso Completo",
            price: "12x R$ 97",
            imageUrl: img("1522202176988-66273c2fd55f"),
            url: "https://",
          },
          {
            title: "Mentoria VIP",
            price: "12x R$ 297",
            imageUrl: img("1552664730-d307ca884978"),
            url: "https://",
          },
        ],
        1
      ),
      divider,
      testimonials([
        {
          name: "Ana P.",
          role: "Turma 2025",
          quote: "Fechei meu primeiro contrato de R$ 15k dois meses depois do curso.",
        },
        {
          name: "Bruno M.",
          role: "Turma 2024",
          quote: "Melhor investimento que fiz. Metodologia direta, sem enrolação.",
        },
        {
          name: "Camila R.",
          role: "Turma 2025",
          quote: "Conteúdo + comunidade + mentor ativo. Vale cada centavo.",
        },
      ]),
      faq([
        {
          q: "Tenho acesso vitalício?",
          a: "Sim. Compra única, acesso pra sempre, incluindo atualizações.",
        },
        {
          q: "Quanto tempo dura o curso?",
          a: "São 12 módulos, cerca de 40h de conteúdo. Você faz no seu ritmo.",
        },
        {
          q: "Emite certificado?",
          a: "Sim, certificado de conclusão digital ao finalizar 80% das aulas.",
        },
        {
          q: "Tem garantia?",
          a: "7 dias de garantia incondicional. Não gostou? Devolvemos 100%.",
        },
      ]),
      newsletter("Aulas gratuitas", "Inscreva-se e receba 3 aulas gratuitas por e-mail."),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EVENTOS / CASAMENTO
  // ═══════════════════════════════════════════════════════
  {
    id: "wedding-elegant",
    name: "Casamento Elegante",
    category: "Eventos",
    emoji: "💐",
    description: "Countdown do grande dia + RSVP + lista + mapa. Romântico e completo.",
    themePresetId: "img-wedding",
    suggestedTitle: "[Noiva] & [Noivo]",
    suggestedBio: "💍 Nos casamos em [data]\n📍 [Cidade]",
    featured: true,
    suggestedCoverUrl: img("1519225421980-716cf45eda24"),
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "tilt",
      titleFont: "playfair",
      entryAnimation: "fade",
    },
    blocks: [
      text("“E foram felizes para sempre.”", "center", {
        fontFamily: "caveat",
        fontSize: 28,
      }),
      countdown("Contagem regressiva para o grande dia", 90),
      divider,
      text("Nosso grande dia"),
      events([
        { title: "Cerimônia — Igreja XYZ", date: "2026-10-15", city: "17h" },
        { title: "Recepção — Casa ABC", date: "2026-10-15", city: "19h" },
        { title: "Brunch do dia seguinte", date: "2026-10-16", city: "11h" },
      ]),
      divider,
      text("📸 Nossa história"),
      imageCarousel(
        [
          { imageUrl: img("1511285560929-80b456fea0bc") },
          { imageUrl: img("1525772764200-be829a350797") },
          { imageUrl: img("1537633552985-df8429e8048b") },
        ],
        "3:4"
      ),
      divider,
      buttonGrid(
        [
          { label: "💌 Confirmar presença", url: "https://" },
          { label: "🎁 Lista de presentes", url: "https://" },
          { label: "🏨 Hotéis sugeridos", url: "https://" },
          { label: "📍 Como chegar", url: "https://maps.google.com/" },
        ],
        1
      ),
      map("[Local da cerimônia]"),
      form(
        "RSVP",
        [
          { id: "name", label: "Nome completo", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "guests", label: "Quantos acompanhantes?", type: "text" },
          { id: "restrictions", label: "Restrição alimentar?", type: "text" },
        ],
        "Confirmar presença"
      ),
    ],
  },

  {
    id: "event-party",
    name: "Festa / Evento",
    category: "Eventos",
    emoji: "🎉",
    description: "Hype + countdown + lineup + ingressos + mapa. Pra festas/raves.",
    themePresetId: "dusk",
    suggestedTitle: "[Nome do Evento]",
    suggestedBio: "🎉 [Data] · [Cidade]\n🎫 Ingressos limitados",
    featured: true,
    suggestedCoverUrl: img("1470229722913-7c0e2dbbafd3"),
    themeOverride: {
      buttonStyle: "glass",
      buttonHover: "glare",
      titleFont: "bebas",
      entryAnimation: "stagger",
    },
    blocks: [
      countdown("🔥 O hype começa em", 30),
      link("🎫 GARANTIR INGRESSO", "https://"),
      divider,
      text("🎤 LINEUP"),
      events([
        { title: "DJ NAME — Headliner", date: "2026-05-20", city: "22h" },
        { title: "GUEST DJ", date: "2026-05-20", city: "00h" },
        { title: "LOCAL DJ", date: "2026-05-20", city: "02h" },
      ]),
      divider,
      text("🎬 Teaser"),
      video("dQw4w9WgXcQ"),
      divider,
      map("[Local do evento]"),
      form(
        "Lista VIP",
        [
          { id: "name", label: "Nome", type: "text", required: true },
          { id: "email", label: "E-mail", type: "email", required: true },
          { id: "ig", label: "Instagram", type: "text" },
        ],
        "Entrar na lista"
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PODCAST / MÍDIA
  // ═══════════════════════════════════════════════════════
  {
    id: "podcast-show",
    name: "Podcast",
    category: "Mídia",
    emoji: "🎙️",
    description: "Dark + Spotify embed + últimos episódios + newsletter.",
    themePresetId: "midnight",
    suggestedTitle: "[Nome do Podcast]",
    suggestedBio: "🎙️ Toda [dia] · [tema]",
    featured: true,
    themeOverride: {
      buttonStyle: "glass",
      buttonHover: "lift",
      titleFont: "space-grotesk",
      entryAnimation: "slide-up",
    },
    blocks: [
      text("🎧 Ouça agora"),
      music("spotify", "https://open.spotify.com/show/"),
      divider,
      text("Disponível também em"),
      buttonGrid(
        [
          { label: "🍎 Apple Podcasts", url: "https://podcasts.apple.com/" },
          { label: "▶️ YouTube", url: "https://youtube.com/@" },
          { label: "🎵 Deezer", url: "https://deezer.com/" },
          { label: "🧡 Amazon Music", url: "https://music.amazon.com/" },
        ],
        2
      ),
      divider,
      text("🎬 Episódio destaque"),
      video("dQw4w9WgXcQ"),
      divider,
      testimonials([
        {
          name: "Top Podcasts BR",
          role: "2026",
          quote: "Entre os 50 podcasts mais ouvidos do Brasil.",
        },
      ]),
      newsletter(
        "Receba os episódios primeiro",
        "Toda semana, o novo episódio chega no seu e-mail antes de todo mundo."
      ),
      link("📸 Instagram", "https://instagram.com/"),
      link("💼 Parcerias", "mailto:contato@email.com"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LOJA / DELIVERY
  // ═══════════════════════════════════════════════════════
  {
    id: "delivery-food",
    name: "Delivery de Comida",
    category: "Delivery",
    emoji: "🍕",
    description: "Cardápio visual + apps de delivery + WhatsApp. Foca conversão.",
    themePresetId: "blood-orange",
    suggestedTitle: "[Nome do Restaurante]",
    suggestedBio: "🍕 Delivery · [Cidade]\n⏰ Ter-Dom 18h-23h",
    featured: true,
    suggestedCoverUrl: img("1513104890138-7c749659a591"),
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "lift",
      titleFont: "poppins",
      entryAnimation: "stagger",
    },
    blocks: [
      whatsapp("🛵 PEDIR NO WHATSAPP", "5511999999999", "Oi! Quero fazer um pedido."),
      buttonGrid(
        [
          { label: "🛒 iFood", url: "https://ifood.com.br/" },
          { label: "🛵 Rappi", url: "https://rappi.com/" },
        ],
        2
      ),
      divider,
      text("🍕 Mais pedidos"),
      productCarousel([
        {
          title: "Margherita",
          price: "R$ 59",
          imageUrl: img("1513104890138-7c749659a591"),
          url: "https://",
        },
        {
          title: "Pepperoni",
          price: "R$ 69",
          imageUrl: img("1565299624946-b28f40a0ae38"),
          url: "https://",
        },
        {
          title: "Quatro Queijos",
          price: "R$ 72",
          imageUrl: img("1571407970349-bc81e7e96d47"),
          url: "https://",
        },
        {
          title: "Calabresa Especial",
          price: "R$ 65",
          imageUrl: img("1574071318508-1cdbab80d002"),
          url: "https://",
        },
      ]),
      link("📋 Ver cardápio completo", "https://"),
      map("[Restaurante], [Cidade]"),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  {
    id: "petshop-cute",
    name: "Petshop Fofo",
    category: "Delivery",
    emoji: "🐾",
    description: "Cores pastel + grid de serviços + agendar banho. Cute & funcional.",
    themePresetId: "candy",
    suggestedTitle: "Petshop [Nome]",
    suggestedBio: "🐾 Banho · Tosa · Rações · [Cidade]",
    suggestedCoverUrl: img("1587300003388-59208cc962cb"),
    themeOverride: {
      buttonStyle: "pill",
      buttonHover: "lift",
      titleFont: "poppins",
      entryAnimation: "scale",
    },
    blocks: [
      whatsapp("🐶 Agendar banho/tosa", "5511999999999"),
      buttonGrid(
        [
          { label: "🛒 Loja online", url: "https://" },
          { label: "🐕 Passeio", url: "https://" },
          { label: "🏠 Hospedagem", url: "https://" },
          { label: "💉 Veterinário", url: "https://" },
        ],
        2
      ),
      divider,
      text("🦴 Mais vendidos"),
      productGrid(
        [
          {
            title: "Ração Premium 15kg",
            price: "R$ 189",
            imageUrl: img("1585559604796-bd3c4e2e69c8"),
            url: "https://",
          },
          {
            title: "Brinquedo Kong",
            price: "R$ 49",
            imageUrl: img("1594149929911-e1bfa84b2de7"),
            url: "https://",
          },
        ],
        2
      ),
      testimonials([
        {
          name: "Camila & Thor",
          role: "Clientes desde 2022",
          quote: "Meu Thor ama vir aqui. Atendimento carinhoso com os bichinhos.",
        },
      ]),
      map("[Petshop], [Cidade]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // TRAVEL / AVENTURA
  // ═══════════════════════════════════════════════════════
  {
    id: "travel-adventure",
    name: "Viagem & Aventura",
    category: "Criador",
    emoji: "🌍",
    description: "Fundo de montanha + carrossel + parcerias. Pra criador de travel.",
    themePresetId: "img-mountain",
    suggestedTitle: "@seunick",
    suggestedBio: "🌍 [X] países · Viagem · Aventura",
    suggestedCoverUrl: img("1464822759023-fed622ff2c3b"),
    themeOverride: {
      buttonStyle: "glass",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "stagger",
    },
    blocks: [
      text("“Colecione momentos, não coisas.”", "center", {
        fontFamily: "playfair",
        fontSize: 15,
      }),
      buttonGrid(
        [
          { label: "📸 Instagram", url: "https://instagram.com/" },
          { label: "🎵 TikTok", url: "https://tiktok.com/@" },
          { label: "▶️ YouTube", url: "https://youtube.com/@" },
          { label: "📝 Blog", url: "https://" },
        ],
        2
      ),
      divider,
      text("📍 Destinos recentes"),
      imageCarousel(
        [
          { imageUrl: img("1488646953014-85cb44e25828") },
          { imageUrl: img("1501785888041-af3ef285b470") },
          { imageUrl: img("1464822759023-fed622ff2c3b") },
          { imageUrl: img("1506905925346-21bda4d32df4") },
        ],
        "4:3"
      ),
      divider,
      text("🎒 Equipamentos favoritos"),
      productGrid(
        [
          {
            title: "Mochila 65L",
            price: "R$ 799",
            imageUrl: img("1553062407-98eeb64c6a62"),
            url: "https://",
          },
          {
            title: "Câmera compacta",
            price: "R$ 2.490",
            imageUrl: img("1502920917128-1aa500764cbd"),
            url: "https://",
          },
        ],
        2
      ),
      newsletter("Guia do viajante", "Dicas, roteiros e descontos direto no seu e-mail."),
      link("💼 Parcerias", "mailto:parcerias@email.com"),
    ],
  },

  {
    id: "surf-ocean",
    name: "Surf / Oceano",
    category: "Criador",
    emoji: "🏄",
    description: "Wave bg + aula + produtos + videos. Pra surfista e escolinha.",
    themePresetId: "img-surf",
    suggestedTitle: "@seunick",
    suggestedBio: "🏄 Surf · [Praia]\n🌊 Aulas e viagens",
    suggestedCoverUrl: img("1502680390469-be75c86b636f"),
    themeOverride: {
      buttonStyle: "glass",
      buttonHover: "lift",
      titleFont: "dm-sans",
      entryAnimation: "slide-up",
    },
    blocks: [
      whatsapp("🏄 Marcar aula", "5511999999999"),
      divider,
      text("🎬 Últimos vídeos"),
      video("dQw4w9WgXcQ"),
      divider,
      text("🌊 Feed"),
      imageCarousel(
        [
          { imageUrl: img("1502680390469-be75c86b636f") },
          { imageUrl: img("1440778303588-435521a205bc") },
          { imageUrl: img("1533130061792-64b345e4a833") },
        ],
        "1:1"
      ),
      buttonGrid(
        [
          { label: "📸 Instagram", url: "https://instagram.com/" },
          { label: "🎵 TikTok", url: "https://tiktok.com/@" },
          { label: "▶️ YouTube", url: "https://youtube.com/@" },
          { label: "🏄 Escola de surf", url: "https://" },
        ],
        2
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // TECH / DEV / FREELA
  // ═══════════════════════════════════════════════════════
  {
    id: "dev-freelancer",
    name: "Dev / Freelancer Tech",
    category: "Portfólio",
    emoji: "💻",
    description: "Cyber + monospace + projetos + briefing. Pra dev e designer tech.",
    themePresetId: "cyber",
    suggestedTitle: "@seunick",
    suggestedBio: "💻 Fullstack Dev · Freelancer · Remote",
    themeOverride: {
      buttonStyle: "outline",
      buttonHover: "glare",
      font: "jetbrains-mono",
      titleFont: "jetbrains-mono",
      entryAnimation: "stagger",
    },
    blocks: [
      text("// available for freelance", "center", { fontSize: 14 }),
      buttonGrid(
        [
          { label: "> GITHUB", url: "https://github.com/" },
          { label: "> LINKEDIN", url: "https://linkedin.com/in/" },
          { label: "> TWITTER", url: "https://x.com/" },
          { label: "> PORTFOLIO", url: "https://" },
        ],
        2,
        "plain"
      ),
      divider,
      text("// stack"),
      buttonGrid(
        [
          { label: "React", url: "#" },
          { label: "TypeScript", url: "#" },
          { label: "Next.js", url: "#" },
          { label: "Node.js", url: "#" },
          { label: "Postgres", url: "#" },
          { label: "AWS", url: "#" },
        ],
        3,
        "plain"
      ),
      divider,
      text("// últimos projetos"),
      productGrid(
        [
          {
            title: "SaaS fintech",
            price: "Next.js · TS",
            imageUrl: img("1551288049-bebda4e38f71"),
            url: "https://",
          },
          {
            title: "E-commerce",
            price: "React · Stripe",
            imageUrl: img("1522542550221-31fd19575a2d"),
            url: "https://",
          },
        ],
        1
      ),
      form(
        "// novo projeto",
        [
          { id: "name", label: "name", type: "text", required: true },
          { id: "email", label: "email", type: "email", required: true },
          { id: "budget", label: "budget", type: "text" },
          { id: "brief", label: "brief", type: "textarea", required: true },
        ],
        "> send"
      ),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // ONG / CAUSA
  // ═══════════════════════════════════════════════════════
  {
    id: "nonprofit-cause",
    name: "ONG / Causa Social",
    category: "Outros",
    emoji: "💚",
    description: "Warm + manifesto + doações + voluntariado. Pra mobilizar.",
    themePresetId: "sand",
    suggestedTitle: "[Nome da ONG]",
    suggestedBio: "💚 Causa · [Região]\n🤝 Ajude-nos a fazer a diferença",
    suggestedCoverUrl: img("1488521787991-ed7bbaae773c"),
    themeOverride: {
      buttonStyle: "rounded",
      buttonHover: "lift",
      titleFont: "playfair",
      entryAnimation: "fade",
    },
    blocks: [
      text(
        "Transformamos realidades através de ação local, educação e acolhimento. Toda ajuda transforma uma vida.",
        "center",
        { fontFamily: "playfair", fontSize: 15 }
      ),
      link("💚 Doar agora (PIX)", "https://"),
      link("🔁 Doação recorrente", "https://"),
      divider,
      text("📦 Como você pode ajudar"),
      buttonGrid(
        [
          { label: "🤝 Ser voluntário", url: "https://" },
          { label: "📦 Doar itens", url: "https://" },
          { label: "💼 Parceria empresarial", url: "mailto:" },
          { label: "📣 Compartilhar", url: "https://" },
        ],
        2,
        "plain"
      ),
      divider,
      testimonials([
        {
          name: "Maria L.",
          role: "Beneficiária",
          quote: "Recebi acolhimento, curso e hoje tenho meu próprio trabalho.",
        },
      ]),
      newsletter("Relatório de impacto", "Mensalmente mostramos o que fizemos juntos."),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FOTO DE FUNDO (já criados, mantidos)
  // ═══════════════════════════════════════════════════════
  {
    id: "photo-beach",
    name: "Praia Brasileira",
    category: "Foto de Fundo",
    emoji: "🏖️",
    description: "Fundo de praia tropical + glass buttons. Viagem e lifestyle.",
    themePresetId: "img-beach",
    suggestedTitle: "@seunick",
    suggestedBio: "☀️ Viagem · Surf · Lifestyle",
    suggestedCoverUrl: img("1507525428034-b723cf961d3e"),
    themeOverride: { buttonHover: "lift", entryAnimation: "fade" },
    blocks: [
      buttonGrid(
        [
          { label: "📸 Instagram", url: "https://instagram.com/" },
          { label: "🎵 TikTok", url: "https://tiktok.com/@" },
          { label: "▶️ YouTube", url: "https://youtube.com/@" },
          { label: "📍 Destinos", url: "https://" },
        ],
        2
      ),
      link("💼 Parcerias", "mailto:"),
    ],
  },

  {
    id: "photo-city-night",
    name: "Digital Nomad",
    category: "Foto de Fundo",
    emoji: "🌃",
    description: "City skyline + links profissionais. Pra empreendedor e tech.",
    themePresetId: "img-city-night",
    suggestedTitle: "[Seu Nome]",
    suggestedBio: "💻 Nômade digital · [Especialidade]",
    suggestedCoverUrl: img("1477959858617-67f85cf4f1df"),
    themeOverride: { buttonHover: "lift", entryAnimation: "stagger" },
    blocks: [
      link("🌐 Portfolio", "https://"),
      link("💼 LinkedIn", "https://linkedin.com/in/"),
      link("𝕏 Twitter", "https://x.com/"),
      link("📧 Contato", "mailto:"),
      divider,
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // CRIADOR (variações de nicho)
  // ═══════════════════════════════════════════════════════
  {
    id: "twitch-streamer",
    name: "Streamer Twitch",
    category: "Criador",
    emoji: "🎮",
    description: "Cyber + horário das lives + Discord + apoia. Pra streamer sério.",
    themePresetId: "cyber",
    suggestedTitle: "@SeuNick",
    suggestedBio: "🎮 STREAMER · LIVE TER-DOM 20H",
    themeOverride: { buttonStyle: "outline", titleFont: "bebas", buttonHover: "glare", entryAnimation: "stagger", effect: "grid" },
    blocks: [
      countdown("> next live in", 1),
      link("🔴 TWITCH", "https://twitch.tv/"),
      buttonGrid([
        { label: "▶ YOUTUBE", url: "https://youtube.com/@" },
        { label: "💬 DISCORD", url: "https://discord.gg/" },
        { label: "𝕏 TWITTER", url: "https://x.com/" },
        { label: "🎵 TIKTOK", url: "https://tiktok.com/@" },
      ], 2, "plain"),
      divider,
      text("// SUPPORT THE STREAM"),
      link("💎 APOIAR NO PATREON", "https://patreon.com/"),
      link("☕ Pague um café", "https://"),
    ],
  },

  {
    id: "comedy-creator",
    name: "Humor / Comedy",
    category: "Criador",
    emoji: "😂",
    description: "Electric + bebas + carousel de cortes. Pra comediante e roteirista.",
    themePresetId: "electric",
    suggestedTitle: "@seunick",
    suggestedBio: "😂 Comédia · Stand-up · Internet",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "scale" },
    blocks: [
      text("CALENDÁRIO DE SHOWS 🎤", "center", { fontFamily: "bebas", fontSize: 18 }),
      events([
        { title: "Comedy Club SP", date: "2026-05-10", city: "SP" },
        { title: "Risadaria RJ", date: "2026-05-24", city: "RJ" },
        { title: "Stand-up Curitiba", date: "2026-06-07", city: "PR" },
      ]),
      link("🎫 INGRESSOS", "https://"),
      divider,
      text("MELHORES CORTES"),
      imageCarousel([
        { imageUrl: img("1551817958-d9d86fb29431") },
        { imageUrl: img("1567593810070-7a3d471af022") },
        { imageUrl: img("1573497019940-1c28c88b4f3e") },
      ], "9:16"),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 1),
    ],
  },

  {
    id: "beauty-influencer",
    name: "Beauty Influencer",
    category: "Criador",
    emoji: "💄",
    description: "Rosé + tutoriais + maquiagem favorita + parcerias.",
    themePresetId: "rose",
    suggestedTitle: "@seunick",
    suggestedBio: "💄 Beauty · Skincare · Makeup",
    suggestedCoverUrl: img("1522335789203-aabd1fc54bc9"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade", effect: "noise" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "📌 Pinterest", url: "https://pinterest.com/" },
      ], 2),
      divider,
      text("💖 Meus produtos favoritos"),
      productGrid([
        { title: "Sérum vitamina C", price: "R$ 89", imageUrl: img("1556228720-195a672e8a03"), url: "https://" },
        { title: "Base líquida", price: "R$ 129", imageUrl: img("1571781926291-c477ebfd024b"), url: "https://" },
      ], 2),
      newsletter("Tutoriais semanais", "Truques e reviews direto no seu e-mail."),
      link("💼 Parcerias", "mailto:"),
    ],
  },

  {
    id: "mom-blogger",
    name: "Mom Blogger / Família",
    category: "Criador",
    emoji: "👶",
    description: "Pastel paper + caveat + dicas de maternidade.",
    themePresetId: "pastel-paper",
    suggestedTitle: "@maedo[bebê]",
    suggestedBio: "👶 Maternidade real · Dicas que funcionam",
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "caveat", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("um cantinho pra trocar ideia ✨", "center", { fontFamily: "caveat", fontSize: 22 }),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "📝 Blog", url: "https://" },
        { label: "📌 Pinterest", url: "https://pinterest.com/" },
      ], 2),
      divider,
      text("🎁 Enxoval favorito"),
      productGrid([
        { title: "Kit maternidade", price: "R$ 249", imageUrl: img("1595433707802-6b2626ef1c91"), url: "https://" },
        { title: "Carrinho 3 em 1", price: "R$ 1.890", imageUrl: img("1519689680058-324335c77eba"), url: "https://" },
      ], 2),
      newsletter("Newsletter da mamãe", "Dicas semanais pra rotina dar certo."),
    ],
  },

  {
    id: "cooking-creator",
    name: "Cooking Creator",
    category: "Criador",
    emoji: "👩‍🍳",
    description: "Receitas + e-book + canal. Pra creator de culinária.",
    themePresetId: "terracotta",
    suggestedTitle: "@seunick",
    suggestedBio: "👩‍🍳 Receitas práticas · Sem mistério",
    suggestedCoverUrl: img("1556909114-f6e7ad7d3136"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "stagger" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "📝 Blog", url: "https://" },
      ], 2),
      divider,
      text("🍝 Meus e-books"),
      productGrid([
        { title: "100 receitas práticas", price: "R$ 39", imageUrl: img("1414235077428-338989a2e8c0"), url: "https://" },
        { title: "Massas de domingo", price: "R$ 29", imageUrl: img("1473093295043-cdd812d0e601"), url: "https://" },
      ], 1),
      newsletter("Receita da semana", "Toda quarta uma receita nova no seu e-mail."),
    ],
  },

  {
    id: "anime-otaku",
    name: "Anime / Otaku",
    category: "Criador",
    emoji: "🌸",
    description: "Midnight glow + space-grotesk + community discord.",
    themePresetId: "midnight-glow",
    suggestedTitle: "@seunick",
    suggestedBio: "🌸 Anime · Manga · Cultura japonesa",
    themeOverride: { buttonStyle: "glass", buttonHover: "glare", titleFont: "space-grotesk", entryAnimation: "stagger", effect: "stars" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "💬 Discord", url: "https://discord.gg/" },
      ], 2),
      divider,
      text("🛒 Loja do canal"),
      productGrid([
        { title: "Camiseta Anime", price: "R$ 89", imageUrl: img("1521572163474-6864f9cf17ab"), url: "https://" },
        { title: "Poster oficial", price: "R$ 49", imageUrl: img("1578662996442-48f60103fc96"), url: "https://" },
      ], 2),
    ],
  },

  {
    id: "pet-creator",
    name: "Creator de Pet",
    category: "Criador",
    emoji: "🐶",
    description: "Candy + carrossel fofo + parcerias pet.",
    themePresetId: "candy",
    suggestedTitle: "@meupet",
    suggestedBio: "🐶 Conta do [nome do pet] · [raça]",
    suggestedCoverUrl: img("1587300003388-59208cc962cb"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "poppins", entryAnimation: "scale" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 1),
      divider,
      text("🐾 Coisinhas favoritas"),
      productCarousel([
        { title: "Brinquedo Kong", price: "R$ 49", imageUrl: img("1594149929911-e1bfa84b2de7"), url: "https://" },
        { title: "Petisco natural", price: "R$ 29", imageUrl: img("1583511655826-05700d52f4d9"), url: "https://" },
        { title: "Coleira premium", price: "R$ 89", imageUrl: img("1583337130417-3346a1be7dee"), url: "https://" },
      ]),
      link("💼 Parcerias", "mailto:"),
    ],
  },

  {
    id: "tech-reviewer",
    name: "Reviewer Tech",
    category: "Criador",
    emoji: "💻",
    description: "Cyber + jetbrains + reviews + cupons.",
    themePresetId: "yellow-black",
    suggestedTitle: "@seunick",
    suggestedBio: "💻 Reviews tech · Setups · Gear",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", font: "jetbrains-mono", entryAnimation: "stagger" },
    blocks: [
      buttonGrid([
        { label: "▶ YOUTUBE", url: "https://youtube.com/@" },
        { label: "📸 IG", url: "https://instagram.com/" },
        { label: "🎵 TIKTOK", url: "https://tiktok.com/@" },
        { label: "𝕏 X", url: "https://x.com/" },
      ], 2, "plain"),
      divider,
      text("// MEU SETUP"),
      productGrid([
        { title: "Monitor 4K 27\"", price: "R$ 2.890", imageUrl: img("1527443224154-c4a3942d3acf"), url: "https://" },
        { title: "Teclado mecânico", price: "R$ 599", imageUrl: img("1587829741301-dc798b83add3"), url: "https://" },
        { title: "Mouse pro", price: "R$ 349", imageUrl: img("1527814050087-3793815479db"), url: "https://" },
        { title: "Webcam 4K", price: "R$ 1.290", imageUrl: img("1587825140708-dfaf72ae4b04"), url: "https://" },
      ], 2),
      link("🔥 Cupons exclusivos", "https://"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MÚSICA (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "rock-band",
    name: "Banda de Rock",
    category: "Música",
    emoji: "🤘",
    description: "Noir + bebas + tour + merch + EPK.",
    themePresetId: "noir",
    suggestedTitle: "[Nome da Banda]",
    suggestedBio: "🤘 Rock · [Cidade]\n💿 Novo álbum",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      text("🎸 NOVO ÁLBUM JÁ DISPONÍVEL", "center", { fontFamily: "bebas", fontSize: 18 }),
      music("spotify", "https://open.spotify.com/album/"),
      divider,
      text("🎤 TOUR 2026"),
      events([
        { title: "Audio · São Paulo", date: "2026-06-12", city: "SP" },
        { title: "Circo Voador · Rio", date: "2026-06-19", city: "RJ" },
        { title: "Opinião · Porto Alegre", date: "2026-06-26", city: "RS" },
      ]),
      link("🎫 INGRESSOS", "https://"),
      divider,
      text("👕 MERCH OFICIAL"),
      productGrid([
        { title: "Camiseta tour", price: "R$ 89", imageUrl: img("1521572163474-6864f9cf17ab"), url: "https://" },
        { title: "Vinil edição limitada", price: "R$ 199", imageUrl: img("1493225457124-a3eb161ffa5f"), url: "https://" },
      ], 2),
      link("📧 EPK / Booking", "mailto:booking@email.com"),
    ],
  },

  {
    id: "sertanejo-singer",
    name: "Sertanejo / Country",
    category: "Música",
    emoji: "🤠",
    description: "Terracotta + warm + agenda + clipes.",
    themePresetId: "terracotta",
    suggestedTitle: "[Nome do artista]",
    suggestedBio: "🤠 Sertanejo · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      music("spotify", "https://open.spotify.com/artist/"),
      divider,
      events([
        { title: "Festa do Peão", date: "2026-05-30", city: "Barretos" },
        { title: "Rodeio de Jaguariúna", date: "2026-06-13" },
      ]),
      link("🎫 Ingressos", "https://"),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ Clipes", url: "https://youtube.com/@" },
      ], 2),
      link("📧 Contratação", "mailto:"),
    ],
  },

  {
    id: "gospel-singer",
    name: "Cantor(a) Gospel",
    category: "Música",
    emoji: "🙏",
    description: "Glass + playfair + ministério + convites.",
    themePresetId: "glass",
    suggestedTitle: "[Nome do artista]",
    suggestedBio: "🙏 Música gospel · Adoração",
    themeOverride: { buttonStyle: "glass", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Tudo posso naquele que me fortalece.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      music("spotify", "https://open.spotify.com/artist/"),
      divider,
      events([
        { title: "Congresso Adoração", date: "2026-05-25", city: "BH" },
        { title: "Conferência Mulheres", date: "2026-06-15", city: "SP" },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 2),
      link("📧 Convites para ministrar", "mailto:"),
    ],
  },

  {
    id: "wedding-band",
    name: "Banda de Casamento",
    category: "Música",
    emoji: "💍",
    description: "Rosé + playfair + repertório + orçamento.",
    themePresetId: "rose",
    suggestedTitle: "[Nome da banda]",
    suggestedBio: "💍 Banda para casamentos · [Cidade]",
    suggestedCoverUrl: img("1519225421980-716cf45eda24"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("Sua trilha sonora perfeita 💕", "center", { fontFamily: "playfair", fontSize: 16 }),
      video("dQw4w9WgXcQ"),
      divider,
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "▶️ Vídeos", url: "https://youtube.com/@" },
        { label: "🎵 Repertório", url: "https://" },
        { label: "💌 Orçamento", url: "https://" },
      ], 2),
      testimonials([
        { name: "Mariana & Pedro", role: "Casamento 2025", quote: "Fizeram nosso dia inesquecível. Recomendo de olhos fechados." },
      ]),
      form("Solicitar orçamento", [
        { id: "name", label: "Seu nome", type: "text", required: true },
        { id: "phone", label: "WhatsApp", type: "phone", required: true },
        { id: "date", label: "Data do evento", type: "text" },
        { id: "venue", label: "Local", type: "text" },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FITNESS / SAÚDE (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "crossfit-box",
    name: "Crossfit Box",
    category: "Fitness & Saúde",
    emoji: "🏋️",
    description: "Electric + bebas + WODs da semana + planos.",
    themePresetId: "electric",
    suggestedTitle: "Box [Nome]",
    suggestedBio: "🏋️ Crossfit · [Cidade]\n🔥 Aulas todos os dias",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      text("FORJANDO ATLETAS DESDE 2018", "center", { fontFamily: "bebas", fontSize: 18 }),
      link("🎯 AULA EXPERIMENTAL GRÁTIS", "https://"),
      whatsapp("💬 WHATSAPP", "5511999999999"),
      divider,
      text("📅 WOD DA SEMANA"),
      events([
        { title: "Strength + Metcon", date: "2026-05-04", city: "Segunda" },
        { title: "Olympic Lifting", date: "2026-05-05", city: "Terça" },
        { title: "Hero WOD", date: "2026-05-06", city: "Quarta" },
      ]),
      productGrid([
        { title: "Plano mensal", price: "R$ 320", url: "https://" },
        { title: "Plano trimestral", price: "R$ 850", url: "https://" },
      ], 1),
      map("Box [Nome], [Cidade]"),
    ],
  },

  {
    id: "pilates-studio",
    name: "Estúdio de Pilates",
    category: "Fitness & Saúde",
    emoji: "🤸",
    description: "Mist + serif + agenda + métodos.",
    themePresetId: "mist",
    suggestedTitle: "Estúdio [Nome]",
    suggestedBio: "🤸 Pilates · Reformer · Solo\n📍 [Cidade]",
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("Movimento consciente, corpo equilibrado.", "center", { fontFamily: "playfair", fontSize: 14 }),
      whatsapp("💬 Aula experimental", "5511999999999"),
      buttonGrid([
        { label: "Pilates Reformer", url: "https://" },
        { label: "Pilates Solo", url: "https://" },
        { label: "Pilates na Gravidez", url: "https://" },
        { label: "Pilates 60+", url: "https://" },
      ], 1, "plain"),
      productGrid([
        { title: "2x semana", price: "R$ 320", url: "https://" },
        { title: "3x semana", price: "R$ 450", url: "https://" },
      ], 1),
      map("Estúdio [Nome], [Cidade]"),
    ],
  },

  {
    id: "physiotherapist",
    name: "Fisioterapeuta",
    category: "Fitness & Saúde",
    emoji: "🩺",
    description: "Mist + clean + áreas de atuação + agendar.",
    themePresetId: "mist",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🩺 Fisioterapia · CREFITO [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("Áreas de atuação"),
      buttonGrid([
        { label: "Ortopédica", url: "https://" },
        { label: "Esportiva", url: "https://" },
        { label: "Neurológica", url: "https://" },
        { label: "Dores crônicas", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Atende plano de saúde?", a: "Trabalho com reembolso. Emito nota com código TUSS." },
        { q: "Atende a domicílio?", a: "Sim, na região central da cidade." },
      ]),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "psychologist",
    name: "Psicólogo(a) Online",
    category: "Fitness & Saúde",
    emoji: "🧠",
    description: "Sand + serif + sigilo + acolhimento.",
    themePresetId: "sand",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🧠 Psicologia · CRP [nº]\n💻 Atendimento online",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("“Cuidar da mente é cuidar de você.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Agendar primeira sessão", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("Especialidades"),
      buttonGrid([
        { label: "Ansiedade", url: "https://" },
        { label: "Depressão", url: "https://" },
        { label: "Casais", url: "https://" },
        { label: "Adolescentes", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Quanto custa?", a: "Sessão de 50 minutos por R$ 180. Aceito reembolso." },
        { q: "É sigiloso?", a: "Absolutamente. Sigilo profissional é fundamental." },
      ]),
    ],
  },

  {
    id: "dentist-clinic",
    name: "Dentista / Clínica Odonto",
    category: "Fitness & Saúde",
    emoji: "🦷",
    description: "Clean white + procedimentos + antes-depois.",
    themePresetId: "minimal-white",
    suggestedTitle: "Clínica [Nome]",
    suggestedBio: "🦷 Odontologia estética · CRO [nº]",
    suggestedCoverUrl: img("1606811971618-4486d14f3f99"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "instrument-serif", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar avaliação", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("Procedimentos"),
      buttonGrid([
        { label: "Lentes de contato", url: "https://" },
        { label: "Clareamento", url: "https://" },
        { label: "Implantes", url: "https://" },
        { label: "Ortodontia", url: "https://" },
      ], 2, "plain"),
      text("Antes & depois"),
      imageCarousel([
        { imageUrl: img("1588776814546-1ffcf47267a5") },
        { imageUrl: img("1606811841689-23dfddce3e95") },
      ], "1:1"),
      testimonials([
        { name: "Carolina M.", quote: "Fez minhas lentes e mudou minha autoestima. Resultado natural e perfeito." },
      ]),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "doctor-aesthetic",
    name: "Médico(a) Estética",
    category: "Fitness & Saúde",
    emoji: "💉",
    description: "Rosé suave + procedimentos + agenda VIP.",
    themePresetId: "blush",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "💉 Medicina estética · CRM [nº]",
    suggestedCoverUrl: img("1576091160550-2173dba999ef"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Botox", url: "https://" },
        { label: "Preenchimento", url: "https://" },
        { label: "Bioestimuladores", url: "https://" },
        { label: "Skinbooster", url: "https://" },
      ], 2),
      testimonials([
        { name: "Mariana R.", quote: "Resultado natural, sem perder a expressão. Recomendo!" },
      ]),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "running-coach",
    name: "Maratonista / Run Coach",
    category: "Fitness & Saúde",
    emoji: "🏃",
    description: "Electric + countdown da prova + planilhas.",
    themePresetId: "electric",
    suggestedTitle: "@seunick",
    suggestedBio: "🏃 Run Coach · [PB] na meia · Maratona Brasil",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      countdown("🏁 Próxima maratona", 60),
      whatsapp("💬 Quero uma planilha", "5511999999999"),
      productGrid([
        { title: "Planilha 5K", price: "R$ 49", url: "https://" },
        { title: "Planilha 10K", price: "R$ 79", url: "https://" },
        { title: "Planilha Meia", price: "R$ 129", url: "https://" },
        { title: "Planilha Maratona", price: "R$ 199", url: "https://" },
      ], 2),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 Strava", url: "https://strava.com/" },
      ], 2),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BELEZA (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "brow-designer",
    name: "Designer de Sobrancelhas",
    category: "Beleza & Estética",
    emoji: "✨",
    description: "Blush + portfólio antes-depois + agendar.",
    themePresetId: "blush",
    suggestedTitle: "@seunick",
    suggestedBio: "✨ Brow Designer · Henna · Microblading",
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade", effect: "noise" },
    blocks: [
      whatsapp("💬 Agendar horário", "5511999999999"),
      buttonGrid([
        { label: "Design + Henna", url: "https://" },
        { label: "Brow Lamination", url: "https://" },
        { label: "Microblading", url: "https://" },
      ], 1, "plain"),
      divider,
      imageCarousel([
        { imageUrl: img("1583241475880-083f84372725") },
        { imageUrl: img("1599387737824-6e9b1f6ade85") },
      ], "1:1"),
      testimonials([
        { name: "Bia M.", quote: "Mãos de fada! Já sou cliente fiel." },
      ]),
      map("Studio [Nome]"),
    ],
  },

  {
    id: "manicure-nail",
    name: "Manicure / Nail Designer",
    category: "Beleza & Estética",
    emoji: "💅",
    description: "Candy + portfólio criativo + cores.",
    themePresetId: "candy",
    suggestedTitle: "@seunick",
    suggestedBio: "💅 Nail Designer · [Cidade]",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "playfair", entryAnimation: "scale", effect: "noise" },
    blocks: [
      whatsapp("💬 Agendar horário", "5511999999999"),
      divider,
      text("💖 Portfólio"),
      imageCarousel([
        { imageUrl: img("1604654894610-df63bc536371") },
        { imageUrl: img("1632345031435-8727f6897d53") },
        { imageUrl: img("1604902396830-aca29e19b067") },
      ], "1:1"),
      buttonGrid([
        { label: "Esmaltação simples", url: "https://" },
        { label: "Gel premium", url: "https://" },
        { label: "Nail art", url: "https://" },
      ], 1, "plain"),
      map("Studio [Nome]"),
    ],
  },

  {
    id: "lash-designer",
    name: "Lash Designer",
    category: "Beleza & Estética",
    emoji: "👁️",
    description: "Noir feminino + estilos de cílios + portfólio.",
    themePresetId: "noir",
    suggestedTitle: "@seunick",
    suggestedBio: "👁️ Lash Designer · Volume · Híbrida · Egípcia",
    themeOverride: { buttonStyle: "rounded", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Agendar", "5511999999999"),
      buttonGrid([
        { label: "Volume Russo", url: "https://" },
        { label: "Híbrido", url: "https://" },
        { label: "Brasileiro", url: "https://" },
        { label: "Egípcio", url: "https://" },
      ], 2),
      imageCarousel([
        { imageUrl: img("1620916566256-4fee7a1a8d49") },
        { imageUrl: img("1583241475880-083f84372725") },
      ], "1:1"),
    ],
  },

  {
    id: "spa-luxury",
    name: "Spa / Day Spa",
    category: "Beleza & Estética",
    emoji: "🌿",
    description: "Pine + tratamentos + reserva.",
    themePresetId: "pine",
    suggestedTitle: "Spa [Nome]",
    suggestedBio: "🌿 Day Spa · [Cidade]",
    suggestedCoverUrl: img("1544161515-4ab6ce6db874"),
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Pause. Respire. Renove.”", "center", { fontFamily: "playfair", fontSize: 16 }),
      link("📅 Reservar pacote", "https://"),
      productGrid([
        { title: "Day Spa completo", price: "R$ 590", imageUrl: img("1540555700478-4be289fbecef"), url: "https://" },
        { title: "Massagem relaxante", price: "R$ 220", imageUrl: img("1620733723572-11c53f73a416"), url: "https://" },
        { title: "Limpeza de pele", price: "R$ 280", imageUrl: img("1571019613454-1cb2f99b2d8b"), url: "https://" },
        { title: "Drenagem linfática", price: "R$ 250", imageUrl: img("1591343395082-e120087004b4"), url: "https://" },
      ], 2),
      map("Spa [Nome], [Cidade]"),
    ],
  },

  {
    id: "depilation",
    name: "Depilação",
    category: "Beleza & Estética",
    emoji: "🌸",
    description: "Rose + áreas + pacotes.",
    themePresetId: "rose",
    suggestedTitle: "Studio [Nome]",
    suggestedBio: "🌸 Depilação · Cera · Laser",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Agendar", "5511999999999"),
      divider,
      productGrid([
        { title: "Pernas inteiras", price: "R$ 80", url: "https://" },
        { title: "Buço", price: "R$ 25", url: "https://" },
        { title: "Sobrancelha", price: "R$ 30", url: "https://" },
        { title: "Axilas", price: "R$ 25", url: "https://" },
      ], 2),
      map("Studio [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GASTRONOMIA (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "burger-house",
    name: "Hamburgueria",
    category: "Gastronomia",
    emoji: "🍔",
    description: "Blood-orange + cardápio visual + delivery + iFood.",
    themePresetId: "blood-orange",
    suggestedTitle: "[Nome] Burger",
    suggestedBio: "🍔 Burger artesanal · [Cidade]",
    suggestedCoverUrl: img("1568901346375-23c9450c58cd"),
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("🍔 PEDIR NO WHATSAPP", "5511999999999"),
      buttonGrid([
        { label: "🛒 iFood", url: "https://ifood.com.br/" },
        { label: "🛵 Rappi", url: "https://rappi.com/" },
      ], 2),
      divider,
      text("🔥 MAIS VENDIDOS", "center", { fontFamily: "bebas", fontSize: 18 }),
      productCarousel([
        { title: "Smash Clássico", price: "R$ 32", imageUrl: img("1568901346375-23c9450c58cd"), url: "https://" },
        { title: "Bacon BBQ", price: "R$ 38", imageUrl: img("1571091718767-18b5b1457add"), url: "https://" },
        { title: "Cheddar Power", price: "R$ 36", imageUrl: img("1561758033-d89a9ad46330"), url: "https://" },
        { title: "Veggie", price: "R$ 34", imageUrl: img("1626082929543-5bab6f81b71f"), url: "https://" },
      ]),
      map("[Hamburgueria], [Cidade]"),
    ],
  },

  {
    id: "sushi-bar",
    name: "Sushi Bar",
    category: "Gastronomia",
    emoji: "🍣",
    description: "Noir + serif + combinados + delivery.",
    themePresetId: "noir",
    suggestedTitle: "Sushi [Nome]",
    suggestedBio: "🍣 Sushi · Sashimi · [Cidade]",
    suggestedCoverUrl: img("1579871494447-9811cf80d66c"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("🍱 Pedir delivery", "5511999999999"),
      buttonGrid([
        { label: "🛒 iFood", url: "https://ifood.com.br/" },
        { label: "📅 Reservar mesa", url: "https://" },
      ], 2),
      divider,
      text("Combinados em destaque"),
      productGrid([
        { title: "Combinado 30 peças", price: "R$ 89", imageUrl: img("1611143669185-af224c5e3252"), url: "https://" },
        { title: "Combinado 50 peças", price: "R$ 149", imageUrl: img("1617196034796-73dfa7b1fd56"), url: "https://" },
      ], 1),
      map("Sushi [Nome]"),
    ],
  },

  {
    id: "bakery-artisan",
    name: "Padaria Artesanal",
    category: "Gastronomia",
    emoji: "🥐",
    description: "Sand + playfair + cardápio + encomendas.",
    themePresetId: "sand",
    suggestedTitle: "[Nome] Padaria",
    suggestedBio: "🥐 Padaria artesanal · [Cidade]",
    suggestedCoverUrl: img("1509440159596-0249088772ff"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("Pão fresquinho todo dia 🥖", "center", { fontFamily: "playfair", fontSize: 14 }),
      whatsapp("💬 Encomendas", "5511999999999"),
      productGrid([
        { title: "Pão sourdough", price: "R$ 22", imageUrl: img("1568471173242-461f0a730452"), url: "https://" },
        { title: "Croissant manteiga", price: "R$ 9", imageUrl: img("1555507036-ab1f4038808a"), url: "https://" },
        { title: "Brioche", price: "R$ 16", imageUrl: img("1612900854-a1ba9a3b6cee"), url: "https://" },
        { title: "Pão de fermentação", price: "R$ 25", imageUrl: img("1586444248902-2f64eddc13df"), url: "https://" },
      ], 2),
      map("[Padaria], [Cidade]"),
    ],
  },

  {
    id: "sweet-shop",
    name: "Doceria / Confeitaria",
    category: "Gastronomia",
    emoji: "🧁",
    description: "Candy pastel + bolos + encomendas + festa.",
    themePresetId: "candy",
    suggestedTitle: "[Nome] Doces",
    suggestedBio: "🧁 Bolos · Doces finos · Festas",
    suggestedCoverUrl: img("1565958011703-44f9829ba187"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "scale" },
    blocks: [
      whatsapp("💬 Fazer encomenda", "5511999999999"),
      buttonGrid([
        { label: "🎂 Bolos", url: "https://" },
        { label: "🍰 Tortas", url: "https://" },
        { label: "🧁 Doces finos", url: "https://" },
        { label: "🎉 Mesa de festa", url: "https://" },
      ], 2),
      divider,
      text("💖 Em destaque"),
      productCarousel([
        { title: "Bolo Naked Cake", price: "R$ 280", imageUrl: img("1535141192574-5d4897c12636"), url: "https://" },
        { title: "Brigadeiro gourmet", price: "R$ 4 cada", imageUrl: img("1606312619070-d48b4c652a52"), url: "https://" },
        { title: "Cupcakes", price: "R$ 8 cada", imageUrl: img("1599785209707-a456fc1337bb"), url: "https://" },
      ]),
    ],
  },

  {
    id: "ice-cream",
    name: "Sorveteria / Açaí",
    category: "Gastronomia",
    emoji: "🍦",
    description: "Peach + sabores + delivery quente.",
    themePresetId: "peach-cream",
    suggestedTitle: "[Nome] Açaí",
    suggestedBio: "🍦 Açaí · Sorvetes · [Cidade]",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "poppins", entryAnimation: "scale" },
    blocks: [
      whatsapp("🍨 Pedir delivery", "5511999999999"),
      buttonGrid([
        { label: "🛒 iFood", url: "https://ifood.com.br/" },
        { label: "🛵 Rappi", url: "https://rappi.com/" },
      ], 2),
      divider,
      productGrid([
        { title: "Açaí 500ml", price: "R$ 22", imageUrl: img("1554137479-e2ba43d77b85"), url: "https://" },
        { title: "Sorvete kids", price: "R$ 12", imageUrl: img("1567206563064-6f60f40a2b57"), url: "https://" },
      ], 2),
      map("[Sorveteria]"),
    ],
  },

  {
    id: "craft-beer",
    name: "Cervejaria Artesanal",
    category: "Gastronomia",
    emoji: "🍺",
    description: "Bordeaux + estilos + tap room + tour.",
    themePresetId: "bordeaux",
    suggestedTitle: "Cervejaria [Nome]",
    suggestedBio: "🍺 Craft beer brasileira · [Cidade]",
    suggestedCoverUrl: img("1535958636474-b021ee887b13"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "bebas", entryAnimation: "fade" },
    blocks: [
      text("🍻 TAP ROOM ABERTO QUI-DOM", "center", { fontFamily: "bebas", fontSize: 16 }),
      whatsapp("💬 Reservar mesa", "5511999999999"),
      divider,
      text("ESTILOS DA CASA"),
      productCarousel([
        { title: "IPA tropical", price: "R$ 22", imageUrl: img("1612528443702-f6741f70a049"), url: "https://" },
        { title: "Stout coffee", price: "R$ 26", imageUrl: img("1571613316887-6f8d5cbf7ef7"), url: "https://" },
        { title: "Witbier brasil", price: "R$ 20", imageUrl: img("1535958636474-b021ee887b13"), url: "https://" },
      ]),
      events([
        { title: "Tour pela cervejaria", date: "2026-05-10" },
        { title: "Lançamento Imperial Stout", date: "2026-05-24" },
      ]),
      map("Cervejaria [Nome]"),
    ],
  },

  {
    id: "personal-chef",
    name: "Personal Chef",
    category: "Gastronomia",
    emoji: "👨‍🍳",
    description: "Restaurant bg + jantares privados + orçamento.",
    themePresetId: "img-restaurant",
    suggestedTitle: "Chef [Nome]",
    suggestedBio: "👨‍🍳 Personal Chef · Eventos privados",
    suggestedCoverUrl: img("1556909114-f6e7ad7d3136"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“A mesa é o lugar onde a vida acontece.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      whatsapp("💬 Solicitar orçamento", "5511999999999"),
      buttonGrid([
        { label: "🍽️ Jantar romântico", url: "https://" },
        { label: "🎉 Eventos privados", url: "https://" },
        { label: "📚 Aulas particulares", url: "https://" },
      ], 1, "plain"),
      testimonials([
        { name: "Família L.", quote: "Experiência inesquecível. Comida de outro mundo." },
      ]),
      form("Solicitar orçamento", [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "phone", label: "WhatsApp", type: "phone", required: true },
        { id: "date", label: "Data do evento", type: "text" },
        { id: "guests", label: "Quantas pessoas?", type: "text" },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EVENTOS (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "birthday-15",
    name: "15 Anos / Debutante",
    category: "Eventos",
    emoji: "👑",
    description: "Glass + countdown + lista de padrinhos + RSVP.",
    themePresetId: "rose",
    suggestedTitle: "[Nome] 15 Anos",
    suggestedBio: "👑 Os 15 da [Nome] · [Data]",
    suggestedCoverUrl: img("1519225421980-716cf45eda24"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "caveat", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("a noite mais esperada chegou ✨", "center", { fontFamily: "caveat", fontSize: 26 }),
      countdown("Contagem para a festa", 45),
      events([
        { title: "Cerimônia", date: "2026-08-15", city: "18h" },
        { title: "Festa", date: "2026-08-15", city: "20h" },
      ]),
      buttonGrid([
        { label: "💌 Confirmar presença", url: "https://" },
        { label: "🎁 Lista de presentes", url: "https://" },
      ], 1),
      map("[Local]"),
    ],
  },

  {
    id: "kids-party",
    name: "Festa Infantil",
    category: "Eventos",
    emoji: "🎈",
    description: "Candy + diversão + RSVP fofo.",
    themePresetId: "candy",
    suggestedTitle: "Festa do(a) [Nome]",
    suggestedBio: "🎈 [Idade] anos · [Tema]",
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "caveat", entryAnimation: "scale" },
    blocks: [
      text("vem brincar com a gente! 🎉", "center", { fontFamily: "caveat", fontSize: 26 }),
      countdown("Faltam", 14),
      events([
        { title: "Local da festa", date: "2026-05-15", city: "15h às 19h" },
      ]),
      link("💌 Confirmar presença", "https://"),
      link("🎁 Lista de presentes", "https://"),
      map("[Buffet]"),
    ],
  },

  {
    id: "music-festival",
    name: "Festival de Música",
    category: "Eventos",
    emoji: "🎪",
    description: "Stage + bebas + lineup + ingressos.",
    themePresetId: "stage",
    suggestedTitle: "[Nome do Festival]",
    suggestedBio: "🎪 [Data] · [Cidade]",
    themeOverride: { buttonStyle: "glass", buttonHover: "glare", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      countdown("Falta pouco", 90),
      link("🎫 INGRESSOS", "https://"),
      divider,
      text("LINEUP", "center", { fontFamily: "bebas", fontSize: 22 }),
      events([
        { title: "ATRAÇÃO PRINCIPAL", date: "2026-09-12", city: "Sábado · 22h" },
        { title: "ATRAÇÃO 2", date: "2026-09-12", city: "Sábado · 20h" },
        { title: "ATRAÇÃO 3", date: "2026-09-12", city: "Sábado · 18h" },
      ]),
      map("[Local do festival]"),
    ],
  },

  {
    id: "product-launch",
    name: "Lançamento de Produto",
    category: "Eventos",
    emoji: "🚀",
    description: "Electric + countdown + waitlist + teaser.",
    themePresetId: "electric",
    suggestedTitle: "[Nome do Produto]",
    suggestedBio: "🚀 Em breve · [Data]",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "space-grotesk", entryAnimation: "scale" },
    blocks: [
      countdown("🔥 LANÇAMENTO EM", 30, "🚀 JÁ DISPONÍVEL!"),
      video("dQw4w9WgXcQ"),
      newsletter("Entre na lista VIP", "Os primeiros a saber receberão 30% de desconto."),
      link("📸 Instagram", "https://instagram.com/"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // E-COMMERCE (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "jewelry-handmade",
    name: "Joalheria Artesanal",
    category: "Moda & E-commerce",
    emoji: "💍",
    description: "Sand + serif + peças únicas + sob encomenda.",
    themePresetId: "sand",
    suggestedTitle: "[Marca]",
    suggestedBio: "💍 Joias autorais · Prata 925 · Ouro",
    suggestedCoverUrl: img("1605100804763-247f67b3557e"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("Peças feitas à mão, com história.", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("🛍️ Loja online", "https://"),
      divider,
      productCarousel([
        { title: "Anel solitário", price: "R$ 1.890", imageUrl: img("1602173574767-37ac01994b2a"), url: "https://" },
        { title: "Brincos pérola", price: "R$ 590", imageUrl: img("1535632066274-3bb9e99daf1e"), url: "https://" },
        { title: "Colar minimalista", price: "R$ 390", imageUrl: img("1611652022419-a9419f74343d"), url: "https://" },
      ]),
      whatsapp("💬 Sob encomenda", "5511999999999"),
      newsletter("Novas peças", "Te avisamos quando uma nova coleção sair."),
    ],
  },

  {
    id: "plant-shop",
    name: "Loja de Plantas",
    category: "Moda & E-commerce",
    emoji: "🪴",
    description: "Pine + verde + plantas + cuidados.",
    themePresetId: "pine",
    suggestedTitle: "[Marca] Plantas",
    suggestedBio: "🪴 Plantas raras · Vasos · Cuidados",
    suggestedCoverUrl: img("1485955900006-10f4d324d411"),
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Encomenda", "5511999999999"),
      productGrid([
        { title: "Monstera Adansonii", price: "R$ 89", imageUrl: img("1614594975525-e45190c55d0b"), url: "https://" },
        { title: "Costela de Adão", price: "R$ 159", imageUrl: img("1525498128493-380d1990a112"), url: "https://" },
        { title: "Suculentas mix", price: "R$ 39", imageUrl: img("1459411552884-841db9b3cc2a"), url: "https://" },
        { title: "Vaso cerâmica", price: "R$ 79", imageUrl: img("1485955900006-10f4d324d411"), url: "https://" },
      ], 2),
      faq([
        { q: "Vocês entregam?", a: "Sim, entregamos em [região]. Plantas embaladas com cuidado." },
        { q: "Tenho dúvidas sobre cuidados", a: "Cada planta vai com guia. Também respondemos no WhatsApp." },
      ]),
      map("[Loja]"),
    ],
  },

  {
    id: "lingerie-shop",
    name: "Lingerie / Sleepwear",
    category: "Moda & E-commerce",
    emoji: "🌸",
    description: "Blush + serif + coleção + measurements.",
    themePresetId: "blush",
    suggestedTitle: "[Marca]",
    suggestedBio: "🌸 Lingerie autoral · Conforto · Sensualidade",
    suggestedCoverUrl: img("1571945153237-4929e783af4a"),
    themeOverride: { buttonStyle: "underline", titleFont: "instrument-serif", buttonHover: "lift", entryAnimation: "fade" },
    blocks: [
      text("Para mulheres reais, em todos os corpos.", "center", { fontFamily: "instrument-serif", fontSize: 14 }),
      link("🛍️ Loja online", "https://"),
      divider,
      productCarousel([
        { title: "Conjunto Renda", price: "R$ 189", imageUrl: img("1571945153237-4929e783af4a"), url: "https://" },
        { title: "Pijama seda", price: "R$ 249", imageUrl: img("1582142306909-195724d33ffc"), url: "https://" },
      ]),
      faq([
        { q: "Como sei meu tamanho?", a: "Confira nosso guia de medidas no site. Em dúvida, chama no WhatsApp." },
      ]),
      whatsapp("💬 Atendimento", "5511999999999"),
    ],
  },

  {
    id: "decor-shop",
    name: "Decoração / Casa",
    category: "Moda & E-commerce",
    emoji: "🏠",
    description: "Mist + clean + ambientes + curadoria.",
    themePresetId: "mist",
    suggestedTitle: "[Marca]",
    suggestedBio: "🏠 Decoração consciente · Casa autoral",
    themeOverride: { buttonStyle: "underline", titleFont: "instrument-serif", buttonHover: "lift", entryAnimation: "fade" },
    blocks: [
      link("🏠 Loja completa", "https://"),
      divider,
      text("Por ambiente"),
      buttonGrid([
        { label: "Sala", url: "https://" },
        { label: "Quarto", url: "https://" },
        { label: "Cozinha", url: "https://" },
        { label: "Banheiro", url: "https://" },
      ], 2, "plain"),
      productCarousel([
        { title: "Vaso decorativo", price: "R$ 189", imageUrl: img("1556910103-1c02745aae4d"), url: "https://" },
        { title: "Quadro abstrato", price: "R$ 290", imageUrl: img("1513519245088-0e12902e5a38"), url: "https://" },
      ]),
      newsletter("Inspirações", "Decor inspiration toda semana."),
    ],
  },

  {
    id: "kids-fashion",
    name: "Moda Infantil",
    category: "Moda & E-commerce",
    emoji: "🧸",
    description: "Peach + lookbook + idade + categorias.",
    themePresetId: "peach-cream",
    suggestedTitle: "[Marca] Kids",
    suggestedBio: "🧸 Moda infantil · 0-10 anos",
    suggestedCoverUrl: img("1622290291468-a28f7a7dc6a8"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "scale" },
    blocks: [
      buttonGrid([
        { label: "Bebê 0-2", url: "https://" },
        { label: "Infantil 3-6", url: "https://" },
        { label: "Junior 7-10", url: "https://" },
        { label: "Acessórios", url: "https://" },
      ], 2),
      productGrid([
        { title: "Conjunto verão", price: "R$ 99", imageUrl: img("1519278409-1f56fdda7fe5"), url: "https://" },
        { title: "Vestido festa", price: "R$ 149", imageUrl: img("1503944168849-8bf86e60b86e"), url: "https://" },
      ], 2),
      whatsapp("💬 Atendimento", "5511999999999"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EDUCAÇÃO (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "english-school",
    name: "Escola de Inglês",
    category: "Educação",
    emoji: "🇬🇧",
    description: "Glass + planos + nível + aulas grátis.",
    themePresetId: "glass",
    suggestedTitle: "[Escola] · Inglês",
    suggestedBio: "🇬🇧 Inglês para o mundo real · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "poppins", entryAnimation: "fade" },
    blocks: [
      link("🎁 Aula experimental grátis", "https://"),
      whatsapp("💬 Tirar dúvida", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Adulto", url: "https://" },
        { label: "Adolescente", url: "https://" },
        { label: "Kids", url: "https://" },
        { label: "Empresarial", url: "https://" },
      ], 2),
      productGrid([
        { title: "Plano básico", price: "R$ 280/mês", url: "https://" },
        { title: "Plano premium", price: "R$ 480/mês", url: "https://" },
      ], 1),
      faq([
        { q: "Aulas são online?", a: "Híbrido. Tem turmas presenciais e online." },
        { q: "Faz preparatório TOEFL?", a: "Sim, temos programa específico." },
      ]),
    ],
  },

  {
    id: "guitar-teacher",
    name: "Professor(a) de Violão",
    category: "Educação",
    emoji: "🎸",
    description: "Bordeaux + aulas + metodologia + experimental.",
    themePresetId: "bordeaux",
    suggestedTitle: "[Nome] · Violão",
    suggestedBio: "🎸 Aulas particulares · [Cidade] + Online",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("🎸 Agendar aula experimental grátis", "5511999999999"),
      productGrid([
        { title: "Aula avulsa", price: "R$ 80", url: "https://" },
        { title: "Pacote 4 aulas", price: "R$ 280", url: "https://" },
        { title: "Mensal 8 aulas", price: "R$ 520", url: "https://" },
      ], 1),
      testimonials([
        { name: "Lucas M.", quote: "Em 3 meses estava tocando minhas músicas favoritas." },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 2),
    ],
  },

  {
    id: "business-mentor",
    name: "Mentor Empresarial",
    category: "Educação",
    emoji: "📈",
    description: "Glass + cases + agendamento estratégico.",
    themePresetId: "glass",
    suggestedTitle: "[Nome] · Mentor",
    suggestedBio: "📈 Mentor de negócios · [Setor]",
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar mentoria estratégica", "https://"),
      divider,
      text("Cases de sucesso"),
      testimonials([
        { name: "Empresa X", role: "Crescimento 4x em 12 meses", quote: "Mentoria que mudou nossa estratégia comercial completamente." },
        { name: "Founder Y", role: "Captação Series A", quote: "Conseguiu o que parecia impossível: levantar capital sem diluir muito." },
      ]),
      productGrid([
        { title: "Sessão única", price: "R$ 1.500", url: "https://" },
        { title: "Trimestre", price: "R$ 12.000", url: "https://" },
      ], 1),
      buttonGrid([
        { label: "💼 LinkedIn", url: "https://linkedin.com/in/" },
        { label: "🎙️ Podcast", url: "https://" },
      ], 2),
    ],
  },

  {
    id: "kitchen-class",
    name: "Curso de Cozinha",
    category: "Educação",
    emoji: "🍳",
    description: "Terracotta + aulas presenciais + receituário.",
    themePresetId: "terracotta",
    suggestedTitle: "Chef [Nome]",
    suggestedBio: "🍳 Aulas de cozinha · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Reservar vaga", "5511999999999"),
      events([
        { title: "Massa fresca", date: "2026-05-10", city: "Sábado · 14h" },
        { title: "Confeitaria francesa", date: "2026-05-17", city: "Sábado · 14h" },
        { title: "Comida japonesa", date: "2026-05-24", city: "Sábado · 14h" },
      ]),
      productGrid([
        { title: "Aula avulsa", price: "R$ 280", url: "https://" },
        { title: "Pacote 4 aulas", price: "R$ 990", url: "https://" },
      ], 1),
      map("Estúdio [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SERVIÇOS (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "electrician",
    name: "Eletricista",
    category: "Serviços",
    emoji: "⚡",
    description: "Yellow-black + serviços + emergência 24h.",
    themePresetId: "yellow-black",
    suggestedTitle: "[Nome] Elétrica",
    suggestedBio: "⚡ Eletricista · [Cidade] · 24h",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("⚡ EMERGÊNCIA 24H", "5511999999999"),
      buttonGrid([
        { label: "Instalações", url: "https://" },
        { label: "Manutenção", url: "https://" },
        { label: "Quadros elétricos", url: "https://" },
        { label: "Ar-condicionado", url: "https://" },
      ], 2, "plain"),
      testimonials([
        { name: "Carlos R.", quote: "Resolveu em 1 dia o que outro profissional levou semanas." },
      ]),
      map("[Cidade]"),
    ],
  },

  {
    id: "plumber",
    name: "Encanador",
    category: "Serviços",
    emoji: "🔧",
    description: "Mist + clean + serviços rápidos.",
    themePresetId: "mist",
    suggestedTitle: "[Nome] Hidráulica",
    suggestedBio: "🔧 Encanador profissional · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "poppins", entryAnimation: "fade" },
    blocks: [
      whatsapp("🚰 Atendimento rápido", "5511999999999"),
      buttonGrid([
        { label: "Vazamentos", url: "https://" },
        { label: "Desentupimento", url: "https://" },
        { label: "Instalações", url: "https://" },
        { label: "Reparos", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Atende emergência?", a: "Sim, em até 1h na região." },
        { q: "Tem garantia?", a: "Todos os serviços têm 90 dias de garantia." },
      ]),
    ],
  },

  {
    id: "house-cleaner",
    name: "Diarista / Faxina",
    category: "Serviços",
    emoji: "🧼",
    description: "Mist + limpeza + tabela + agendar.",
    themePresetId: "mist",
    suggestedTitle: "[Nome] Limpeza",
    suggestedBio: "🧼 Limpeza residencial e comercial",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Agendar diária", "5511999999999"),
      productGrid([
        { title: "Faxina simples", price: "R$ 180", url: "https://" },
        { title: "Faxina pesada", price: "R$ 280", url: "https://" },
        { title: "Pós-obra", price: "R$ 450", url: "https://" },
      ], 1),
      testimonials([
        { name: "Família S.", quote: "Profissional, organizada e detalhista. Já é da família." },
      ]),
    ],
  },

  {
    id: "moving-service",
    name: "Mudanças / Transportes",
    category: "Serviços",
    emoji: "📦",
    description: "Yellow-black + bold + orçamento online.",
    themePresetId: "yellow-black",
    suggestedTitle: "[Nome] Mudanças",
    suggestedBio: "📦 Mudanças locais e interestaduais",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("📞 ORÇAMENTO RÁPIDO", "5511999999999"),
      buttonGrid([
        { label: "Mudança local", url: "https://" },
        { label: "Mudança interestadual", url: "https://" },
        { label: "Frete pequeno", url: "https://" },
        { label: "Embalagem", url: "https://" },
      ], 2, "plain"),
      form("Solicitar orçamento", [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "phone", label: "WhatsApp", type: "phone", required: true },
        { id: "from", label: "De onde", type: "text", required: true },
        { id: "to", label: "Para onde", type: "text", required: true },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // ESPIRITUALIDADE
  // ═══════════════════════════════════════════════════════
  {
    id: "tarot-astro",
    name: "Tarot / Astrologia",
    category: "Espiritualidade",
    emoji: "🔮",
    description: "Galaxy + stars + leituras + agendamento.",
    themePresetId: "galaxy",
    suggestedTitle: "[Nome]",
    suggestedBio: "🔮 Tarot · Astrologia · Numerologia",
    themeOverride: { buttonStyle: "glass", buttonHover: "glare", titleFont: "playfair", entryAnimation: "fade", effect: "stars" },
    blocks: [
      text("“As estrelas mostram, você decide.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      whatsapp("🌙 Agendar leitura", "5511999999999"),
      buttonGrid([
        { label: "Tarot diário", url: "https://" },
        { label: "Mapa astral", url: "https://" },
        { label: "Sinastria", url: "https://" },
        { label: "Trânsitos", url: "https://" },
      ], 2),
      productGrid([
        { title: "Leitura 30min", price: "R$ 120", url: "https://" },
        { title: "Mapa astral completo", price: "R$ 290", url: "https://" },
      ], 1),
    ],
  },

  {
    id: "reiki-holistic",
    name: "Reiki / Terapia Holística",
    category: "Espiritualidade",
    emoji: "🕊️",
    description: "Pastel paper + zen + sessões + harmonia.",
    themePresetId: "pastel-paper",
    suggestedTitle: "[Nome]",
    suggestedBio: "🕊️ Reiki Master · Terapia Floral",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("namastê 🙏", "center", { fontFamily: "caveat", fontSize: 22 }),
      whatsapp("💬 Agendar sessão", "5511999999999"),
      buttonGrid([
        { label: "Reiki", url: "https://" },
        { label: "Cristaloterapia", url: "https://" },
        { label: "Florais", url: "https://" },
        { label: "Constelação", url: "https://" },
      ], 2),
      productGrid([
        { title: "Sessão única", price: "R$ 180", url: "https://" },
        { title: "Pacote 4 sessões", price: "R$ 600", url: "https://" },
      ], 1),
    ],
  },

  {
    id: "church-ministry",
    name: "Igreja / Ministério",
    category: "Espiritualidade",
    emoji: "✝️",
    description: "Glass + cultos + ministérios + dízimo.",
    themePresetId: "glass",
    suggestedTitle: "[Nome da Igreja]",
    suggestedBio: "✝️ Comunidade cristã · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Vinde a mim todos os que estais cansados.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      events([
        { title: "Culto Domingo", date: "2026-05-04", city: "10h e 19h" },
        { title: "Reunião Quarta", date: "2026-05-07", city: "20h" },
        { title: "Jovens Sábado", date: "2026-05-10", city: "19h30" },
      ]),
      buttonGrid([
        { label: "📺 Cultos online", url: "https://" },
        { label: "📖 Estudos", url: "https://" },
        { label: "🤝 Ministérios", url: "https://" },
        { label: "💝 Dízimo / PIX", url: "https://" },
      ], 2),
      map("[Igreja]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // TECH / NEGÓCIOS (variações)
  // ═══════════════════════════════════════════════════════
  {
    id: "marketing-agency",
    name: "Agência de Marketing",
    category: "Portfólio",
    emoji: "📣",
    description: "Glass + cases + serviços + briefing.",
    themePresetId: "glass",
    suggestedTitle: "[Nome] Agência",
    suggestedBio: "📣 Performance · Branding · Conteúdo",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "space-grotesk", entryAnimation: "stagger" },
    blocks: [
      link("📅 Diagnóstico gratuito", "https://"),
      buttonGrid([
        { label: "Performance", url: "https://" },
        { label: "Branding", url: "https://" },
        { label: "Social Media", url: "https://" },
        { label: "Conteúdo", url: "https://" },
      ], 2, "plain"),
      testimonials([
        { name: "Cliente A", role: "ROI 8x", quote: "Multiplicaram nosso faturamento em 6 meses." },
        { name: "Cliente B", role: "+340% leads", quote: "Estratégia clara, execução impecável." },
      ]),
      form("Briefing inicial", [
        { id: "company", label: "Empresa", type: "text", required: true },
        { id: "email", label: "E-mail", type: "email", required: true },
        { id: "phone", label: "WhatsApp", type: "phone", required: true },
        { id: "budget", label: "Investimento mensal", type: "text" },
        { id: "goal", label: "Principal objetivo", type: "textarea" },
      ]),
    ],
  },

  {
    id: "social-media-manager",
    name: "Social Media Manager",
    category: "Portfólio",
    emoji: "📱",
    description: "Candy + planilhas + cases + pacotes.",
    themePresetId: "candy",
    suggestedTitle: "@seunick",
    suggestedBio: "📱 Social Media · Conteúdo · Estratégia",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "poppins", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Quero contratar", "5511999999999"),
      productGrid([
        { title: "Plano básico", price: "R$ 1.290/mês", url: "https://" },
        { title: "Plano completo", price: "R$ 2.890/mês", url: "https://" },
      ], 1),
      testimonials([
        { name: "Loja X", quote: "Triplicou nosso engajamento em 60 dias." },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "💼 LinkedIn", url: "https://linkedin.com/in/" },
      ], 2),
    ],
  },

  {
    id: "video-editor",
    name: "Editor de Vídeo",
    category: "Portfólio",
    emoji: "🎬",
    description: "Cyber dark + reel + pacotes + brief.",
    themePresetId: "noir",
    suggestedTitle: "@seunick",
    suggestedBio: "🎬 Editor · Color · Motion",
    themeOverride: { buttonStyle: "outline", buttonHover: "glare", titleFont: "space-grotesk", entryAnimation: "stagger" },
    blocks: [
      text("// reel 2026"),
      video("dQw4w9WgXcQ"),
      divider,
      productGrid([
        { title: "Reel Instagram", price: "R$ 290", url: "https://" },
        { title: "Vídeo YouTube", price: "R$ 590", url: "https://" },
        { title: "Comercial", price: "Sob orçamento", url: "https://" },
      ], 1),
      form("// briefing", [
        { id: "name", label: "name", type: "text", required: true },
        { id: "email", label: "email", type: "email", required: true },
        { id: "type", label: "tipo de vídeo", type: "text" },
        { id: "deadline", label: "prazo", type: "text" },
      ]),
    ],
  },

  {
    id: "copywriter",
    name: "Copywriter",
    category: "Portfólio",
    emoji: "✍️",
    description: "Minimal + serif + portfolio + briefing.",
    themePresetId: "minimal-white",
    suggestedTitle: "[Nome] · Copywriter",
    suggestedBio: "✍️ Palavras que vendem.",
    themeOverride: { buttonStyle: "underline", titleFont: "instrument-serif", buttonHover: "lift", entryAnimation: "fade" },
    blocks: [
      text("“Não venda o produto. Venda a história.”", "center", { fontFamily: "instrument-serif", fontSize: 16 }),
      buttonGrid([
        { label: "Portfólio completo", url: "https://" },
        { label: "Cases de sucesso", url: "https://" },
        { label: "LinkedIn", url: "https://linkedin.com/in/" },
      ], 1, "plain"),
      productGrid([
        { title: "Copy de e-mail", price: "R$ 290", url: "https://" },
        { title: "Página de vendas", price: "R$ 1.890", url: "https://" },
        { title: "Manifesto da marca", price: "R$ 990", url: "https://" },
      ], 1),
      form("Briefing", [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "email", label: "E-mail", type: "email", required: true },
        { id: "project", label: "Projeto", type: "textarea", required: true },
      ]),
    ],
  },

  {
    id: "financial-coach",
    name: "Coach Financeiro",
    category: "Portfólio",
    emoji: "💰",
    description: "Pine + serif + planilhas + e-book.",
    themePresetId: "pine",
    suggestedTitle: "[Nome] · Finanças",
    suggestedBio: "💰 Educador financeiro · Investimentos",
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("Liberdade financeira começa com um plano.", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Mentoria 1:1", "https://"),
      productGrid([
        { title: "E-book Investimentos", price: "R$ 39", url: "https://" },
        { title: "Planilha controle", price: "R$ 19", url: "https://" },
        { title: "Curso Renda Fixa", price: "R$ 297", url: "https://" },
      ], 1),
      newsletter("Newsletter financeira", "Toda segunda, conteúdo prático no seu e-mail."),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // KIDS / FAMILY (extras)
  // ═══════════════════════════════════════════════════════
  {
    id: "kids-entertainer",
    name: "Animador de Festa",
    category: "Eventos",
    emoji: "🎈",
    description: "Candy + alegria + temas + RSVP.",
    themePresetId: "candy",
    suggestedTitle: "[Nome] Animação",
    suggestedBio: "🎈 Festas infantis · Personagens · Jogos",
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "caveat", entryAnimation: "scale" },
    blocks: [
      whatsapp("🎉 Solicitar orçamento", "5511999999999"),
      buttonGrid([
        { label: "Personagens", url: "https://" },
        { label: "Recreação", url: "https://" },
        { label: "Pintura facial", url: "https://" },
        { label: "Brinquedos", url: "https://" },
      ], 2),
      imageCarousel([
        { imageUrl: img("1530103862676-de8c9debad1d") },
        { imageUrl: img("1607344645866-009c320c5ab0") },
      ], "1:1"),
      form("Reservar data", [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "phone", label: "WhatsApp", type: "phone", required: true },
        { id: "date", label: "Data da festa", type: "text", required: true },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PETS (extras)
  // ═══════════════════════════════════════════════════════
  {
    id: "dog-trainer",
    name: "Adestrador de Cães",
    category: "Outros",
    emoji: "🐕",
    description: "Pine + clean + comportamento + cases.",
    themePresetId: "pine",
    suggestedTitle: "[Nome] · Adestrador",
    suggestedBio: "🐕 Adestramento positivo · [Cidade]",
    suggestedCoverUrl: img("1583511655826-05700d52f4d9"),
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Avaliação grátis", "5511999999999"),
      buttonGrid([
        { label: "Comportamental", url: "https://" },
        { label: "Filhotes", url: "https://" },
        { label: "Reativos", url: "https://" },
      ], 1, "plain"),
      testimonials([
        { name: "Família & Thor", quote: "Mudou o comportamento do nosso cão em 4 sessões." },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 2),
    ],
  },

  {
    id: "vet-clinic",
    name: "Veterinária / Clínica",
    category: "Outros",
    emoji: "🐾",
    description: "Mist + agendamento + emergência 24h.",
    themePresetId: "mist",
    suggestedTitle: "Clínica [Nome]",
    suggestedBio: "🐾 Veterinária 24h · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("🚨 Emergência 24h", "5511999999999"),
      link("📅 Agendar consulta", "https://"),
      buttonGrid([
        { label: "Clínica geral", url: "https://" },
        { label: "Cirurgia", url: "https://" },
        { label: "Banho e tosa", url: "https://" },
        { label: "Vacinas", url: "https://" },
      ], 2, "plain"),
      map("Clínica [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // DESIGN / ARTE
  // ═══════════════════════════════════════════════════════
  {
    id: "graphic-designer",
    name: "Designer Gráfico",
    category: "Portfólio",
    emoji: "🎨",
    description: "Y2K chrome + portfólio + briefing.",
    themePresetId: "y2k",
    suggestedTitle: "[Nome] · Design",
    suggestedBio: "🎨 Identidade · Branding · Web",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "tilt", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      text("PORTFÓLIO ★", "center", { fontFamily: "bebas", fontSize: 18 }),
      imageCarousel([
        { imageUrl: img("1561070791-2526d30994b8") },
        { imageUrl: img("1626785774573-4b799315345d") },
        { imageUrl: img("1558655146-364adaf1fcc9") },
      ], "1:1"),
      productGrid([
        { title: "Logo", price: "R$ 1.290", url: "https://" },
        { title: "Identidade visual", price: "R$ 3.890", url: "https://" },
        { title: "Site", price: "R$ 5.990", url: "https://" },
      ], 1),
      buttonGrid([
        { label: "Behance", url: "https://behance.net/" },
        { label: "Dribbble", url: "https://dribbble.com/" },
      ], 2, "plain"),
    ],
  },

  {
    id: "illustrator",
    name: "Ilustrador(a) Digital",
    category: "Portfólio",
    emoji: "🖌️",
    description: "Pastel + ilustrações + commissions.",
    themePresetId: "pastel-paper",
    suggestedTitle: "@seunick",
    suggestedBio: "🖌️ Ilustração · Character design",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "caveat", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("desenhos com alma ✨", "center", { fontFamily: "caveat", fontSize: 22 }),
      imageCarousel([
        { imageUrl: img("1543857778-c4a1a3e0b2eb") },
        { imageUrl: img("1547826039-bfc35e0f1ea8") },
        { imageUrl: img("1572883454114-1cf0031ede2a") },
      ], "1:1"),
      productGrid([
        { title: "Retrato simples", price: "R$ 80", url: "https://" },
        { title: "Personagem completo", price: "R$ 250", url: "https://" },
        { title: "Cena completa", price: "R$ 490", url: "https://" },
      ], 1),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🛒 Etsy", url: "https://etsy.com/" },
      ], 2),
    ],
  },

  {
    id: "tutor-private",
    name: "Professor(a) Particular",
    category: "Educação",
    emoji: "📚",
    description: "Mist + matérias + reforço escolar.",
    themePresetId: "mist",
    suggestedTitle: "[Nome] · Tutor(a)",
    suggestedBio: "📚 Aulas particulares · Matemática · Física · Química",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Aula experimental grátis", "5511999999999"),
      buttonGrid([
        { label: "Matemática", url: "https://" },
        { label: "Física", url: "https://" },
        { label: "Química", url: "https://" },
        { label: "Vestibular", url: "https://" },
      ], 2, "plain"),
      productGrid([
        { title: "Aula avulsa", price: "R$ 80", url: "https://" },
        { title: "Pacote 8 aulas", price: "R$ 580", url: "https://" },
      ], 1),
      testimonials([
        { name: "Aluna J.", quote: "Passei na federal! Aulas claras e didáticas." },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MÉDICOS (especialidades)
  // ═══════════════════════════════════════════════════════
  {
    id: "doctor-pediatra",
    name: "Pediatra",
    category: "Saúde",
    emoji: "👶",
    description: "Pastel + acolhimento + agendamento + plantão.",
    themePresetId: "blush",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "👶 Pediatra · CRM [nº] · [Cidade]",
    suggestedCoverUrl: img("1576091160550-2173dba999ef"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Cuidando de quem é tudo na sua vida.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 Plantão WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Consulta de rotina", url: "https://" },
        { label: "Recém-nascidos", url: "https://" },
        { label: "Adolescentes", url: "https://" },
        { label: "Acompanhamento", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Atende plano de saúde?", a: "Trabalho com [planos]. Confira a lista atualizada no site." },
        { q: "Faz teleconsulta?", a: "Sim, em casos específicos e acompanhamento de pacientes regulares." },
      ]),
      testimonials([
        { name: "Família S.", quote: "Médica humana, paciente. Meus filhos amam a consulta." },
      ]),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "doctor-cardiologist",
    name: "Cardiologista",
    category: "Saúde",
    emoji: "❤️",
    description: "Bordeaux + clean + consulta + check-up.",
    themePresetId: "bordeaux",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "❤️ Cardiologia · CRM [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Consulta cardiológica", url: "https://" },
        { label: "Check-up cardíaco", url: "https://" },
        { label: "Holter / MAPA", url: "https://" },
        { label: "Ergometria", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Quando devo procurar?", a: "Pressão alta, dor no peito, falta de ar, histórico familiar — sempre vale avaliar." },
      ]),
      map("Consultório [Nome]"),
    ],
  },

  {
    id: "doctor-gynecologist",
    name: "Ginecologista",
    category: "Saúde",
    emoji: "🌸",
    description: "Blush + acolhimento + áreas + agendar.",
    themePresetId: "blush",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🌸 Ginecologia · Obstetrícia · CRM [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Cuidado integral, em todas as fases da vida.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Agendar", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Consulta de rotina", url: "https://" },
        { label: "Pré-natal", url: "https://" },
        { label: "Climatério", url: "https://" },
        { label: "Sexologia", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Atende adolescentes?", a: "Sim, com acompanhante quando necessário." },
        { q: "Faz parto?", a: "Sim, hospital [Nome]." },
      ]),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "doctor-dermatologist",
    name: "Dermatologista",
    category: "Saúde",
    emoji: "✨",
    description: "Mist + clean + procedimentos estéticos + clínicos.",
    themePresetId: "mist",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "✨ Dermatologia · Estética · CRM [nº]",
    suggestedCoverUrl: img("1576091160550-2173dba999ef"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar avaliação", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      text("Clínica"),
      buttonGrid([
        { label: "Acne", url: "https://" },
        { label: "Câncer de pele", url: "https://" },
        { label: "Queda de cabelo", url: "https://" },
        { label: "Psoríase", url: "https://" },
      ], 2, "plain"),
      text("Estética"),
      buttonGrid([
        { label: "Botox", url: "https://" },
        { label: "Preenchimento", url: "https://" },
        { label: "Peeling", url: "https://" },
        { label: "Laser", url: "https://" },
      ], 2),
      map("Clínica [Nome]"),
    ],
  },

  {
    id: "doctor-orthopedist",
    name: "Ortopedista",
    category: "Saúde",
    emoji: "🦴",
    description: "Mist + áreas + emergência + reabilitação.",
    themePresetId: "mist",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🦴 Ortopedia · Traumatologia · CRM [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Agendar", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Joelho", url: "https://" },
        { label: "Coluna", url: "https://" },
        { label: "Ombro", url: "https://" },
        { label: "Trauma esportivo", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Faz cirurgia?", a: "Sim, hospital [Nome]." },
      ]),
      map("Consultório [Nome]"),
    ],
  },

  {
    id: "doctor-psychiatrist",
    name: "Psiquiatra",
    category: "Saúde",
    emoji: "🧠",
    description: "Sand + acolhimento + transtornos + sigilo.",
    themePresetId: "sand",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "🧠 Psiquiatria · CRM [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade", effect: "noise" },
    blocks: [
      text("“Saúde mental é prioridade.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Agendar primeira consulta", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      buttonGrid([
        { label: "Ansiedade", url: "https://" },
        { label: "Depressão", url: "https://" },
        { label: "TDAH", url: "https://" },
        { label: "Bipolaridade", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "É sigiloso?", a: "Absolutamente. Sigilo profissional é fundamental e total." },
        { q: "Atende online?", a: "Sim, em todo o Brasil por videochamada segura." },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // ADVOGADOS (especialidades)
  // ═══════════════════════════════════════════════════════
  {
    id: "lawyer-criminal",
    name: "Advogado Criminal",
    category: "Jurídico",
    emoji: "⚖️",
    description: "Noir + bordeaux + plantão 24h + casos.",
    themePresetId: "noir",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "⚖️ Advocacia Criminal · OAB [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Defesa técnica é direito constitucional.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      whatsapp("🚨 PLANTÃO 24H", "5511999999999"),
      link("📅 Agendar consulta", "https://"),
      divider,
      buttonGrid([
        { label: "Audiência custódia", url: "https://" },
        { label: "Habeas Corpus", url: "https://" },
        { label: "Defesa em processo", url: "https://" },
        { label: "Tribunal do Júri", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Pode atuar em qualquer estado?", a: "Sim, advogados podem atuar em todo o Brasil." },
        { q: "Atende em delegacia?", a: "Sim, plantão 24h para flagrantes e custódia." },
      ]),
    ],
  },

  {
    id: "lawyer-family",
    name: "Advogado de Família",
    category: "Jurídico",
    emoji: "👨‍👩‍👧",
    description: "Sand + acolhimento + áreas + processo justo.",
    themePresetId: "sand",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "👨‍👩‍👧 Direito de Família · OAB [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Consulta inicial", "https://"),
      whatsapp("💬 WhatsApp", "5511999999999"),
      divider,
      buttonGrid([
        { label: "Divórcio", url: "https://" },
        { label: "Pensão alimentícia", url: "https://" },
        { label: "Guarda", url: "https://" },
        { label: "Inventário", url: "https://" },
        { label: "União estável", url: "https://" },
        { label: "Adoção", url: "https://" },
      ], 2, "plain"),
      testimonials([
        { name: "Cliente A.", quote: "Acolhimento e técnica. Resolveu meu divórcio sem trauma." },
      ]),
    ],
  },

  {
    id: "lawyer-labor",
    name: "Advogado Trabalhista",
    category: "Jurídico",
    emoji: "💼",
    description: "Bordeaux + cálculos + processos + escritório.",
    themePresetId: "bordeaux",
    suggestedTitle: "Dr(a). [Nome]",
    suggestedBio: "💼 Direito do Trabalho · OAB [nº]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Você sabe seus direitos? Eu sei.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("🧮 Calcular rescisão grátis", "https://"),
      whatsapp("💬 Tirar dúvida", "5511999999999"),
      buttonGrid([
        { label: "Rescisão indevida", url: "https://" },
        { label: "Horas extras", url: "https://" },
        { label: "Assédio moral", url: "https://" },
        { label: "Acidente trabalho", url: "https://" },
      ], 2, "plain"),
      testimonials([
        { name: "João R.", quote: "Ganhei R$ 80k de processo. Honorários de êxito justos." },
      ]),
      faq([
        { q: "Trabalha com êxito?", a: "Sim, sem custo inicial em causas trabalhistas." },
      ]),
    ],
  },

  {
    id: "lawyer-corporate",
    name: "Advogado Empresarial",
    category: "Jurídico",
    emoji: "📊",
    description: "Glass + business + serviços + retainer.",
    themePresetId: "glass",
    suggestedTitle: "[Escritório] Advocacia",
    suggestedBio: "📊 Direito Empresarial · M&A · Tributário",
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("📅 Reunião estratégica", "https://"),
      buttonGrid([
        { label: "Constituição empresa", url: "https://" },
        { label: "Contratos", url: "https://" },
        { label: "Tributário", url: "https://" },
        { label: "M&A", url: "https://" },
        { label: "Trabalhista PJ", url: "https://" },
        { label: "Compliance", url: "https://" },
      ], 2, "plain"),
      testimonials([
        { name: "Empresa X", role: "Cliente desde 2018", quote: "Assessoria completa, evitou problemas que poderiam custar milhões." },
      ]),
      buttonGrid([
        { label: "💼 LinkedIn", url: "https://linkedin.com/in/" },
        { label: "📧 E-mail", url: "mailto:" },
      ], 2),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FARMÁCIA
  // ═══════════════════════════════════════════════════════
  {
    id: "pharmacy",
    name: "Farmácia",
    category: "Saúde",
    emoji: "💊",
    description: "Mist + delivery + consulta farmacêutica + loja online.",
    themePresetId: "mist",
    suggestedTitle: "Farmácia [Nome]",
    suggestedBio: "💊 Delivery 24h · Consulta farmacêutica",
    suggestedCoverUrl: img("1631549916768-4119b2e5f926"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "poppins", entryAnimation: "fade" },
    blocks: [
      whatsapp("💊 Pedir delivery", "5511999999999"),
      buttonGrid([
        { label: "💊 Loja online", url: "https://" },
        { label: "🛵 iFood", url: "https://ifood.com.br/" },
        { label: "📋 Receita digital", url: "https://" },
        { label: "💉 Vacinas", url: "https://" },
      ], 2),
      productGrid([
        { title: "Linha bebê", url: "https://", imageUrl: img("1595433707802-6b2626ef1c91") },
        { title: "Vitaminas", url: "https://", imageUrl: img("1607619056574-7b8d3ee536b2") },
      ], 2),
      faq([
        { q: "Vocês entregam à noite?", a: "Sim, delivery 24 horas." },
        { q: "Tem aplicação de vacinas?", a: "Sim, calendário completo. Agende pelo WhatsApp." },
      ]),
      map("Farmácia [Nome]"),
    ],
  },

  {
    id: "pharmacy-manipulation",
    name: "Farmácia de Manipulação",
    category: "Saúde",
    emoji: "🧪",
    description: "Pine + clean + receitas + fórmulas.",
    themePresetId: "pine",
    suggestedTitle: "[Nome] Manipulação",
    suggestedBio: "🧪 Farmácia de manipulação · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      whatsapp("💬 Enviar receita", "5511999999999"),
      buttonGrid([
        { label: "Dermocosméticos", url: "https://" },
        { label: "Emagrecimento", url: "https://" },
        { label: "Hormônios", url: "https://" },
        { label: "Veterinária", url: "https://" },
      ], 2, "plain"),
      faq([
        { q: "Quanto tempo pra preparar?", a: "Em média 24-48h dependendo da fórmula." },
        { q: "Vocês entregam?", a: "Sim, em [região]. Frete grátis acima de R$ 100." },
      ]),
      map("Farmácia [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GAMER / ESPORTS
  // ═══════════════════════════════════════════════════════
  {
    id: "gamer-pro",
    name: "Gamer Profissional",
    category: "Criador",
    emoji: "🎮",
    description: "Cyber + bebas + setup + torneios + Discord.",
    themePresetId: "cyber",
    suggestedTitle: "@SeuNick",
    suggestedBio: "🎮 Pro Player · [Game] · Team [Nome]",
    suggestedCoverUrl: img("1542751371-adc38448a05e"),
    themeOverride: { buttonStyle: "outline", buttonHover: "glare", titleFont: "bebas", font: "jetbrains-mono", entryAnimation: "stagger", effect: "grid" },
    blocks: [
      text("// PROFESSIONAL GAMER"),
      countdown("> next tournament", 14),
      link("🔴 LIVE NA TWITCH", "https://twitch.tv/"),
      buttonGrid([
        { label: "▶ YOUTUBE", url: "https://youtube.com/@" },
        { label: "💬 DISCORD", url: "https://discord.gg/" },
        { label: "𝕏 TWITTER", url: "https://x.com/" },
        { label: "🎵 TIKTOK", url: "https://tiktok.com/@" },
      ], 2, "plain"),
      divider,
      text("// MY SETUP"),
      productGrid([
        { title: "Mouse Pro", price: "R$ 599", imageUrl: img("1527814050087-3793815479db"), url: "https://" },
        { title: "Teclado", price: "R$ 1.299", imageUrl: img("1587829741301-dc798b83add3"), url: "https://" },
        { title: "Headset", price: "R$ 899", imageUrl: img("1583394838336-acd977736f90"), url: "https://" },
        { title: "Monitor 240Hz", price: "R$ 3.490", imageUrl: img("1527443224154-c4a3942d3acf"), url: "https://" },
      ], 2),
      link("📧 BOOKING / SPONSORSHIP", "mailto:"),
    ],
  },

  {
    id: "esports-team",
    name: "Time de E-Sports",
    category: "Criador",
    emoji: "🏆",
    description: "Cyber + neon + roster + sponsors.",
    themePresetId: "yellow-black",
    suggestedTitle: "[Team Name]",
    suggestedBio: "🏆 Pro E-Sports · [Game] · Brasil",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "glare", titleFont: "bebas", entryAnimation: "stagger", effect: "grid" },
    blocks: [
      text("THE TEAM ★", "center", { fontFamily: "bebas", fontSize: 22 }),
      grid([
        { title: "@player1", imageUrl: img("1633332755192-727a05c4013d"), url: "https://" },
        { title: "@player2", imageUrl: img("1535713875002-d1d0cf377fde"), url: "https://" },
        { title: "@player3", imageUrl: img("1558898479-33c0057a5d12"), url: "https://" },
        { title: "@player4", imageUrl: img("1531427186611-ecfd6d936c79"), url: "https://" },
      ], 2),
      countdown("⏰ NEXT MATCH", 3),
      buttonGrid([
        { label: "📺 TWITCH", url: "https://twitch.tv/" },
        { label: "🎮 DISCORD", url: "https://discord.gg/" },
        { label: "𝕏 TWITTER", url: "https://x.com/" },
        { label: "🛒 STORE", url: "https://" },
      ], 2, "plain"),
      link("📧 SPONSORSHIP", "mailto:"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // ESPORTES (atletas, escolinhas)
  // ═══════════════════════════════════════════════════════
  {
    id: "soccer-player",
    name: "Jogador de Futebol",
    category: "Esportes",
    emoji: "⚽",
    description: "Electric + estatísticas + agente + bastidores.",
    themePresetId: "electric",
    suggestedTitle: "[Seu Nome]",
    suggestedBio: "⚽ Jogador profissional · [Posição] · [Clube]",
    suggestedCoverUrl: img("1574629810360-7efbbe195018"),
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "𝕏 Twitter", url: "https://x.com/" },
      ], 2),
      divider,
      text("⚡ ESTATÍSTICAS 2026", "center", { fontFamily: "bebas", fontSize: 18 }),
      grid([
        { title: "32 Jogos" },
        { title: "18 Gols" },
        { title: "9 Assists" },
        { title: "4 Trofeus" },
      ], 2),
      productGrid([
        { title: "Camisa autografada", price: "R$ 890", imageUrl: img("1551638558-e4c34f068dab"), url: "https://" },
      ], 1),
      link("📧 Agente / Patrocínio", "mailto:"),
    ],
  },

  {
    id: "athlete-personal",
    name: "Atleta Profissional",
    category: "Esportes",
    emoji: "🏅",
    description: "Stage + treinos + patrocínios + comunidade.",
    themePresetId: "stage",
    suggestedTitle: "[Seu Nome]",
    suggestedBio: "🏅 Atleta · [Modalidade] · Team Brasil",
    suggestedCoverUrl: img("1452626038306-9aae5e071dd3"),
    themeOverride: { buttonStyle: "glass", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "🏃 Strava", url: "https://strava.com/" },
      ], 2),
      divider,
      text("🏆 PRÓXIMAS COMPETIÇÕES"),
      events([
        { title: "Pan-Americano", date: "2026-08-15", city: "Lima · PE" },
        { title: "Mundial", date: "2026-10-20", city: "Tóquio · JP" },
      ]),
      newsletter("Newsletter do atleta", "Acompanhe a temporada de perto."),
      link("📧 Patrocínio", "mailto:"),
    ],
  },

  {
    id: "soccer-school",
    name: "Escolinha de Futebol",
    category: "Esportes",
    emoji: "⚽",
    description: "Electric + matrículas + categorias + treinos.",
    themePresetId: "electric",
    suggestedTitle: "Escolinha [Nome]",
    suggestedBio: "⚽ Iniciação esportiva · 6 a 17 anos",
    themeOverride: { buttonStyle: "pill", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("⚽ MATRICULAR", "5511999999999"),
      link("🎁 Aula experimental grátis", "https://"),
      divider,
      text("CATEGORIAS"),
      buttonGrid([
        { label: "Sub-7", url: "https://" },
        { label: "Sub-9", url: "https://" },
        { label: "Sub-11", url: "https://" },
        { label: "Sub-13", url: "https://" },
        { label: "Sub-15", url: "https://" },
        { label: "Sub-17", url: "https://" },
      ], 3, "plain"),
      productGrid([
        { title: "Mensal", price: "R$ 290", url: "https://" },
        { title: "Trimestral", price: "R$ 790", url: "https://" },
      ], 2),
      map("Escolinha [Nome]"),
    ],
  },

  {
    id: "skate-school",
    name: "Escolinha de Skate / Surf",
    category: "Esportes",
    emoji: "🛹",
    description: "Y2K + radical + aulas + portfólio.",
    themePresetId: "y2k",
    suggestedTitle: "[Nome] School",
    suggestedBio: "🛹 Skate · Surf · Aulas · [Cidade]",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "tilt", titleFont: "bebas", entryAnimation: "scale" },
    blocks: [
      whatsapp("🛹 AULA EXPERIMENTAL", "5511999999999"),
      buttonGrid([
        { label: "Iniciante", url: "https://" },
        { label: "Intermediário", url: "https://" },
        { label: "Pro", url: "https://" },
        { label: "Kids", url: "https://" },
      ], 2, "plain"),
      imageCarousel([
        { imageUrl: img("1564507592333-c60657eea523") },
        { imageUrl: img("1571776421441-7b73d56b5d65") },
      ], "1:1"),
      productGrid([
        { title: "Aula avulsa", price: "R$ 90", url: "https://" },
        { title: "Pacote 4 aulas", price: "R$ 320", url: "https://" },
      ], 1),
    ],
  },

  {
    id: "boxing-mma",
    name: "Box / MMA / Lutas",
    category: "Esportes",
    emoji: "🥊",
    description: "Yellow-black + grit + horários + planos.",
    themePresetId: "yellow-black",
    suggestedTitle: "Academia [Nome]",
    suggestedBio: "🥊 Box · MMA · Muay Thai · [Cidade]",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("🥊 AULA EXPERIMENTAL", "5511999999999"),
      text("HORÁRIOS"),
      events([
        { title: "Box adulto", date: "2026-05-04", city: "Seg-Sex 06h, 12h, 19h" },
        { title: "Muay Thai", date: "2026-05-04", city: "Ter-Qui-Sáb 18h, 20h" },
        { title: "MMA", date: "2026-05-05", city: "Seg-Qua-Sex 21h" },
        { title: "Kids", date: "2026-05-04", city: "Sáb 10h" },
      ]),
      productGrid([
        { title: "Mensal", price: "R$ 280", url: "https://" },
        { title: "Trimestral", price: "R$ 750", url: "https://" },
      ], 2),
      map("Academia [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // INFLUENCIADOR (geral premium)
  // ═══════════════════════════════════════════════════════
  {
    id: "influencer-luxury",
    name: "Influenciador Premium",
    category: "Criador",
    emoji: "💎",
    description: "Glass + tilt 3D + parcerias + media kit.",
    themePresetId: "glass",
    suggestedTitle: "@seunick",
    suggestedBio: "💎 Influencer · Lifestyle · Brasil",
    suggestedCoverUrl: img("1483985988355-763728e1935b"),
    themeOverride: { buttonStyle: "glass", buttonHover: "tilt", titleFont: "instrument-serif", entryAnimation: "stagger" },
    blocks: [
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
        { label: "📌 Pinterest", url: "https://pinterest.com/" },
      ], 2),
      divider,
      text("✨ Parcerias selecionadas"),
      testimonials([
        { name: "Marca XYZ", role: "Campanha 2026", quote: "ROI superior à média do setor. Parceria que gera resultado." },
        { name: "Brand ABC", quote: "Engajamento real, audiência alinhada com nossa proposta." },
      ]),
      link("📋 Media Kit (PDF)", "https://"),
      link("💼 Falar com agência", "mailto:agencia@email.com"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // COPA DO MUNDO 2026
  // ═══════════════════════════════════════════════════════
  {
    id: "copa-fan",
    name: "Torcedor Copa 2026",
    category: "Esportes",
    emoji: "🇧🇷",
    description: "Verde-amarelo + countdown + bolão + grupo.",
    themePresetId: "pine",
    suggestedTitle: "VAI BRASIL! 🇧🇷",
    suggestedBio: "🏆 Copa do Mundo 2026 · Torcida [cidade]",
    suggestedCoverUrl: img("1551958219-acbc608c6377"),
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      countdown("⚽ FALTA POUCO PRA COPA", 200, "🏆 BORA HEXA!"),
      text("🇧🇷 RUMO AO HEXA!", "center", { fontFamily: "bebas", fontSize: 24 }),
      link("🎯 Entrar no bolão", "https://"),
      whatsapp("💬 Grupo da torcida", "5511999999999"),
      buttonGrid([
        { label: "📅 Tabela de jogos", url: "https://www.fifa.com/" },
        { label: "📺 Onde assistir", url: "https://" },
        { label: "🎫 Ingressos", url: "https://" },
        { label: "🏨 Hospedagem", url: "https://" },
      ], 2),
    ],
  },

  {
    id: "copa-bar-sportsbar",
    name: "Sports Bar Copa",
    category: "Esportes",
    emoji: "🍺",
    description: "Bordeaux + telão + reservas + cardápio.",
    themePresetId: "bordeaux",
    suggestedTitle: "[Nome] Sports Bar",
    suggestedBio: "🍺 Telão HD · Cervejas geladas · Copa 2026",
    suggestedCoverUrl: img("1543007630-9710e4a00a20"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      text("🇧🇷 TODOS OS JOGOS DO BRASIL AQUI", "center", { fontFamily: "bebas", fontSize: 18 }),
      whatsapp("🎫 RESERVAR MESA", "5511999999999"),
      link("📋 Cardápio", "https://"),
      events([
        { title: "Brasil x Argentina", date: "2026-06-12", city: "21h" },
        { title: "Brasil x França", date: "2026-06-19", city: "16h" },
      ]),
      productGrid([
        { title: "Combo Copa 4 pessoas", price: "R$ 189", url: "https://" },
        { title: "Mesa privativa 8 lugares", price: "R$ 590", url: "https://" },
      ], 1),
      map("[Sports Bar]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // POLÍTICA
  // ═══════════════════════════════════════════════════════
  {
    id: "politico-candidato",
    name: "Candidato Político",
    category: "Política",
    emoji: "🗳️",
    description: "Pine ou bordeaux + propostas + agenda + doação.",
    themePresetId: "pine",
    suggestedTitle: "[Nome] · [Cargo]",
    suggestedBio: "🗳️ Candidato a [cargo] · [Partido] · [Cidade]",
    suggestedCoverUrl: img("1529107386315-e1a2ed48a620"),
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Por uma cidade mais [valor].”", "center", { fontFamily: "playfair", fontSize: 16 }),
      buttonGrid([
        { label: "📋 Plano de governo", url: "https://" },
        { label: "📅 Agenda da campanha", url: "https://" },
        { label: "🤝 Ser voluntário", url: "https://" },
        { label: "💚 Doação de campanha", url: "https://" },
      ], 1),
      divider,
      text("Propostas em destaque"),
      faq([
        { q: "Saúde", a: "Ampliar UBSs e reduzir filas com mutirões." },
        { q: "Educação", a: "Tempo integral, merenda saudável, valorização docente." },
        { q: "Mobilidade", a: "Ciclovias, ônibus elétrico, integração metropolitana." },
        { q: "Segurança", a: "Iluminação, câmeras integradas, base comunitária." },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
        { label: "▶️ YouTube", url: "https://youtube.com/@" },
      ], 1),
    ],
  },

  {
    id: "politico-mandato",
    name: "Mandato (Vereador/Deputado)",
    category: "Política",
    emoji: "🏛️",
    description: "Bordeaux + projetos + prestação de contas + atendimento.",
    themePresetId: "bordeaux",
    suggestedTitle: "Ver. / Dep. [Nome]",
    suggestedBio: "🏛️ Mandato participativo · [Partido] · [Cidade]",
    themeOverride: { buttonStyle: "rounded", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      buttonGrid([
        { label: "📋 Projetos de lei", url: "https://" },
        { label: "📊 Prestação de contas", url: "https://" },
        { label: "📅 Agenda pública", url: "https://" },
        { label: "📺 Sessões na Câmara", url: "https://youtube.com/@" },
      ], 1),
      divider,
      text("Atendimento ao eleitor"),
      whatsapp("💬 Atendimento WhatsApp", "5511999999999"),
      form("Sugestão / denúncia", [
        { id: "name", label: "Nome", type: "text" },
        { id: "email", label: "E-mail", type: "email" },
        { id: "phone", label: "WhatsApp", type: "phone" },
        { id: "message", label: "Sua mensagem", type: "textarea", required: true },
      ]),
      link("📧 E-mail do gabinete", "mailto:gabinete@email.com"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // DISTRIBUIDORA / B2B
  // ═══════════════════════════════════════════════════════
  {
    id: "beverages-distributor",
    name: "Distribuidora de Bebidas",
    category: "Comércio",
    emoji: "🍻",
    description: "Yellow-black + bold + catálogo + revenda.",
    themePresetId: "yellow-black",
    suggestedTitle: "[Nome] Distribuidora",
    suggestedBio: "🍻 Distribuidora · Atacado e revenda",
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      whatsapp("🍻 PEDIDO ATACADO", "5511999999999"),
      buttonGrid([
        { label: "Cervejas", url: "https://" },
        { label: "Destilados", url: "https://" },
        { label: "Vinhos", url: "https://" },
        { label: "Refrigerantes", url: "https://" },
        { label: "Água", url: "https://" },
        { label: "Energéticos", url: "https://" },
      ], 2, "plain"),
      productGrid([
        { title: "Cerveja PILS Caixa", price: "R$ 89", imageUrl: img("1535958636474-b021ee887b13"), url: "https://" },
        { title: "Whisky 12 anos", price: "R$ 189", imageUrl: img("1582564286939-400a311013a6"), url: "https://" },
      ], 2),
      faq([
        { q: "Vocês fazem entrega?", a: "Sim, frota própria. Entregas em [região]." },
        { q: "Trabalham com revenda?", a: "Sim, condições especiais para revendedores." },
      ]),
      map("Distribuidora [Nome]"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LOJA DE ROUPA
  // ═══════════════════════════════════════════════════════
  {
    id: "clothing-store",
    name: "Loja de Roupa Feminina",
    category: "Moda & E-commerce",
    emoji: "👗",
    description: "Blush + serif + lookbook + categorias + tamanhos.",
    themePresetId: "blush",
    suggestedTitle: "[Marca]",
    suggestedBio: "👗 Moda feminina · [Cidade] · Online",
    suggestedCoverUrl: img("1490481651871-ab68de25d43d"),
    themeOverride: { buttonStyle: "pill", buttonHover: "tilt", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      link("🛍️ Comprar online", "https://"),
      whatsapp("💬 Atendimento personalizado", "5511999999999"),
      divider,
      text("✨ Coleção do mês"),
      imageCarousel([
        { imageUrl: img("1490481651871-ab68de25d43d") },
        { imageUrl: img("1469334031218-e382a71b716b") },
        { imageUrl: img("1496747611176-843222e1e57c") },
      ], "3:4"),
      buttonGrid([
        { label: "Vestidos", url: "https://" },
        { label: "Blusas", url: "https://" },
        { label: "Calças", url: "https://" },
        { label: "Acessórios", url: "https://" },
      ], 2),
      productCarousel([
        { title: "Vestido midi", price: "R$ 249", imageUrl: img("1572804013309-59a88b7e92f1"), url: "https://" },
        { title: "Blazer oversized", price: "R$ 369", imageUrl: img("1591047139829-d91aecb6caea"), url: "https://" },
      ]),
      newsletter("Sale antecipado", "Assinantes recebem promoções 24h antes."),
      map("Loja [Nome]"),
    ],
  },

  {
    id: "clothing-streetwear",
    name: "Streetwear / Urbano",
    category: "Moda & E-commerce",
    emoji: "🧢",
    description: "Cyber + bold + drops + sneaker.",
    themePresetId: "noir",
    suggestedTitle: "[Marca]",
    suggestedBio: "🧢 Streetwear · Drops limitados · BR",
    suggestedCoverUrl: img("1551028719-00167b16eac5"),
    themeOverride: { buttonStyle: "neubrutalism", buttonHover: "lift", titleFont: "bebas", entryAnimation: "stagger" },
    blocks: [
      countdown("🔥 NEXT DROP", 7),
      link("🛒 SHOP NOW", "https://"),
      productCarousel([
        { title: "Hoodie oversized", price: "R$ 249", imageUrl: img("1556821840-3a63f95609a7"), url: "https://" },
        { title: "Cap dad", price: "R$ 89", imageUrl: img("1521369909029-2afed882baee"), url: "https://" },
        { title: "Tee gráfica", price: "R$ 129", imageUrl: img("1521572163474-6864f9cf17ab"), url: "https://" },
      ]),
      buttonGrid([
        { label: "📸 Instagram", url: "https://instagram.com/" },
        { label: "🎵 TikTok", url: "https://tiktok.com/@" },
      ], 2, "plain"),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PROFESSOR / PALESTRANTE
  // ═══════════════════════════════════════════════════════
  {
    id: "professor-academic",
    name: "Professor(a) Universitário",
    category: "Educação",
    emoji: "🎓",
    description: "Minimal + serif + publicações + Lattes.",
    themePresetId: "minimal-white",
    suggestedTitle: "Prof(a). Dr(a). [Nome]",
    suggestedBio: "🎓 [Área] · [Universidade]",
    themeOverride: { buttonStyle: "underline", titleFont: "instrument-serif", buttonHover: "lift", entryAnimation: "fade" },
    blocks: [
      text("Pesquisa, ensino e extensão.", "center", { fontFamily: "instrument-serif", fontSize: 14 }),
      buttonGrid([
        { label: "Currículo Lattes", url: "https://" },
        { label: "ORCID", url: "https://" },
        { label: "Google Scholar", url: "https://" },
        { label: "ResearchGate", url: "https://" },
      ], 1, "plain"),
      divider,
      text("Publicações em destaque"),
      faq([
        { q: "Linhas de pesquisa", a: "[Linha 1]; [Linha 2]; [Linha 3]." },
        { q: "Disciplinas", a: "Lecion[o] [disciplina A] e [disciplina B]." },
        { q: "Orientações", a: "Aceito orientandos de [graduação/mestrado/doutorado]." },
      ]),
      link("📧 E-mail institucional", "mailto:"),
    ],
  },

  {
    id: "speaker-keynote",
    name: "Palestrante",
    category: "Educação",
    emoji: "🎤",
    description: "Glass + temas + cases + media kit + book.",
    themePresetId: "glass",
    suggestedTitle: "[Nome]",
    suggestedBio: "🎤 Palestrante · [Tema] · [Mais X eventos]",
    suggestedCoverUrl: img("1505373877841-8d25f7d46678"),
    themeOverride: { buttonStyle: "shadow", buttonHover: "lift", titleFont: "playfair", entryAnimation: "fade" },
    blocks: [
      text("“Transformando ideias em ação.”", "center", { fontFamily: "playfair", fontSize: 14 }),
      link("📅 Contratar palestra", "https://"),
      link("📋 Media Kit (PDF)", "https://"),
      divider,
      text("Temas mais procurados"),
      buttonGrid([
        { label: "Liderança", url: "https://" },
        { label: "Inovação", url: "https://" },
        { label: "Vendas", url: "https://" },
        { label: "Mindset", url: "https://" },
      ], 2, "plain"),
      video("dQw4w9WgXcQ"),
      testimonials([
        { name: "Empresa X", role: "Convenção 2025", quote: "Fechamos a convenção com chave de ouro. Engajou 800 pessoas." },
        { name: "Universidade Y", quote: "Conteúdo de altíssimo nível. Já contratamos pra 2026." },
      ]),
      buttonGrid([
        { label: "💼 LinkedIn", url: "https://linkedin.com/in/" },
        { label: "📸 Instagram", url: "https://instagram.com/" },
      ], 2),
      form("Solicitar palestra", [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "company", label: "Empresa", type: "text" },
        { id: "email", label: "E-mail", type: "email", required: true },
        { id: "phone", label: "WhatsApp", type: "phone" },
        { id: "date", label: "Data do evento", type: "text" },
        { id: "details", label: "Detalhes", type: "textarea" },
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EM BRANCO
  // ═══════════════════════════════════════════════════════
  {
    id: "blank",
    name: "Em branco",
    category: "Do zero",
    emoji: "✍️",
    description: "Começa do zero, sem nada pré-preenchido.",
    themePresetId: "minimal-white",
    suggestedTitle: "Meu link",
    suggestedBio: "",
    blocks: [],
  },
];

export function getTemplateById(id: string): PageTemplate | undefined {
  return pageTemplates.find((t) => t.id === id);
}

export function getTemplateTheme(template: PageTemplate): PageTheme {
  const preset =
    getPresetById(template.themePresetId) ??
    themePresets.find((p) => p.id === "minimal-white")!;
  if (!template.themeOverride) return preset.theme;
  return { ...preset.theme, ...template.themeOverride };
}

export function getTemplateCategories(): string[] {
  const set = new Set<string>();
  pageTemplates.forEach((t) => set.add(t.category));
  return Array.from(set);
}
