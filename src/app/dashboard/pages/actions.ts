"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  page,
  block,
  templateStat,
  userTemplate,
  type BlockData,
  type BlockType,
  type PageIntegrations,
  type PageTheme,
} from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { getPresetById } from "@/lib/themes";
import { getPaletteById } from "@/lib/palettes";
import { getTemplateById, getTemplateTheme } from "@/lib/templates";
import { validatePageSlug, generateUniquePageSlug } from "@/lib/slug";
import { sql, count } from "drizzle-orm";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { isUnlimited } from "@/lib/plans";
import { resolvePageAccess } from "@/lib/collab-auth";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

/** Carrega página garantindo que o usuário é dono — usado em ações que devem ser apenas do dono. */
async function loadUserPage(pageId: string, userId: string) {
  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, userId)));
  if (!p) throw new Error("Página não encontrada");
  return p;
}

/** Carrega página se o usuário é dono OU colaborador com permissão de edição. */
async function loadEditablePage(pageId: string, userId: string) {
  const access = await resolvePageAccess(pageId, userId);
  if (!access || !access.canEdit) throw new Error("Página não encontrada");
  return access.page;
}

/** Retorna bloco + pageId se o usuário pode editá-lo (dono ou colaborador editor). */
async function loadEditableBlock(blockId: string, userId: string) {
  const [b] = await db
    .select({ id: block.id, pageId: block.pageId })
    .from(block)
    .where(eq(block.id, blockId))
    .limit(1);
  if (!b) return null;
  const access = await resolvePageAccess(b.pageId, userId);
  if (!access || !access.canEdit) return null;
  return { blockId: b.id, pageId: b.pageId };
}

const createPageSchema = z.object({
  slug: z.string(),
  title: z.string().min(1).max(80),
});

export async function createPage(formData: FormData) {
  const user = await requireUser();
  const parsed = createPageSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  // ── Limite de páginas ──
  const limits = await getUserPlanLimits(user.id);
  if (!isUnlimited(limits.pages)) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(page)
      .where(eq(page.userId, user.id));
    if (total >= limits.pages) {
      return {
        error: `Seu plano permite até ${limits.pages} página${limits.pages > 1 ? "s" : ""}. Faça upgrade para criar mais.`,
      };
    }
  }

  const validation = await validatePageSlug(parsed.data.slug);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const [created] = await db
    .insert(page)
    .values({
      userId: user.id,
      slug: validation.slug,
      title: parsed.data.title,
      published: true,
    })
    .returning();

  revalidatePath("/dashboard");
  redirect(`/dashboard/pages/${created.id}/edit`);
}

const createFromTemplateSchema = z.object({
  slug: z.string(),
  title: z.string().min(1).max(80),
  templateId: z.string().min(1),
});

export async function createPageFromTemplate(formData: FormData) {
  const user = await requireUser();
  const parsed = createFromTemplateSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    templateId: String(formData.get("templateId") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  // ── Limite de páginas ──
  const limits = await getUserPlanLimits(user.id);
  if (!isUnlimited(limits.pages)) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(page)
      .where(eq(page.userId, user.id));
    if (total >= limits.pages) {
      return {
        error: `Seu plano permite até ${limits.pages} página${limits.pages > 1 ? "s" : ""}. Faça upgrade para criar mais.`,
      };
    }
  }

  const templateId = parsed.data.templateId;
  const isUserTemplate = templateId.startsWith("user:");

  let theme: PageTheme;
  let blocks: { type: BlockType; data: BlockData }[];
  let suggestedBio: string | null;
  let suggestedCoverUrl: string | null = null;

  if (isUserTemplate) {
    const [tpl] = await db
      .select()
      .from(userTemplate)
      .where(eq(userTemplate.id, templateId.slice(5)))
      .limit(1);
    if (!tpl || !tpl.published) {
      return { error: "Modelo não encontrado." };
    }
    theme = tpl.theme;
    blocks = tpl.blocks;
    suggestedBio = tpl.suggestedBio ?? null;
  } else {
    const tpl = getTemplateById(templateId);
    if (!tpl) return { error: "Modelo não encontrado." };
    theme = getTemplateTheme(tpl);
    blocks = tpl.blocks;
    suggestedBio = tpl.suggestedBio || null;
    suggestedCoverUrl = tpl.suggestedCoverUrl ?? null;
  }

  const validation = await validatePageSlug(parsed.data.slug);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const [created] = await db
    .insert(page)
    .values({
      userId: user.id,
      slug: validation.slug,
      title: parsed.data.title,
      description: suggestedBio,
      coverUrl: suggestedCoverUrl,
      theme,
      published: true,
    })
    .returning();

  if (blocks.length > 0) {
    await db.insert(block).values(
      blocks.map((b, i) => ({
        pageId: created.id,
        type: b.type,
        data: b.data,
        style: "style" in b && b.style ? b.style : {},
        position: i,
      }))
    );
  }

  // Incrementa usageCount
  if (isUserTemplate) {
    await db
      .update(userTemplate)
      .set({ usageCount: sql`${userTemplate.usageCount} + 1` })
      .where(eq(userTemplate.id, templateId.slice(5)));
  } else {
    await db
      .insert(templateStat)
      .values({ templateId, usageCount: 1 })
      .onConflictDoUpdate({
        target: templateStat.templateId,
        set: {
          usageCount: sql`${templateStat.usageCount} + 1`,
          updatedAt: new Date(),
        },
      });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pages/new");
  redirect(`/dashboard/pages/${created.id}/edit`);
}

// ============== CRIAR PÁGINA COM QUIZ ==============

const createWithQuizSchema = z.object({
  templateId: z.string().optional(),
  category: z.enum(["creator", "business", "personal"]),
  themeId: z.string().optional(),
  name: z.string().min(1).max(80),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  platforms: z.array(
    z.object({ id: z.string(), label: z.string(), url: z.string().url() })
  ),
});

export async function createPageWithQuiz(
  raw: z.infer<typeof createWithQuizSchema>
) {
  const user = await requireUser();
  const parsed = createWithQuizSchema.safeParse(raw);
  if (!parsed.success) return { error: "Dados inválidos." };

  const limits = await getUserPlanLimits(user.id);
  if (!isUnlimited(limits.pages)) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(page)
      .where(eq(page.userId, user.id));
    if (total >= limits.pages) {
      return {
        error: `Seu plano permite até ${limits.pages} página${limits.pages > 1 ? "s" : ""}. Faça upgrade.`,
      };
    }
  }

  const { templateId, name, bio, avatarUrl, platforms, themeId } = parsed.data;

  let theme: PageTheme;
  let templateBlocks: { type: BlockType; data: BlockData; style?: import("@/lib/db/schema").BlockStyle }[] = [];
  let templateCoverUrl: string | null = null;

  if (templateId) {
    const isUser = templateId.startsWith("user:");
    if (isUser) {
      const [tpl] = await db
        .select()
        .from(userTemplate)
        .where(eq(userTemplate.id, templateId.slice(5)))
        .limit(1);
      if (!tpl || !tpl.published) return { error: "Modelo não encontrado." };
      theme = tpl.theme;
      templateBlocks = tpl.blocks;
    } else {
      const tpl = getTemplateById(templateId);
      if (!tpl) return { error: "Modelo não encontrado." };
      theme = getTemplateTheme(tpl);
      templateBlocks = tpl.blocks;
      templateCoverUrl = tpl.suggestedCoverUrl ?? null;
    }
  } else {
    const preset = themeId ? getPresetById(themeId) : null;
    theme = preset?.theme ?? {
      preset: "minimal-white",
      background: { type: "solid", color: "#ffffff" },
      foreground: "#0f172a",
      mutedForeground: "#64748b",
      accent: "#6366f1",
      accentForeground: "#ffffff",
      font: "inter",
      titleFont: "inter",
      buttonStyle: "rounded",
      avatarShape: "circle",
      spacing: "normal",
      effect: "none",
    };
  }

  const slug = await generateUniquePageSlug(name);

  const [created] = await db
    .insert(page)
    .values({
      userId: user.id,
      slug,
      title: name,
      description: bio ?? null,
      avatarUrl: avatarUrl ?? null,
      coverUrl: templateCoverUrl,
      theme,
      published: true,
    })
    .returning();

  // Platform link blocks come first, then template blocks
  const platformBlockValues = platforms.map((p, i) => ({
    pageId: created.id,
    type: "link" as const,
    data: { kind: "link" as const, label: p.label, url: p.url } satisfies BlockData,
    position: i,
  }));

  const templateBlockValues = templateBlocks.map((b, i) => ({
    pageId: created.id,
    type: b.type,
    data: b.data,
    style: b.style ?? {},
    position: platforms.length + i,
  }));

  const allBlocks = [...platformBlockValues, ...templateBlockValues];
  if (allBlocks.length > 0) {
    await db.insert(block).values(allBlocks);
  }

  // Increment template usage if from template
  if (templateId && !templateId.startsWith("user:")) {
    await db
      .insert(templateStat)
      .values({ templateId, usageCount: 1 })
      .onConflictDoUpdate({
        target: templateStat.templateId,
        set: { usageCount: sql`${templateStat.usageCount} + 1`, updatedAt: new Date() },
      });
  }

  revalidatePath("/dashboard");
  return { ok: true as const, pageId: created.id, slug };
}

// ============== PUBLICAR COMO TEMPLATE ==============

const publishTemplateSchema = z.object({
  pageId: z.string().min(1),
  name: z.string().min(2).max(60),
  category: z.string().min(1),
  emoji: z.string().max(4).optional().nullable(),
  description: z.string().max(120).optional().nullable(),
});

const MAX_TEMPLATES_PER_USER = 3;
const BANNED_WORDS = [
  "xxx", "porn", "porno", "nude", "sexo explicito",
  "hack", "pirateado", "crack",
];

function containsBannedContent(text: string): boolean {
  const normalized = text.toLowerCase();
  return BANNED_WORDS.some((w) => normalized.includes(w));
}

export async function publishAsTemplate(raw: {
  pageId: string;
  name: string;
  category: string;
  emoji?: string;
  description?: string;
}) {
  const user = await requireUser();
  const parsed = publishTemplateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  // Moderação básica de conteúdo
  const combined = `${parsed.data.name} ${parsed.data.description ?? ""}`;
  if (containsBannedContent(combined)) {
    return {
      error: "Nome ou descrição contém termos não permitidos.",
    };
  }

  // Limite por usuário
  const existing = await db
    .select({ id: userTemplate.id })
    .from(userTemplate)
    .where(eq(userTemplate.userId, user.id));
  if (existing.length >= MAX_TEMPLATES_PER_USER) {
    return {
      error: `Máximo de ${MAX_TEMPLATES_PER_USER} modelos publicados por usuário. Delete um existente antes.`,
    };
  }

  const sourcePage = await loadUserPage(parsed.data.pageId, user.id);
  const sourceBlocks = await db
    .select()
    .from(block)
    .where(eq(block.pageId, sourcePage.id))
    .orderBy(block.position);

  if (sourceBlocks.length === 0) {
    return {
      error: "Página sem blocos não pode virar modelo. Adiciona pelo menos um.",
    };
  }

  await db.insert(userTemplate).values({
    userId: user.id,
    name: parsed.data.name,
    category: parsed.data.category,
    emoji: parsed.data.emoji ?? null,
    description: parsed.data.description ?? null,
    theme: sourcePage.theme,
    blocks: sourceBlocks.map((b) => ({
      type: b.type,
      data: b.data,
    })),
    suggestedTitle: sourcePage.title,
    suggestedBio: sourcePage.description,
    published: true,
  });

  revalidatePath("/dashboard/pages/new");
  return { ok: true as const };
}

const customDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .max(253)
    .regex(
      /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
      "Formato inválido — use apenas domínio (ex: meusite.com.br, sem http://)"
    )
    .optional()
    .or(z.literal("")),
});

export async function updateCustomDomain(
  pageId: string,
  rawDomain: string
) {
  const user = await requireUser();
  const existing = await loadUserPage(pageId, user.id);

  const parsed = customDomainSchema.safeParse({
    domain: rawDomain.toLowerCase().trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const domain = parsed.data.domain || null;

  // ── Limite de domínios personalizados ──
  if (domain) {
    const limits = await getUserPlanLimits(user.id);
    if (limits.customDomains === 0) {
      return { error: "Seu plano não inclui domínio próprio. Faça upgrade para usar." };
    }
    if (!isUnlimited(limits.customDomains)) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(page)
        .where(and(eq(page.userId, user.id), sql`${page.customDomain} IS NOT NULL`));
      // Só conta se estiver trocando de null para um domínio
      const isNew = !existing.customDomain;
      if (isNew && total >= limits.customDomains) {
        return { error: `Seu plano permite até ${limits.customDomains} domínio próprio. Faça upgrade para adicionar mais.` };
      }
    }
  }

  // Checa se já existe em outra página
  if (domain) {
    const [conflict] = await db
      .select({ id: page.id })
      .from(page)
      .where(eq(page.customDomain, domain))
      .limit(1);
    if (conflict && conflict.id !== pageId) {
      return { error: "Este domínio já está vinculado a outra página." };
    }
  }

  await db
    .update(page)
    .set({ customDomain: domain, updatedAt: new Date() })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${existing.slug}`);
  return { ok: true as const };
}

const urlOrEmpty = z.string().url().optional().nullable().or(z.literal(""));

const updatePageSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(200).optional().nullable(),
  avatarUrl: urlOrEmpty,
  coverUrl: urlOrEmpty,
  published: z.boolean().optional(),
  seoTitle: z.string().max(60).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  ogImageUrl: urlOrEmpty,
});

export async function updatePage(pageId: string, formData: FormData) {
  const user = await requireUser();
  const existing = await loadEditablePage(pageId, user.id);

  const rawAvatar = formData.get("avatarUrl");
  const rawCover = formData.get("coverUrl");
  const rawOgImage = formData.get("ogImageUrl");
  const parsed = updatePageSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: formData.get("description")
      ? String(formData.get("description"))
      : null,
    avatarUrl: rawAvatar ? String(rawAvatar).trim() : null,
    coverUrl: rawCover ? String(rawCover).trim() : null,
    published: formData.get("published") === "on",
    seoTitle: formData.get("seoTitle") ? String(formData.get("seoTitle")).trim() : null,
    seoDescription: formData.get("seoDescription")
      ? String(formData.get("seoDescription")).trim()
      : null,
    ogImageUrl: rawOgImage ? String(rawOgImage).trim() : null,
  });
  if (!parsed.success) return { error: "Dados inválidos" };

  const nullIfEmpty = (v: string | null | undefined) =>
    v && v.length > 0 ? v : null;

  await db
    .update(page)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      avatarUrl: nullIfEmpty(parsed.data.avatarUrl),
      coverUrl: nullIfEmpty(parsed.data.coverUrl),
      published: parsed.data.published ?? false,
      seoTitle: nullIfEmpty(parsed.data.seoTitle),
      seoDescription: nullIfEmpty(parsed.data.seoDescription),
      ogImageUrl: nullIfEmpty(parsed.data.ogImageUrl),
      updatedAt: new Date(),
    })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath("/dashboard");
  revalidatePath(`/${existing.slug}`);
  revalidatePath("/[slug]", "page");
  return { ok: true };
}

export async function deletePage(pageId: string) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);
  await db.delete(page).where(eq(page.id, pageId));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ============== BLOCKS ==============

export async function addBlock(pageId: string, type: BlockType) {
  const user = await requireUser();
  const pageRow = await loadEditablePage(pageId, user.id);

  // ── Limite de blocos por página (baseado no plano do DONO) ──
  const limits = await getUserPlanLimits(pageRow.userId);
  if (!isUnlimited(limits.blocksPerPage)) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(block)
      .where(eq(block.pageId, pageId));
    if (total >= limits.blocksPerPage) {
      return {
        error: `Seu plano permite até ${limits.blocksPerPage} blocos por página. Faça upgrade para adicionar mais.`,
      };
    }
  }

  const [row] = await db
    .select({ maxPos: max(block.position) })
    .from(block)
    .where(eq(block.pageId, pageId));
  const nextPos = (row?.maxPos ?? -1) + 1;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);

  const defaultData: Record<BlockType, BlockData> = {
    link: { kind: "link", label: "Meu link", url: "https://" },
    text: { kind: "text", content: "Escreva aqui...", align: "center" },
    image: { kind: "image", url: "", alt: "" },
    video: { kind: "video", provider: "youtube", videoId: "" },
    divider: { kind: "divider" },
    spacer: { kind: "spacer", height: 40 },
    newsletter: {
      kind: "newsletter",
      title: "Assine a newsletter",
      description: "Receba novidades semanais direto no seu email.",
      buttonLabel: "Assinar",
      placeholder: "seu@email.com",
      provider: "internal",
    },
    whatsapp: {
      kind: "whatsapp",
      label: "💬 Falar no WhatsApp",
      phone: "5511999999999",
      message: "Oi! Vim da sua bio.",
    },
    music: {
      kind: "music",
      provider: "spotify",
      url: "https://open.spotify.com/",
    },
    "social-embed": {
      kind: "social-embed",
      provider: "instagram",
      url: "",
    },
    form: {
      kind: "form",
      title: "Entre em contato",
      submitLabel: "Enviar",
      successMessage: "Obrigado! Retornaremos em breve.",
      fields: [
        { id: "name", label: "Nome", type: "text", required: true },
        { id: "email", label: "Email", type: "email", required: true },
        { id: "message", label: "Mensagem", type: "textarea" },
      ],
    },
    countdown: {
      kind: "countdown",
      title: "Falta pouco",
      targetDate: targetDate.toISOString(),
      finishedMessage: "Chegou a hora!",
    },
    faq: {
      kind: "faq",
      items: [
        { q: "Como funciona?", a: "Responda aqui." },
        { q: "Qual o preço?", a: "Responda aqui." },
      ],
    },
    testimonials: {
      kind: "testimonials",
      items: [
        {
          name: "Maria Silva",
          role: "Cliente",
          quote: "Esse é o melhor serviço que já usei!",
        },
      ],
    },
    map: {
      kind: "map",
      query: "Avenida Paulista, São Paulo",
      label: "Onde estamos",
    },
    events: {
      kind: "events",
      items: [
        {
          title: "Meu próximo show",
          date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          city: "São Paulo",
        },
      ],
    },
    products: {
      kind: "products",
      items: [
        { title: "Produto 1", price: "R$ 99", imageUrl: "" },
        { title: "Produto 2", price: "R$ 149", imageUrl: "" },
      ],
    },
    grid: {
      kind: "grid",
      columns: 2,
      items: [
        { title: "Item 1", imageUrl: "" },
        { title: "Item 2", imageUrl: "" },
        { title: "Item 3", imageUrl: "" },
        { title: "Item 4", imageUrl: "" },
      ],
    },
    "image-carousel": {
      kind: "image-carousel",
      items: [
        { imageUrl: "", caption: "Foto 1" },
        { imageUrl: "", caption: "Foto 2" },
        { imageUrl: "", caption: "Foto 3" },
      ],
    },
    "product-grid": {
      kind: "product-grid",
      columns: 2,
      items: [
        { title: "Produto 1", price: "R$ 99", imageUrl: "" },
        { title: "Produto 2", price: "R$ 149", imageUrl: "" },
        { title: "Produto 3", price: "R$ 199", imageUrl: "" },
        { title: "Produto 4", price: "R$ 249", imageUrl: "" },
      ],
    },
    "product-carousel": {
      kind: "product-carousel",
      items: [
        { title: "Produto 1", price: "R$ 99", imageUrl: "" },
        { title: "Produto 2", price: "R$ 149", imageUrl: "" },
        { title: "Produto 3", price: "R$ 199", imageUrl: "" },
      ],
    },
    "button-grid": {
      kind: "button-grid",
      columns: 3,
      items: [
        { label: "", url: "https://wa.me/", icon: "whatsapp" },
        { label: "", url: "https://instagram.com/", icon: "instagram" },
        { label: "", url: "https://twitter.com/", icon: "twitter" },
        { label: "", url: "https://youtube.com/", icon: "youtube" },
        { label: "", url: "https://facebook.com/", icon: "facebook" },
        { label: "", url: "https://github.com/", icon: "github" },
      ],
    },
  };

  await db.insert(block).values({
    pageId,
    type,
    data: defaultData[type],
    position: nextPos,
  });

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
}

export async function updateBlock(
  blockId: string,
  data: BlockData
) {
  const user = await requireUser();
  const b = await loadEditableBlock(blockId, user.id);
  if (!b) return;

  await db
    .update(block)
    .set({ data, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
}

export async function updateBlockStyle(
  blockId: string,
  style: import("@/lib/db/schema").BlockStyle
) {
  const user = await requireUser();
  const b = await loadEditableBlock(blockId, user.id);
  if (!b) return;

  // Remove propriedades vazias/undefined antes de salvar
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(style)) {
    if (v !== undefined && v !== "" && v !== null) cleaned[k] = v;
  }

  await db
    .update(block)
    .set({ style: cleaned as import("@/lib/db/schema").BlockStyle, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
}

export async function toggleBlockVisible(blockId: string, visible: boolean) {
  const user = await requireUser();
  const b = await loadEditableBlock(blockId, user.id);
  if (!b) return;

  await db
    .update(block)
    .set({ visible, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
}

export async function toggleBlockGoal(blockId: string, isGoal: boolean) {
  const user = await requireUser();
  const b = await loadEditableBlock(blockId, user.id);
  if (!b) return;

  await db
    .update(block)
    .set({ isGoal, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
  revalidatePath(`/dashboard/pages/${b.pageId}/analytics`);
}

export async function deleteBlock(blockId: string) {
  const user = await requireUser();
  const b = await loadEditableBlock(blockId, user.id);
  // Idempotente: se bloco já não existe ou sem acesso, sai em silêncio
  if (!b) return;

  await db.delete(block).where(eq(block.id, blockId));
  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
}

const integrationsSchema = z.object({
  metaPixelId: z.string().trim().max(32).optional(),
  gaId: z.string().trim().max(32).optional(),
  gtmId: z.string().trim().max(32).optional(),
  tiktokPixelId: z.string().trim().max(32).optional(),
});

const advancedSchema = z.object({
  customCss: z.string().max(20000).optional().nullable(),
  customJs: z.string().max(20000).optional().nullable(),
});

export async function updateAdvanced(
  pageId: string,
  input: { customCss?: string; customJs?: string }
) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);
  const parsed = advancedSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const limits = await getUserPlanLimits(user.id);
  if (parsed.data.customCss && !limits.customCss) {
    return { error: "CSS personalizado está disponível a partir do plano Pro." };
  }
  if (parsed.data.customJs && !limits.customJs) {
    return { error: "JS personalizado está disponível apenas no plano Business." };
  }

  await db
    .update(page)
    .set({
      customCss: parsed.data.customCss || null,
      customJs: parsed.data.customJs || null,
      updatedAt: new Date(),
    })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { ok: true as const };
}

export async function updateIntegrations(
  pageId: string,
  input: PageIntegrations
) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);
  const parsed = integrationsSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const limits = await getUserPlanLimits(user.id);
  const hasPixel = parsed.data.metaPixelId || parsed.data.gaId || parsed.data.gtmId || parsed.data.tiktokPixelId;
  if (hasPixel && !limits.pixelIntegrations) {
    return { error: "Integrações de pixels estão disponíveis a partir do plano Pro." };
  }

  // Remove campos vazios
  const cleaned: PageIntegrations = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v && typeof v === "string" && v.trim()) {
      (cleaned as Record<string, string>)[k] = v.trim();
    }
  }

  await db
    .update(page)
    .set({ integrations: cleaned, updatedAt: new Date() })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { ok: true as const };
}

export async function applyThemePreset(pageId: string, presetId: string) {
  const user = await requireUser();
  const existing = await loadEditablePage(pageId, user.id);
  const preset = getPresetById(presetId);
  if (!preset) throw new Error("Tema não encontrado");
  await db
    .update(page)
    .set({ theme: preset.theme, updatedAt: new Date() })
    .where(eq(page.id, pageId));
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${existing.slug}`);
}

export async function applyColorPalette(pageId: string, paletteId: string) {
  const user = await requireUser();
  const existing = await loadEditablePage(pageId, user.id);
  const palette = getPaletteById(paletteId);
  if (!palette) throw new Error("Paleta não encontrada");

  // Aplica só as cores, mantém resto do tema (fontes, botões, efeitos, etc)
  const nextTheme: PageTheme = {
    ...existing.theme,
    preset: undefined, // perdeu identidade de preset
    background: { type: "solid", color: palette.background },
    foreground: palette.foreground,
    mutedForeground: palette.mutedForeground,
    accent: palette.accent,
    accentForeground: palette.accentForeground,
  };

  await db
    .update(page)
    .set({ theme: nextTheme, updatedAt: new Date() })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${existing.slug}`);
}

export async function updateTheme(pageId: string, theme: PageTheme) {
  const user = await requireUser();
  const existing = await loadEditablePage(pageId, user.id);
  await db
    .update(page)
    .set({ theme, updatedAt: new Date() })
    .where(eq(page.id, pageId));
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${existing.slug}`);
}

export async function reorderBlocks(pageId: string, orderedIds: string[]) {
  const user = await requireUser();
  await loadEditablePage(pageId, user.id);

  // Valida que todos os blocos pertencem à página
  const rows = await db
    .select({ id: block.id })
    .from(block)
    .where(eq(block.pageId, pageId));
  const validIds = new Set(rows.map((r) => r.id));
  const filtered = orderedIds.filter((id) => validIds.has(id));

  await db.transaction(async (tx) => {
    for (let i = 0; i < filtered.length; i++) {
      await tx
        .update(block)
        .set({ position: i })
        .where(eq(block.id, filtered[i]!));
    }
  });

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
}

export async function moveBlock(blockId: string, direction: "up" | "down") {
  const user = await requireUser();
  const access = await loadEditableBlock(blockId, user.id);
  if (!access) throw new Error("Bloco não encontrado");
  const [current] = await db
    .select({
      id: block.id,
      pageId: block.pageId,
      position: block.position,
    })
    .from(block)
    .where(eq(block.id, blockId));
  if (!current) throw new Error("Bloco não encontrado");

  const siblings = await db
    .select()
    .from(block)
    .where(eq(block.pageId, current.pageId))
    .orderBy(block.position);

  const idx = siblings.findIndex((b) => b.id === blockId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;

  const a = siblings[idx];
  const b = siblings[swapIdx];

  await db.transaction(async (tx) => {
    await tx
      .update(block)
      .set({ position: b.position })
      .where(eq(block.id, a.id));
    await tx
      .update(block)
      .set({ position: a.position })
      .where(eq(block.id, b.id));
  });

  revalidatePath(`/dashboard/pages/${current.pageId}/edit`);
}
