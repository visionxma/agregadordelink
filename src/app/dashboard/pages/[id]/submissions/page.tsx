import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  block,
  formSubmission,
  newsletterSubscriber,
  page,
  type BlockData,
} from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrazilFlag } from "@/components/brazil-flag";
import { SubmissionCard } from "./submission-card";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, id), eq(page.userId, session.user.id)));
  if (!p) notFound();

  const [subs, forms, blocks] = await Promise.all([
    db
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.pageId, p.id))
      .orderBy(desc(newsletterSubscriber.createdAt)),
    db
      .select()
      .from(formSubmission)
      .where(eq(formSubmission.pageId, p.id))
      .orderBy(desc(formSubmission.createdAt)),
    db
      .select()
      .from(block)
      .where(eq(block.pageId, p.id))
      .orderBy(asc(block.position)),
  ]);

  // Agrupa submissões de formulário por blockId
  const formsByBlock = new Map<string, typeof forms>();
  for (const f of forms) {
    const arr = formsByBlock.get(f.blockId) ?? [];
    arr.push(f);
    formsByBlock.set(f.blockId, arr);
  }

  // Encontra labels e fields dos blocos de formulário
  const formBlocks = blocks.filter((b) => b.type === "form");
  const formBlockLabel = new Map<string, string>();
  const formBlockFields = new Map<string, import("@/lib/db/schema").FormField[]>();
  for (const fb of formBlocks) {
    const data = fb.data as BlockData;
    if (data.kind === "form") {
      formBlockLabel.set(fb.id, data.title);
      formBlockFields.set(fb.id, data.fields);
    }
  }

  return (
    <main className="ambient-bg-subtle min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/pages/${p.id}/edit`}>
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-4" />
              </span>
              <span className="flex items-center gap-1.5 text-lg font-black tracking-tight">
                LinkBio <BrazilFlag className="h-5 w-auto" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Respostas
          </h1>
          <p className="mt-2 text-muted-foreground">
            {p.title} · {subs.length} newsletter ·{" "}
            {forms.length} formulários
          </p>
        </div>

        {/* Newsletter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Mail className="size-4" /> Newsletter ({subs.length})
              </h2>
              {subs.length > 0 && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`/api/submissions/export?pageId=${p.id}&type=newsletter`}
                    download
                  >
                    <Download className="size-3.5" /> CSV
                  </a>
                </Button>
              )}
            </div>
            {subs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Ninguém assinou ainda. Adicione um bloco Newsletter na página.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {subs.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <a
                      href={`mailto:${s.email}?subject=${encodeURIComponent(`Obrigado por assinar — ${p.title}`)}`}
                      className="truncate font-mono text-primary hover:underline"
                    >
                      {s.email}
                    </a>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 px-2 text-xs"
                      >
                        <a
                          href={`mailto:${s.email}?subject=${encodeURIComponent(`Novidade — ${p.title}`)}`}
                        >
                          <Mail className="size-3" /> Email
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulários — agrupados por bloco */}
        {formBlocks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="size-4" />
                <span className="text-sm">
                  Sem bloco de formulário na página. Adicione um pra coletar
                  leads.
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          formBlocks.map((fb) => {
            const blockForms = formsByBlock.get(fb.id) ?? [];
            return (
              <Card key={fb.id} className="mb-6">
                <CardContent className="pt-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      <FileText className="size-4" />
                      {formBlockLabel.get(fb.id) ?? "Formulário"} (
                      {blockForms.length})
                    </h2>
                    {blockForms.length > 0 && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`/api/submissions/export?pageId=${p.id}&type=form&blockId=${fb.id}`}
                          download
                        >
                          <Download className="size-3.5" /> CSV
                        </a>
                      </Button>
                    )}
                  </div>
                  {blockForms.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Nenhuma submissão ainda.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {blockForms.map((f) => (
                        <SubmissionCard
                          key={f.id}
                          submission={f}
                          fields={formBlockFields.get(fb.id) ?? []}
                          pageTitle={p.title}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}
