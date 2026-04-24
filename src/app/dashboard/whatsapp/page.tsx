import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { WhatsappGenerator } from "./generator";

export default async function WhatsappGeneratorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <MessageCircle className="size-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              WhatsApp
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Gerador de <span className="brand-gradient-text">link WhatsApp</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Crie um link que abre uma conversa no WhatsApp com mensagem já
            pronta. Funciona sem ter o contato salvo.
          </p>
        </div>

        <WhatsappGenerator />
      </section>
    </main>
  );
}
