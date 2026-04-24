import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Check, Clock, LogIn, X } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { page, pageInvite, user as userTable } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/app/dashboard/pages/[id]/team/actions";

export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [invite] = await db
    .select({
      id: pageInvite.id,
      email: pageInvite.email,
      role: pageInvite.role,
      expiresAt: pageInvite.expiresAt,
      acceptedAt: pageInvite.acceptedAt,
      pageId: pageInvite.pageId,
      pageTitle: page.title,
      inviterName: userTable.name,
    })
    .from(pageInvite)
    .innerJoin(page, eq(page.id, pageInvite.pageId))
    .innerJoin(userTable, eq(userTable.id, pageInvite.invitedBy))
    .where(eq(pageInvite.id, token))
    .limit(1);

  if (!invite) {
    return <InviteMessage status="error" title="Convite inválido" body="Este link de convite não existe ou foi revogado." />;
  }

  if (invite.acceptedAt) {
    return (
      <InviteMessage
        status="info"
        title="Convite já utilizado"
        body="Este convite já foi aceito. Acesse suas páginas no dashboard."
        action={{ href: "/dashboard", label: "Ir para o dashboard" }}
      />
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <InviteMessage
        status="error"
        title="Convite expirado"
        body={`O convite para "${invite.pageTitle}" expirou. Peça um novo convite para quem te enviou.`}
      />
    );
  }

  if (!session) {
    return (
      <InviteMessage
        status="info"
        title="Entre pra aceitar o convite"
        body={`${invite.inviterName} te convidou para colaborar em "${invite.pageTitle}". Faça login com ${invite.email} pra aceitar.`}
        action={{
          href: `/login?next=${encodeURIComponent(`/dashboard/invite/${token}`)}`,
          label: "Entrar",
        }}
      />
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <InviteMessage
        status="error"
        title="Conta diferente da convidada"
        body={`Este convite é para ${invite.email}, mas você está logado como ${session.user.email}. Faça logout e entre com a conta correta.`}
        action={{ href: "/dashboard", label: "Voltar ao dashboard" }}
      />
    );
  }

  // Aceita automaticamente
  const result = await acceptInvite(token);
  if ("error" in result) {
    return <InviteMessage status="error" title="Falha ao aceitar" body={result.error!} />;
  }
  redirect(`/dashboard/pages/${result.pageId}/edit`);
}

function InviteMessage({
  status,
  title,
  body,
  action,
}: {
  status: "info" | "error";
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  const Icon = status === "error" ? X : status === "info" ? LogIn : Check;
  return (
    <main className="ambient-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-ios-lg">
        <div
          className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${
            status === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-6" />
        </div>
        <h1 className="text-xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        {action && (
          <Button asChild className="mt-6 w-full">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
