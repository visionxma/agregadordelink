"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import type { Page } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateCustomDomain } from "../../actions";
import { PlanGate } from "@/components/plan-gate";
import type { PlanTier } from "@/lib/db/schema";

export function CustomDomainForm({ page, planTier = "free" }: { page: Page; planTier?: PlanTier }) {
  const [pending, startTransition] = useTransition();
  const [domain, setDomain] = useState(page.customDomain ?? "");
  const [showInstructions, setShowInstructions] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateCustomDomain(page.id, domain);
      if (result?.ok) {
        toast.success(
          domain
            ? "Domínio salvo — configure o DNS"
            : "Domínio removido"
        );
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <PlanGate
      required="pro"
      currentPlan={planTier}
      label="Domínio próprio"
      description="Conecte meusite.com.br à sua página"
    >
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <Globe className="size-4" />
              Domínio próprio
            </h3>
            <p className="text-xs text-muted-foreground">
              Aponte seu domínio pra essa página (ex: meusite.com.br)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) =>
                setDomain(
                  e.target.value
                    .toLowerCase()
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")
                )
              }
              placeholder="meusite.com.br"
              spellCheck={false}
              autoCapitalize="off"
            />
            <p className="text-xs text-muted-foreground">
              Só o domínio, sem <code className="rounded bg-secondary px-1">http://</code>
            </p>
          </div>

          {page.customDomain && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="size-3.5" />
                {page.customDomain}
              </p>
              <a
                href={`https://${page.customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Abrir <ExternalLink className="size-3" />
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInstructions((s) => !s)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {showInstructions ? "− Fechar" : "+ Como configurar DNS"}
          </button>

          {showInstructions && (
            <div className="space-y-2 rounded-lg bg-secondary/50 p-3 text-xs">
              <p className="font-semibold">No painel do seu provedor de DNS:</p>
              <ol className="space-y-1.5 pl-4 list-decimal">
                <li>
                  Crie um registro <strong>CNAME</strong>
                </li>
                <li>
                  Host: <code className="rounded bg-background px-1">@</code> ou{" "}
                  <code className="rounded bg-background px-1">www</code>
                </li>
                <li>
                  Aponta pra:{" "}
                  <code className="rounded bg-background px-1">
                    cname.vercel-dns.com
                  </code>
                </li>
                <li>SSL é configurado automático (aguarde ~5 min)</li>
              </ol>
              <p className="text-muted-foreground">
                Se seu provedor não aceita CNAME na raiz (@), use um
                subdomínio (ex: <code>bio.meusite.com</code>) ou registros
                ALIAS/ANAME.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={pending || domain === (page.customDomain ?? "")}
            className="w-full"
          >
            {pending
              ? "Salvando..."
              : domain
                ? "Salvar domínio"
                : "Remover domínio"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </PlanGate>
  );
}
