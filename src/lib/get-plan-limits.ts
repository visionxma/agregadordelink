import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { getEffectivePlan, getPlan, type PlanLimits } from "@/lib/plans";

/** Retorna os limites do plano ativo do usuário (inclui trial). Nunca lança. */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  try {
    const [sub] = await db
      .select({ plan: subscription.plan, status: subscription.status, trialEndsAt: subscription.trialEndsAt })
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);
    return getEffectivePlan(sub).limits;
  } catch (err) {
    // Fallback: se colunas de trial ainda não estão no DB (db:push pendente),
    // tenta query simples sem trialEndsAt
    console.error("[getUserPlanLimits] fallback:", (err as Error).message);
    try {
      const [sub] = await db
        .select({ plan: subscription.plan, status: subscription.status })
        .from(subscription)
        .where(eq(subscription.userId, userId))
        .limit(1);
      if (!sub) return getPlan("free").limits;
      if (sub.status === "active") return getPlan(sub.plan).limits;
      return getPlan("free").limits;
    } catch {
      return getPlan("free").limits;
    }
  }
}
