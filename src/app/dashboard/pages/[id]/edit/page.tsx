import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, BarChart3, ExternalLink } from "lucide-react";
import { EditorHeaderQr } from "./editor-header-qr";
import { PublishTemplateButton } from "./publish-template-button";
import { EditorShell } from "./editor-shell";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block, page } from "@/lib/db/schema";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { Button } from "@/components/ui/button";
import { normalizeTheme } from "@/lib/normalize-theme";

export default async function EditPage({
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

  const blocks = await db
    .select()
    .from(block)
    .where(eq(block.pageId, id))
    .orderBy(asc(block.position));

  const theme = normalizeTheme(p.theme);
  const limits = await getUserPlanLimits(session.user.id);
  const planTier =
    limits.customJs ? "business" : limits.customCss ? "pro" : "free";

  return (
    <main className="ambient-bg flex h-screen flex-col overflow-hidden">
      <header className="glass-nav z-30 shrink-0 border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <div className="border-l border-border pl-3">
              <h1 className="text-sm font-bold leading-none">{p.title}</h1>
              <p className="text-[11px] text-muted-foreground">
                linkbiobr.com/{p.slug}
              </p>
            </div>
            {!p.published && (
              <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Rascunho
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/pages/${p.id}/analytics`}>
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/pages/${p.id}/submissions`}>
                <span className="hidden sm:inline">Respostas</span>
                <span className="sm:hidden">📬</span>
              </Link>
            </Button>
            <PublishTemplateButton pageId={p.id} suggestedName={p.title} />
            <EditorHeaderQr slug={p.slug} title={p.title} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/${p.slug}`} target="_blank">
                <ExternalLink className="size-4" /> Ver ao vivo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <EditorShell
        page={p}
        initialBlocks={blocks}
        theme={theme}
        planTier={planTier as "free" | "pro" | "business"}
      />
    </main>
  );
}
