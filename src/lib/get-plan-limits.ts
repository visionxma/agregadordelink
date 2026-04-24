import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { getPlan, type PlanLimits } from "@/lib/plans";

/** Retorna os limites do plano ativo do usuário. Nunca lança. */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const [sub] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  return getPlan(sub?.plan ?? "free").limits;
}
