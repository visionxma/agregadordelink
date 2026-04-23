"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrazilFlag } from "@/components/brazil-flag";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectTo: "/reset-password" }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.message ?? "Erro ao enviar email");
      return;
    }
    setSent(true);
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
          <span className="flex items-center gap-1.5 text-xl font-black tracking-tight">
            LinkBio <BrazilFlag className="h-5 w-auto" />
          </span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-ios-lg">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Check className="size-6" />
              </div>
              <h1 className="text-2xl font-black tracking-[-0.02em]">
                Email enviado
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Confere sua caixa de entrada. O link expira em 1 hora.
              </p>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/login">Voltar pra entrar</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-[-0.02em]">
                Esqueci a senha
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Coloca seu email que a gente manda um link pra resetar.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-11"
                  />
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
                    "Enviando..."
                  ) : (
                    <>
                      Enviar link <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Lembrou?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
