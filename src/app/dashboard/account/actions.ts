"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { isAbacatePayConfigured, cancelBilling } from "@/lib/abacatepay";

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

  // 1. Cancela assinatura no Abacate Pay antes de deletar o usuário
  if (isAbacatePayConfigured()) {
    try {
      const [sub] = await db
        .select()
        .from(subscription)
        .where(eq(subscription.userId, current.id))
        .limit(1);

      if (sub?.gatewaySubscriptionId) {
        await cancelBilling(sub.gatewaySubscriptionId).catch((err) => {
          console.error("[deleteAccount] cancelBilling failed:", err);
        });
      }
    } catch (err) {
      console.error("[deleteAccount] abacatepay cleanup error:", err);
      // Continua mesmo com erro — dados locais devem ser apagados
    }
  }

  // 2. Deleta usuário (cascade apaga páginas, blocos, eventos, shortlinks, etc)
  await db.delete(user).where(eq(user.id, current.id));

  redirect("/");
}
