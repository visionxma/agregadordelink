import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { getEffectivePlan, type PlanLimits } from "@/lib/plans";

/** Retorna os limites do plano ativo do usuário (inclui trial). Nunca lança. */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const [sub] = await db
    .select({ plan: subscription.plan, status: subscription.status, trialEndsAt: subscription.trialEndsAt })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  return getEffectivePlan(sub).limits;
}
