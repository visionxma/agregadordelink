import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { page, pageCollaborator, type Page, type CollaboratorRole } from "@/lib/db/schema";
import { getUserPlanLimits } from "@/lib/get-plan-limits";

export type CollabRole = "owner" | CollaboratorRole;

export type PageAccess = {
  page: Page;
  role: CollabRole;
  isOwner: boolean;
  canEdit: boolean;
  canManageTeam: boolean;
  canDeletePage: boolean;
};

/**
 * Resolve o nível de acesso de um usuário a uma página.
 * Retorna null se o usuário não é dono nem colaborador aceito.
 * Se o dono não tem mais plano pro+, colaboradores ficam bloqueados.
 */
export async function resolvePageAccess(
  pageId: string,
  userId: string
): Promise<PageAccess | null> {
  const [p] = await db.select().from(page).where(eq(page.id, pageId)).limit(1);
  if (!p) return null;

  if (p.userId === userId) {
    return {
      page: p,
      role: "owner",
      isOwner: true,
      canEdit: true,
      canManageTeam: true,
      canDeletePage: true,
    };
  }

  const [collab] = await db
    .select()
    .from(pageCollaborator)
    .where(
      and(
        eq(pageCollaborator.pageId, pageId),
        eq(pageCollaborator.userId, userId),
        isNotNull(pageCollaborator.acceptedAt)
      )
    )
    .limit(1);

  if (!collab) return null;

  // Verifica se o dono ainda tem plano que suporta colaboração.
  // Em caso contrário, colaboradores ficam bloqueados até assinatura retornar.
  const ownerLimits = await getUserPlanLimits(p.userId);
  if (ownerLimits.teamCollaborators === 0) return null;

  return {
    page: p,
    role: collab.role,
    isOwner: false,
    canEdit: collab.role === "editor",
    canManageTeam: false,
    canDeletePage: false,
  };
}

/** Variante que lança erro quando não há acesso — uso dentro de actions que devem retornar { error } */
export async function requirePageEdit(
  pageId: string,
  userId: string
): Promise<PageAccess> {
  const access = await resolvePageAccess(pageId, userId);
  if (!access) throw new Error("Página não encontrada ou sem acesso.");
  if (!access.canEdit) throw new Error("Você não tem permissão para editar esta página.");
  return access;
}
