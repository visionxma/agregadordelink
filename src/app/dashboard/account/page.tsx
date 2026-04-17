import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "../sign-out-button";
import { AccountForms } from "./account-forms";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="ambient-bg min-h-screen">
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
          <SignOutButton />
        </div>
      </header>

      <section className="container mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Sua conta
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie seu perfil, senha e conta.
          </p>
        </div>

        <AccountForms
          user={{
            name: session.user.name,
            email: session.user.email,
          }}
        />
      </section>
    </main>
  );
}
