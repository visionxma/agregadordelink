"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  block,
  page,
  type BlockData,
  type PageTheme,
} from "@/lib/db/schema";
import { getPresetById, themePresets } from "@/lib/themes";
import { generateUniquePageSlug } from "@/lib/slug";

const onboardingSchema = z.object({
  category: z.enum(["creator", "business", "personal"]),
  themeId: z.string().min(1),
  platforms: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      url: z.string().url(),
    })
  ),
  name: z.string().min(1).max(80),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function completeOnboarding(
  raw: z.infer<typeof onboardingSchema>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Dados inválidos" };
  }

  const preset =
    getPresetById(parsed.data.themeId) ??
    themePresets.find((t) => t.id === "minimal-white")!;
  const theme: PageTheme = preset.theme;

  const slug = await generateUniquePageSlug(parsed.data.name);

  const [created] = await db
    .insert(page)
    .values({
      userId: session.user.id,
      slug,
      title: parsed.data.name,
      description: parsed.data.bio ?? null,
      avatarUrl: parsed.data.avatarUrl ?? null,
      theme,
      published: true,
    })
    .returning();

  if (parsed.data.platforms.length > 0) {
    await db.insert(block).values(
      parsed.data.platforms.map((p, i) => ({
        pageId: created.id,
        type: "link" as const,
        data: {
          kind: "link" as const,
          label: p.label,
          url: p.url,
        } satisfies BlockData,
        position: i,
      }))
    );
  }

  revalidatePath("/dashboard");
  return { ok: true as const, pageId: created.id, slug };
}
