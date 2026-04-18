"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function SignupPage() {
  return (
    <main className="ambient-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
            <Sparkles className="size-4" />
          </span>
          <span className="text-xl font-black tracking-tight">linkhub</span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-ios-lg">
          <h1 className="text-2xl font-black tracking-[-0.02em]">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Grátis pra sempre. Pronto em 30 segundos.
          </p>

          <div className="mt-6">
            <GoogleSignInButton
              label="Criar conta com Google"
              callbackURL="/onboarding"
            />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao criar conta, você concorda com nossos{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Termos de Uso
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
