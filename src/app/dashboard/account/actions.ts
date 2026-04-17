"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

const profileSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function updateProfile(formData: FormData) {
  const current = await requireUser();
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Nome inválido" };

  await db
    .update(user)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(user.id, current.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
  return { ok: true as const };
}

export async function deleteAccount() {
  const current = await requireUser();
  // Cascade deleta páginas, blocos, eventos etc via FK constraints
  await db.delete(user).where(eq(user.id, current.id));
  redirect("/");
}
