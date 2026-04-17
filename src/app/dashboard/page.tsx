import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { page as pageTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ThemeThumbnail } from "@/components/theme-thumbnail";
import { normalizeTheme } from "@/lib/normalize-theme";
import { ExternalLink, Link2, Plus, Sparkles } from "lucide-react";
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

  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-4" />
              </span>
              <span className="text-lg font-black tracking-tight">linkhub</span>
            </Link>
            <nav className="hidden gap-1 sm:flex">
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Páginas</Link>
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
                  <ThemeThumbnail theme={normalizeTheme(p.theme)} label={p.title} />
                  {!p.published && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      Rascunho
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="truncate font-bold">{p.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    linkhub.app/{p.slug}
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
