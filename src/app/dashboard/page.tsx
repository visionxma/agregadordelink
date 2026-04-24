import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block, page as pageTable, type Block } from "@/lib/db/schema";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { isUnlimited } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { PagePreviewCard } from "@/components/page-preview-card";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { Crown, LayoutTemplate, Link2, Plus, Sparkles, Star } from "lucide-react";
import { SignOutButton } from "./sign-out-button";
import { PageCardActions } from "./page-card-actions";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const pages = await db
    .select()
    .from(pageTable)
    .where(eq(pageTable.userId, session.user.id))
    .orderBy(desc(pageTable.updatedAt));

  const limits = await getUserPlanLimits(session.user.id);
  const atPageLimit = !isUnlimited(limits.pages) && pages.length >= limits.pages;
  const pageUpgrade = limits.pages === 1 ? "pro" : "business";

  // Carrega todos os blocos visíveis de uma vez (1 query) e agrupa por page
  const pageIds = pages.map((p) => p.id);
  const allBlocks =
    pageIds.length > 0
      ? await db
          .select()
          .from(block)
          .where(and(inArray(block.pageId, pageIds), eq(block.visible, true)))
          .orderBy(asc(block.position))
      : [];

  const blocksByPage = new Map<string, Block[]>();
  for (const b of allBlocks) {
    const arr = blocksByPage.get(b.pageId) ?? [];
    arr.push(b);
    blocksByPage.set(b.pageId, arr);
  }

  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
            <nav className="hidden gap-1 sm:flex">
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Páginas</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/pages/new">
                  <LayoutTemplate className="size-3.5" /> Modelos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/links">
                  <Link2 className="size-3.5" /> Links curtos
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/account">Conta</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/billing">Planos</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
              Olá, {session.user.name?.split(" ")[0] ?? "criador"} 👋
            </h1>
            <p className="mt-2 text-muted-foreground">
              Suas páginas e o que tá rolando com elas.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/pages/new">
              <Plus className="size-4" /> Nova página
            </Link>
          </Button>
        </div>

        {atPageLimit && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                {pageUpgrade === "pro" ? (
                  <Star className="size-4 fill-amber-400 text-amber-500" />
                ) : (
                  <Crown className="size-4 fill-purple-500 text-purple-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold">
                  Você atingiu o limite do plano gratuito
                </p>
                <p className="text-xs text-muted-foreground">
                  Para criar mais páginas,{" "}
                  {pageUpgrade === "pro"
                    ? "assine o plano Pro"
                    : "faça upgrade para Business"}
                  . Você ainda pode explorar os modelos livremente.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15">
              <Link href="/dashboard/billing">
                {pageUpgrade === "pro" ? (
                  <><Star className="size-3.5 fill-amber-400 text-amber-500" /> Assinar Pro</>
                ) : (
                  <><Crown className="size-3.5 fill-purple-500 text-purple-500" /> Upgrade Business</>
                )}
              </Link>
            </Button>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center shadow-ios">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Sparkles className="size-7" />
            </div>
            <h2 className="text-2xl font-bold">
              Bora criar sua primeira página?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Escolha um modelo, cola seus links e compartilha no Insta.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/dashboard/pages/new">
                <Plus className="size-4" /> Criar primeira página
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-ios-sm transition-all hover:-translate-y-1 hover:shadow-ios-lg hover:border-primary/30"
              >
                <div className="relative">
                  <PagePreviewCard
                    page={p}
                    blocks={blocksByPage.get(p.id) ?? []}
                  />
                  {!p.published && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      Rascunho
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="truncate font-bold">{p.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    linkbiobr.com/{p.slug}
                  </p>
                  <PageCardActions id={p.id} slug={p.slug} title={p.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
