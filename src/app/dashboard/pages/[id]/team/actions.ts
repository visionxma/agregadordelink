"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, count, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  page,
  pageCollaborator,
  pageInvite,
  user as userTable,
  type CollaboratorRole,
} from "@/lib/db/schema";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { isUnlimited } from "@/lib/plans";
import { createId } from "@/lib/id";
import { sendCollabInviteEmail } from "@/lib/email";
import { resolvePageAccess } from "@/lib/collab-auth";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

function appBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://linkbiobr.com"
  ).replace(/\/$/, "");
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]),
});

export async function inviteCollaborator(
  pageId: string,
  raw: { email: string; role: CollaboratorRole }
) {
  const me = await requireUser();
  const access = await resolvePageAccess(pageId, me.id);
  if (!access || !access.canManageTeam) {
    return { error: "Sem permissão para convidar nesta página." };
  }

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { error: "E-mail inválido." };

  const email = parsed.data.email.toLowerCase().trim();
  if (email === me.email.toLowerCase()) {
    return { error: "Você já é o dono desta página." };
  }

  // Limite por plano do OWNER
  const ownerLimits = await getUserPlanLimits(access.page.userId);
  if (ownerLimits.teamCollaborators === 0) {
    return { error: "Colaboração em equipe é um recurso do plano Pro." };
  }
  if (!isUnlimited(ownerLimits.teamCollaborators)) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(pageCollaborator)
      .where(eq(pageCollaborator.pageId, pageId));
    if (total >= ownerLimits.teamCollaborators) {
      return {
        error: `Seu plano permite até ${ownerLimits.teamCollaborators} colaborador(es) por página.`,
      };
    }
  }

  // Se o e-mail já é um usuário cadastrado, adiciona direto como colaborador pendente
  const [existingUser] = await db
    .select({ id: userTable.id, name: userTable.name })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  // Verifica se já existe colaborador ou convite pro mesmo email/usuário
  if (existingUser) {
    const [already] = await db
      .select({ id: pageCollaborator.id, acceptedAt: pageCollaborator.acceptedAt })
      .from(pageCollaborator)
      .where(
        and(
          eq(pageCollaborator.pageId, pageId),
          eq(pageCollaborator.userId, existingUser.id)
        )
      )
      .limit(1);
    if (already?.acceptedAt) {
      return { error: "Esta pessoa já colabora nesta página." };
    }
  }

  const [existingInvite] = await db
    .select()
    .from(pageInvite)
    .where(and(eq(pageInvite.pageId, pageId), eq(pageInvite.email, email)))
    .limit(1);

  const token = createId(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  if (existingInvite) {
    // Reaproveita convite — atualiza token, role e expiração
    await db
      .update(pageInvite)
      .set({
        id: token,
        role: parsed.data.role,
        invitedBy: me.id,
        createdAt: now,
        expiresAt,
        acceptedAt: null,
      })
      .where(eq(pageInvite.id, existingInvite.id));
  } else {
    await db.insert(pageInvite).values({
      id: token,
      pageId,
      email,
      role: parsed.data.role,
      invitedBy: me.id,
      expiresAt,
    });
  }

  // Se o usuário já existe e não há collaborator criado, cria pending
  if (existingUser) {
    const [has] = await db
      .select({ id: pageCollaborator.id })
      .from(pageCollaborator)
      .where(
        and(
          eq(pageCollaborator.pageId, pageId),
          eq(pageCollaborator.userId, existingUser.id)
        )
      )
      .limit(1);
    if (!has) {
      await db.insert(pageCollaborator).values({
        pageId,
        userId: existingUser.id,
        role: parsed.data.role,
        invitedBy: me.id,
      });
    } else {
      await db
        .update(pageCollaborator)
        .set({ role: parsed.data.role, invitedBy: me.id })
        .where(eq(pageCollaborator.id, has.id));
    }
  }

  const acceptUrl = `${appBaseUrl()}/dashboard/invite/${token}`;
  try {
    await sendCollabInviteEmail({
      to: email,
      inviterName: me.name,
      pageTitle: access.page.title,
      role: parsed.data.role,
      acceptUrl,
    });
  } catch (err) {
    console.error("[collab] falha ao enviar email", err);
  }

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  return { ok: true as const, acceptUrl };
}

export async function removeCollaborator(pageId: string, collaboratorUserId: string) {
  const me = await requireUser();
  const access = await resolvePageAccess(pageId, me.id);
  if (!access) return { error: "Sem acesso." };

  // Dono pode remover qualquer um; colaborador só pode remover a si mesmo
  if (!access.canManageTeam && collaboratorUserId !== me.id) {
    return { error: "Sem permissão." };
  }

  await db
    .delete(pageCollaborator)
    .where(
      and(
        eq(pageCollaborator.pageId, pageId),
        eq(pageCollaborator.userId, collaboratorUserId)
      )
    );

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  return { ok: true as const };
}

export async function updateCollaboratorRole(
  pageId: string,
  collaboratorUserId: string,
  role: CollaboratorRole
) {
  const me = await requireUser();
  const access = await resolvePageAccess(pageId, me.id);
  if (!access || !access.canManageTeam) return { error: "Sem permissão." };

  await db
    .update(pageCollaborator)
    .set({ role })
    .where(
      and(
        eq(pageCollaborator.pageId, pageId),
        eq(pageCollaborator.userId, collaboratorUserId)
      )
    );

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  return { ok: true as const };
}

export async function revokeInvite(pageId: string, inviteToken: string) {
  const me = await requireUser();
  const access = await resolvePageAccess(pageId, me.id);
  if (!access || !access.canManageTeam) return { error: "Sem permissão." };

  await db
    .delete(pageInvite)
    .where(and(eq(pageInvite.pageId, pageId), eq(pageInvite.id, inviteToken)));

  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  return { ok: true as const };
}

export async function acceptInvite(token: string) {
  const me = await requireUser();

  const [invite] = await db
    .select()
    .from(pageInvite)
    .where(eq(pageInvite.id, token))
    .limit(1);

  if (!invite) return { error: "Convite inválido." };
  if (invite.acceptedAt) return { error: "Convite já utilizado." };
  if (invite.expiresAt < new Date()) return { error: "Convite expirado." };

  const emailMatch = me.email.toLowerCase() === invite.email.toLowerCase();
  if (!emailMatch) {
    return {
      error: `Este convite é para ${invite.email}. Faça login com essa conta para aceitar.`,
    };
  }

  // Aceita o convite
  await db
    .update(pageInvite)
    .set({ acceptedAt: new Date() })
    .where(eq(pageInvite.id, token));

  // Upsert do colaborador (já pode existir pending se o usuário já era cadastrado)
  const [already] = await db
    .select({ id: pageCollaborator.id })
    .from(pageCollaborator)
    .where(
      and(
        eq(pageCollaborator.pageId, invite.pageId),
        eq(pageCollaborator.userId, me.id)
      )
    )
    .limit(1);

  if (already) {
    await db
      .update(pageCollaborator)
      .set({ acceptedAt: new Date(), role: invite.role })
      .where(eq(pageCollaborator.id, already.id));
  } else {
    await db.insert(pageCollaborator).values({
      pageId: invite.pageId,
      userId: me.id,
      role: invite.role,
      invitedBy: invite.invitedBy,
      acceptedAt: new Date(),
    });
  }

  revalidatePath(`/dashboard/pages/${invite.pageId}/edit`);
  return { ok: true as const, pageId: invite.pageId };
}

export type TeamMember = {
  userId: string | null;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: CollaboratorRole;
  status: "active" | "pending";
  inviteToken: string | null;
  invitedAt: Date;
};

export async function getTeamMembers(pageId: string): Promise<TeamMember[]> {
  const me = await requireUser();
  const access = await resolvePageAccess(pageId, me.id);
  if (!access) return [];

  const rows = await db
    .select({
      userId: pageCollaborator.userId,
      role: pageCollaborator.role,
      acceptedAt: pageCollaborator.acceptedAt,
      invitedAt: pageCollaborator.invitedAt,
      email: userTable.email,
      name: userTable.name,
      avatarUrl: userTable.image,
    })
    .from(pageCollaborator)
    .innerJoin(userTable, eq(pageCollaborator.userId, userTable.id))
    .where(eq(pageCollaborator.pageId, pageId));

  const pending = await db
    .select()
    .from(pageInvite)
    .where(
      and(eq(pageInvite.pageId, pageId), isNull(pageInvite.acceptedAt))
    );

  const acceptedUserIds = new Set(
    rows.filter((r) => r.acceptedAt).map((r) => r.email.toLowerCase())
  );

  const members: TeamMember[] = [];
  for (const r of rows) {
    members.push({
      userId: r.userId,
      email: r.email,
      name: r.name,
      avatarUrl: r.avatarUrl,
      role: r.role,
      status: r.acceptedAt ? "active" : "pending",
      inviteToken: null,
      invitedAt: r.invitedAt,
    });
  }
  for (const inv of pending) {
    if (acceptedUserIds.has(inv.email.toLowerCase())) continue;
    if (members.some((m) => m.email.toLowerCase() === inv.email.toLowerCase()))
      continue;
    members.push({
      userId: null,
      email: inv.email,
      name: null,
      avatarUrl: null,
      role: inv.role,
      status: "pending",
      inviteToken: inv.id,
      invitedAt: inv.createdAt,
    });
  }
  return members;
}
