"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[edit page error]", error);
  }, [error]);

  return (
    <main className="ambient-bg flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-xl shadow-ios-md">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="text-center text-xl font-bold">Algo deu errado no editor</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {error.message || "Erro inesperado. Tente novamente em alguns segundos."}
        </p>
        {error.digest && (
          <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground/60">
            #{error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="size-4" /> Tentar de novo
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
