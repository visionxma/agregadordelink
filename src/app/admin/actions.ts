"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, page, subscription, abuseReport } from "@/lib/db/schema";
import type { PlanTier } from "@/lib/db/schema";
import { requireAdmin } from "./lib";

// ─── Páginas ──────────────────────────────────────────────────────────────────

export async function adminDeletePage(pageId: string) {
  await requireAdmin();
  await db.delete(page).where(eq(page.id, pageId));
  return { ok: true };
}

export async function adminUpdatePageSlug(pageId: string, newSlug: string) {
  await requireAdmin();
  const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
  if (!slug || slug.length < 2) return { error: "Slug inválido." };
  const [conflict] = await db.select({ id: page.id }).from(page).where(and(eq(page.slug, slug))).limit(1);
  if (conflict && conflict.id !== pageId) return { error: "Slug já está em uso." };
  await db.update(page).set({ slug, updatedAt: new Date() }).where(eq(page.id, pageId));
  return { ok: true };
}

export async function adminTogglePagePublished(pageId: string, published: boolean) {
  await requireAdmin();
  await db.update(page).set({ published, updatedAt: new Date() }).where(eq(page.id, pageId));
  return { ok: true };
}

// ─── Usuários ─────────────────────────────────────────────────────────────────

export async function adminDeleteUser(userId: string) {
  await requireAdmin();
  await db.delete(user).where(eq(user.id, userId));
  return { ok: true };
}

// ─── Assinaturas ─────────────────────────────────────────────────────────────

export async function adminSetUserPlan(userId: string, plan: PlanTier) {
  await requireAdmin();
  const [existing] = await db.select({ id: subscription.id }).from(subscription).where(eq(subscription.userId, userId)).limit(1);
  if (existing) {
    await db.update(subscription).set({
      plan,
      status: plan === "free" ? "canceled" : "active",
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    }).where(eq(subscription.userId, userId));
  } else {
    await db.insert(subscription).values({ userId, plan, status: plan === "free" ? null : "active" });
  }
  return { ok: true };
}

export async function adminCancelSubscription(userId: string) {
  await requireAdmin();
  await db.update(subscription).set({
    plan: "free",
    status: "canceled",
    gatewaySubscriptionId: null,
    cancelAtPeriodEnd: false,
    updatedAt: new Date(),
  }).where(eq(subscription.userId, userId));
  return { ok: true };
}

// ─── Denúncias / Abuso ───────────────────────────────────────────────────────

export async function adminResolveAbuse(reportId: string, action: "reviewed" | "dismissed") {
  await requireAdmin();
  await db
    .update(abuseReport)
    .set({ status: action, resolvedAt: new Date() })
    .where(eq(abuseReport.id, reportId));
  return { ok: true };
}

export async function adminResolveAbuseAndUnpublish(reportId: string, pageId: string) {
  await requireAdmin();
  await Promise.all([
    db.update(page).set({ published: false, updatedAt: new Date() }).where(eq(page.id, pageId)),
    db
      .update(abuseReport)
      .set({ status: "reviewed", resolvedAt: new Date() })
      .where(eq(abuseReport.id, reportId)),
  ]);
  return { ok: true };
}
