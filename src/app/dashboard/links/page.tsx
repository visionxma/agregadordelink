import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Link2, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shortLink } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "../sign-out-button";
import { CreateShortLinkForm } from "./create-form";
import { ShortLinksList } from "./list";

export default async function ShortLinksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const links = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.userId, session.user.id))
    .orderBy(desc(shortLink.createdAt));

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
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Páginas</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/links">Links curtos</Link>
              </Button>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Link2 className="size-3.5" />
            Encurtador
          </div>
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Links curtos & <span className="brand-gradient-text">QR codes</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Cola uma URL gigante, recebe um link enxuto + QR code pra compartilhar.
          </p>
        </div>

        <CreateShortLinkForm />

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold tracking-tight">
            Seus links ({links.length})
          </h2>
          <ShortLinksList links={links} />
        </div>
      </section>
    </main>
  );
}
