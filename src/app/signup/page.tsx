"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GoogleSignInButton,
  OrDivider,
} from "@/components/google-sign-in-button";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp.email({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Erro ao criar conta");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="ambient-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-ios-glow">
            <Sparkles className="size-4" />
          </span>
          <span className="text-xl font-black tracking-tight">linkhub</span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-ios-lg">
          <h1 className="text-2xl font-black tracking-[-0.02em]">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Grátis pra sempre. Pronto em 30 segundos.
          </p>

          <div className="mt-6">
            <GoogleSignInButton
              label="Criar conta com Google"
              callbackURL="/onboarding"
            />
            <OrDivider />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                required
                autoComplete="name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres.
              </p>
            </div>
            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "Criando..."
              ) : (
                <>
                  Criar conta <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
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
