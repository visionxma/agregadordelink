import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { templateStat, userTemplate } from "@/lib/db/schema";
import {
  pageTemplates,
  type PageTemplate,
} from "@/lib/templates";
import { getPresetById, themePresets } from "@/lib/themes";

export type GalleryTemplate = PageTemplate & {
  usageCount: number;
  source: "system" | "user";
  authorName?: string | null;
};

/** Carrega templates do sistema com uso real + user templates públicos, tudo merged. */
export async function loadGalleryTemplates(): Promise<GalleryTemplate[]> {
  // 1. Stats dos templates do sistema
  const stats = await db.select().from(templateStat);
  const statsMap = new Map(stats.map((s) => [s.templateId, s.usageCount]));

  const systemTemplates: GalleryTemplate[] = pageTemplates
    .filter((t) => t.id !== "blank")
    .map((t) => ({
      ...t,
      usageCount: statsMap.get(t.id) ?? 0,
      source: "system",
    }));

  // 2. User templates públicos
  const publicUserTpls = await db
    .select()
    .from(userTemplate)
    .where(eq(userTemplate.published, true))
    .orderBy(desc(userTemplate.usageCount));

  const fallbackPreset =
    themePresets.find((p) => p.id === "minimal-white") ?? themePresets[0];

  const userTemplatesMapped: GalleryTemplate[] = publicUserTpls.map((u) => {
    // Descobrir qual preset mais se aproxima (se theme tiver preset)
    const presetId = u.theme.preset;
    const preset =
      (presetId ? getPresetById(presetId) : undefined) ?? fallbackPreset;
    return {
      id: `user:${u.id}`,
      name: u.name,
      category: u.category,
      emoji: u.emoji ?? "✨",
      description: u.description ?? "Modelo publicado pela comunidade.",
      themePresetId: preset.id,
      suggestedTitle: u.suggestedTitle ?? u.name,
      suggestedBio: u.suggestedBio ?? "",
      blocks: u.blocks,
      usageCount: u.usageCount,
      source: "user",
    };
  });

  return [...systemTemplates, ...userTemplatesMapped];
}

export function getBlankTemplate(): PageTemplate {
  return pageTemplates.find((t) => t.id === "blank")!;
}
