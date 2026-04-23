"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrazilFlag } from "@/components/brazil-flag";

function ResetInner() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    if (!token) {
      setError("Token inválido. Peça um novo link.");
      setLoading(false);
      return;
    }
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Erro");
      return;
    }
    router.push("/login");
  }

  if (!token) {
    return (
      <>
        <h1 className="text-2xl font-black tracking-[-0.02em]">Link inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link expirou ou é inválido. Peça um novo.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/forgot-password">Pedir novo link</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black tracking-[-0.02em]">Nova senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mínimo 8 caracteres.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11"
          />
        </div>
        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            "Salvando..."
          ) : (
            <>
              Salvar senha <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<p>Carregando...</p>}>
            <ResetInner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
