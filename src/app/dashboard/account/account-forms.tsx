"use client";

import { useState, useTransition } from "react";
import { Activity, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount, updateProfile } from "./actions";

export function AccountForms({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <div className="space-y-6">
      <ProfileCard initialName={user.name} email={user.email} />
      <PasswordCard />
      <ToolsCard />
      <DangerCard />
    </div>
  );
}

function ToolsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ferramentas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Saúde das páginas</p>
            <p className="text-xs text-muted-foreground">
              Checa se todos os links e imagens estão funcionando.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/dashboard/health">
              <Activity className="size-4" /> Verificar
            </a>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Backup completo</p>
            <p className="text-xs text-muted-foreground">
              Baixa ZIP com páginas, blocos, links e 90 dias de analytics.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/api/backup" download>
              <Download className="size-4" /> Baixar ZIP
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileCard({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.ok) toast.success("Perfil atualizado");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialName}
              required
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              defaultValue={email}
              disabled
              className="text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email não pode ser alterado no momento.
            </p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("Nova senha precisa ter no mínimo 8 caracteres");
      return;
    }
    startTransition(async () => {
      const result = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Erro ao trocar senha");
        return;
      }
      toast.success("Senha atualizada");
      setCurrent("");
      setNext("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Senha atual</Label>
            <Input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next">Nova senha</Label>
            <Input
              id="next"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Trocar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DangerCard() {
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");

  function handleDelete() {
    if (confirmText !== "DELETAR") {
      toast.error("Digite DELETAR pra confirmar");
      return;
    }
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de perigo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Deletar sua conta apaga permanentemente suas páginas, links, analytics
          e tudo mais. Não dá pra desfazer.
        </p>
        <div className="mt-4 space-y-3">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Digite "DELETAR" pra confirmar'
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending || confirmText !== "DELETAR"}
          >
            <Trash2 className="size-4" />
            {pending ? "Deletando..." : "Deletar minha conta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
