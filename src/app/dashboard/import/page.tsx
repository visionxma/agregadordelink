"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LinkBioLogo } from "@/components/linkbio-logo";
import { importPageFromUrl } from "./actions";

export default function ImportPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await importPageFromUrl(formData);
      if (result?.error) setError(result.error);
    });
  }

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
            <Link href="/dashboard" className="flex items-center">
              <LinkBioLogo size="md" />
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-xl px-4 py-16">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Download className="size-6" />
          </div>
          <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Importar página
          </h1>
          <p className="mt-2 text-muted-foreground">
            Migra do Linktree, Beacons ou qualquer bio pública em segundos.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="url">URL do perfil</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://linktr.ee/seuusuario"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Suporta: Linktree, Beacons, ou qualquer página com links
                  públicos.
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
                disabled={pending}
              >
                {pending ? (
                  "Importando..."
                ) : (
                  <>
                    Importar agora <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">💡 O que é importado:</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>Nome, bio e foto de perfil</li>
            <li>Todos os links externos (até 25)</li>
            <li>Tema visual &quot;Minimal White&quot; padrão — customize depois</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
