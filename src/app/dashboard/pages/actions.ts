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
import { getTemplateById, getTemplateTheme } from "@/lib/templates";
import { validatePageSlug } from "@/lib/slug";
import { sql } from "drizzle-orm";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

async function loadUserPage(pageId: string, userId: string) {
  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, userId)));
  if (!p) throw new Error("Página não encontrada");
  return p;
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

  const templateId = parsed.data.templateId;
  const isUserTemplate = templateId.startsWith("user:");

  let theme: PageTheme;
  let blocks: { type: BlockType; data: BlockData }[];
  let suggestedBio: string | null;

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

// ============== PUBLICAR COMO TEMPLATE ==============

const publishTemplateSchema = z.object({
  pageId: z.string().min(1),
  name: z.string().min(2).max(60),
  category: z.string().min(1),
  emoji: z.string().max(4).optional().nullable(),
  description: z.string().max(120).optional().nullable(),
});

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

const updatePageSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(200).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  published: z.boolean().optional(),
});

export async function updatePage(pageId: string, formData: FormData) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);

  const rawAvatar = formData.get("avatarUrl");
  const rawCover = formData.get("coverUrl");
  const parsed = updatePageSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    description: formData.get("description")
      ? String(formData.get("description"))
      : null,
    avatarUrl: rawAvatar ? String(rawAvatar).trim() : null,
    coverUrl: rawCover ? String(rawCover).trim() : null,
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: "Dados inválidos" };

  await db
    .update(page)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      avatarUrl:
        parsed.data.avatarUrl && parsed.data.avatarUrl.length > 0
          ? parsed.data.avatarUrl
          : null,
      coverUrl:
        parsed.data.coverUrl && parsed.data.coverUrl.length > 0
          ? parsed.data.coverUrl
          : null,
      published: parsed.data.published ?? false,
      updatedAt: new Date(),
    })
    .where(eq(page.id, pageId));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath("/dashboard");
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
  await loadUserPage(pageId, user.id);

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
  const [b] = await db
    .select({ id: block.id, pageId: block.pageId, userId: page.userId })
    .from(block)
    .innerJoin(page, eq(page.id, block.pageId))
    .where(eq(block.id, blockId));
  if (!b || b.userId !== user.id) throw new Error("Bloco não encontrado");

  await db
    .update(block)
    .set({ data, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
}

export async function toggleBlockGoal(blockId: string, isGoal: boolean) {
  const user = await requireUser();
  const [b] = await db
    .select({ id: block.id, pageId: block.pageId, userId: page.userId })
    .from(block)
    .innerJoin(page, eq(page.id, block.pageId))
    .where(eq(block.id, blockId));
  if (!b || b.userId !== user.id) throw new Error("Bloco não encontrado");

  await db
    .update(block)
    .set({ isGoal, updatedAt: new Date() })
    .where(eq(block.id, blockId));

  revalidatePath(`/dashboard/pages/${b.pageId}/edit`);
  revalidatePath(`/dashboard/pages/${b.pageId}/analytics`);
}

export async function deleteBlock(blockId: string) {
  const user = await requireUser();
  const [b] = await db
    .select({ id: block.id, pageId: block.pageId, userId: page.userId })
    .from(block)
    .innerJoin(page, eq(page.id, block.pageId))
    .where(eq(block.id, blockId));
  if (!b || b.userId !== user.id) throw new Error("Bloco não encontrado");

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
  await loadUserPage(pageId, user.id);
  const preset = getPresetById(presetId);
  if (!preset) throw new Error("Tema não encontrado");
  await db
    .update(page)
    .set({ theme: preset.theme, updatedAt: new Date() })
    .where(eq(page.id, pageId));
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
}

export async function updateTheme(pageId: string, theme: PageTheme) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);
  await db
    .update(page)
    .set({ theme, updatedAt: new Date() })
    .where(eq(page.id, pageId));
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
}

export async function reorderBlocks(pageId: string, orderedIds: string[]) {
  const user = await requireUser();
  await loadUserPage(pageId, user.id);

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
  const [current] = await db
    .select({
      id: block.id,
      pageId: block.pageId,
      position: block.position,
      userId: page.userId,
    })
    .from(block)
    .innerJoin(page, eq(page.id, block.pageId))
    .where(eq(block.id, blockId));
  if (!current || current.userId !== user.id) {
    throw new Error("Bloco não encontrado");
  }

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
