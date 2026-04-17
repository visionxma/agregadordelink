"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block, page } from "@/lib/db/schema";
import { generateUniquePageSlug } from "@/lib/slug";
import { importFromUrl } from "@/lib/import-linktree";
import { themePresets } from "@/lib/themes";

export async function importPageFromUrl(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { error: "Cole a URL." };

  const result = await importFromUrl(url);
  if ("error" in result) return { error: result.error };

  if (result.blocks.length === 0) {
    return { error: "Não encontrei links nesta página. Tenta outro perfil." };
  }

  const slug = await generateUniquePageSlug(result.title ?? "import");
  const preset =
    themePresets.find((p) => p.id === "minimal-white") ?? themePresets[0]!;

  const [created] = await db
    .insert(page)
    .values({
      userId: session.user.id,
      slug,
      title: result.title ?? "Página importada",
      description: result.bio ?? null,
      avatarUrl: result.avatarUrl ?? null,
      theme: preset.theme,
      published: true,
    })
    .returning();

  await db.insert(block).values(
    result.blocks.map((b, i) => ({
      pageId: created.id,
      type: b.type,
      data: b.data,
      position: i,
    }))
  );

  revalidatePath("/dashboard");
  redirect(`/dashboard/pages/${created.id}/edit`);
}
