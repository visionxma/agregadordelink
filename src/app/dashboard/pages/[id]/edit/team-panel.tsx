"use client";

import { useEffect, useState, useTransition } from "react";
import { Crown, Mail, MoreHorizontal, Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import type { CollaboratorRole, PlanTier } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanGate } from "@/components/plan-gate";
import { cn } from "@/lib/utils";
import {
  getTeamMembers,
  inviteCollaborator,
  removeCollaborator,
  revokeInvite,
  updateCollaboratorRole,
  type TeamMember,
} from "../team/actions";
import type { OnlineUser } from "@/hooks/use-collab-presence";

export function TeamPanel({
  pageId,
  planTier,
  canManageTeam,
  currentUserId,
  online,
}: {
  pageId: string;
  planTier: PlanTier;
  canManageTeam: boolean;
  currentUserId: string;
  online: OnlineUser[];
}) {
  return (
    <PlanGate
      required="pro"
      currentPlan={planTier}
      label="Edição em equipe"
      description="Convide colaboradores para editar esta página com você."
    >
      <TeamContent
        pageId={pageId}
        canManageTeam={canManageTeam}
        currentUserId={currentUserId}
        online={online}
      />
    </PlanGate>
  );
}

function TeamContent({
  pageId,
  canManageTeam,
  currentUserId,
  online,
}: {
  pageId: string;
  canManageTeam: boolean;
  currentUserId: string;
  online: OnlineUser[];
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("editor");
  const [pending, startTransition] = useTransition();

  const onlineIds = new Set(online.map((o) => o.userId));

  async function reload() {
    const list = await getTeamMembers(pageId);
    setMembers(list);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, [pageId]);

  function submitInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await inviteCollaborator(pageId, { email: email.trim(), role });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Convite enviado");
      setEmail("");
      await reload();
    });
  }

  function handleRemove(member: TeamMember) {
    const isSelf = member.userId === currentUserId;
    const msg = isSelf
      ? "Sair desta página? Você perderá o acesso."
      : `Remover ${member.name ?? member.email}?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      if (member.status === "pending" && member.inviteToken) {
        await revokeInvite(pageId, member.inviteToken);
      } else if (member.userId) {
        await removeCollaborator(pageId, member.userId);
      }
      toast.success(isSelf ? "Você saiu da página" : "Colaborador removido");
      await reload();
    });
  }

  function handleRoleChange(member: TeamMember, next: CollaboratorRole) {
    if (!member.userId) return;
    startTransition(async () => {
      await updateCollaboratorRole(pageId, member.userId!, next);
      toast.success("Função atualizada");
      await reload();
    });
  }

  return (
    <div className="space-y-5">
      {canManageTeam && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <UserPlus className="size-3.5" />
            Convidar colaborador
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-xs">
              E-mail
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pessoa@email.com"
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-xs">
              Função
            </Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            >
              <option value="editor">Editor(a) — pode editar blocos e tema</option>
              <option value="viewer">Visualizador(a) — só leitura</option>
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={pending || !email.trim()}
            onClick={submitInvite}
          >
            {pending ? "Enviando..." : "Enviar convite"}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Um e-mail será enviado com o link de aceite. Se a pessoa não for cadastrada, ela cria uma conta primeiro.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="size-3.5" />
          Equipe ({members.length + 1})
        </div>

        <div className="space-y-2">
          {/* Owner row — não vem em getTeamMembers, é sempre o primeiro */}
          <OwnerBadge />

          {loading ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Carregando...</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Nenhum colaborador ainda.
            </p>
          ) : (
            members.map((m) => (
              <MemberRow
                key={m.inviteToken ?? m.userId ?? m.email}
                member={m}
                isOnline={m.userId ? onlineIds.has(m.userId) : false}
                canManage={canManageTeam}
                isSelf={m.userId === currentUserId}
                onRemove={() => handleRemove(m)}
                onChangeRole={(r) => handleRoleChange(m, r)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OwnerBadge() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/30 border border-border/60 px-2.5 py-2">
      <div className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Crown className="size-3.5 fill-current" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">Dono da página</p>
        <p className="text-[10px] text-muted-foreground">Acesso total</p>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  isOnline,
  canManage,
  isSelf,
  onRemove,
  onChangeRole,
}: {
  member: TeamMember;
  isOnline: boolean;
  canManage: boolean;
  isSelf: boolean;
  onRemove: () => void;
  onChangeRole: (r: CollaboratorRole) => void;
}) {
  const displayName =
    member.name ??
    (member.status === "pending" ? member.email : member.email.split("@")[0]);

  return (
    <div className="group flex items-center gap-2 rounded-lg bg-card border border-border/60 px-2.5 py-2">
      <div className="relative shrink-0">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt=""
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {isOnline && (
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">
          {displayName}
          {isSelf && <span className="ml-1 text-muted-foreground">(você)</span>}
        </p>
        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
          {member.status === "pending" ? (
            <>
              <Mail className="size-2.5" />
              Convite pendente
            </>
          ) : (
            <>
              {member.role === "editor" ? "Editor(a)" : "Visualizador(a)"}
              {isOnline && <span className="text-emerald-600">· online</span>}
            </>
          )}
        </p>
      </div>

      {(canManage || isSelf) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canManage && member.status === "active" && member.userId && (
            <select
              value={member.role}
              onChange={(e) => onChangeRole(e.target.value as CollaboratorRole)}
              className="rounded-md border border-border bg-background px-1 py-0.5 text-[10px]"
              aria-label="Alterar função"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          )}
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "flex size-6 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            )}
            aria-label="Remover"
            title={isSelf ? "Sair" : "Remover"}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
