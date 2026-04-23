import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Link2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { runHealthCheck } from "@/lib/health-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const report = await runHealthCheck(session.user.id);

  const byPage = new Map<string, typeof report.issues>();
  for (const i of report.issues) {
    if (!byPage.has(i.pageId)) byPage.set(i.pageId, []);
    byPage.get(i.pageId)!.push(i);
  }

  return (
    <main className="ambient-bg-subtle min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-4" />
              </span>
              <span className="text-lg font-black tracking-tight">linkhub</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Saúde das páginas
          </h1>
          <p className="mt-2 text-muted-foreground">
            {report.pagesChecked} páginas · {report.urlsChecked} URLs checadas ·{" "}
            {report.issues.length} problemas encontrados
          </p>
        </div>

        {report.issues.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              ✓
            </div>
            <h2 className="text-lg font-bold">Tudo funcionando</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos os links e imagens das suas páginas estão online.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Array.from(byPage.entries()).map(([pageId, issues]) => (
              <Card key={pageId}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{issues[0]!.pageTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        linkbiobr.com/{issues[0]!.pageSlug}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/pages/${pageId}/edit`}>
                        Corrigir
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {issues.map((i, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3"
                      >
                        <div
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${i.status === "broken" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}
                        >
                          {i.kind === "link" ? (
                            <Link2 className="size-3.5" />
                          ) : (
                            <ShieldAlert className="size-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {labelKind(i.kind)} ·{" "}
                            <span
                              className={
                                i.status === "broken"
                                  ? "text-destructive"
                                  : "text-amber-600"
                              }
                            >
                              {labelStatus(i.status)}
                            </span>
                          </p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {i.target}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i.detail}
                          </p>
                        </div>
                        <a
                          href={i.target}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          title="Abrir link"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Checagem feita em {new Date(report.checkedAt).toLocaleString("pt-BR")}.
          Recarregue a página pra rodar de novo.
        </p>
      </section>
    </main>
  );
}

function labelKind(k: string): string {
  if (k === "link") return "Link";
  if (k === "image") return "Imagem";
  if (k === "avatar") return "Avatar";
  if (k === "cover") return "Capa";
  if (k === "video") return "Vídeo";
  return k;
}
function labelStatus(s: string): string {
  if (s === "broken") return "quebrado";
  if (s === "insecure") return "inseguro (HTTP)";
  if (s === "slow") return "lento";
  return s;
}
