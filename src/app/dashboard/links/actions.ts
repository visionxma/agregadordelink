"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shortLink } from "@/lib/db/schema";
import {
  generateUniqueShortCode,
  isShortCodeAvailable,
  validateShortCodeFormat,
} from "@/lib/slug";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

const createSchema = z.object({
  url: z.string().url("URL inválida — precisa começar com http:// ou https://"),
  title: z.string().max(80).optional().nullable(),
  code: z.string().optional().nullable(),
});

export async function createShortLink(formData: FormData) {
  const user = await requireUser();

  const rawUrl = String(formData.get("url") ?? "").trim();
  const rawTitle = String(formData.get("title") ?? "").trim();
  const rawCode = String(formData.get("code") ?? "").trim();

  // Normaliza URL: se não tem protocolo, prepende https://
  const normalizedUrl =
    rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;

  const parsed = createSchema.safeParse({
    url: normalizedUrl,
    title: rawTitle || null,
    code: rawCode || null,
  });
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let finalCode: string;
  if (parsed.data.code) {
    const v = validateShortCodeFormat(parsed.data.code);
    if (!v.valid) return { error: v.error };
    const available = await isShortCodeAvailable(v.slug);
    if (!available) {
      return { error: "Esse código já está em uso. Tenta outro." };
    }
    finalCode = v.slug;
  } else {
    finalCode = await generateUniqueShortCode();
  }

  await db.insert(shortLink).values({
    userId: user.id,
    code: finalCode,
    url: parsed.data.url,
    title: parsed.data.title ?? null,
  });

  revalidatePath("/dashboard/links");
  return { ok: true as const, code: finalCode };
}

export async function deleteShortLink(id: string) {
  const user = await requireUser();
  await db
    .delete(shortLink)
    .where(and(eq(shortLink.id, id), eq(shortLink.userId, user.id)));
  revalidatePath("/dashboard/links");
}
