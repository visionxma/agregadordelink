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
  columns: 1 | 2 | 3 = 2,
  style: "filled" | "plain" = "filled"
): TemplateBlock => ({
  type: "button-grid",
  data: { kind: "button-grid", columns, style, items },
});

const productGrid = (
  items: { title: string; price?: string; imageUrl?: string; url?: string }[],
  columns: 1 | 2 | 3 = 2
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
  columns: 1 | 2 | 3 = 2
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
