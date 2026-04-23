"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createShortLink } from "./actions";

export function CreateShortLinkForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customCode, setCustomCode] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createShortLink(formData);
      if ("error" in result) {
        setError(result.error ?? "Erro ao criar link");
      } else if (result.ok) {
        setSuccess(result.code);
        form.reset();
        setCustomCode("");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL longa</Label>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-card/70 backdrop-blur-sm px-3 shadow-ios-sm focus-within:ring-2 focus-within:ring-ring">
                <Link2 className="size-4 shrink-0 text-muted-foreground" />
                <input
                  id="url"
                  name="url"
                  type="text"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-transparent py-3 text-sm outline-none"
                />
              </div>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? (
                  "Encurtando..."
                ) : (
                  <>
                    Encurtar <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showAdvanced ? "− Opções avançadas" : "+ Opções avançadas"}
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-xl bg-secondary/50 p-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Meu vídeo novo"
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código personalizado (opcional)</Label>
                <div className="flex items-center gap-2 rounded-xl border border-input bg-card/70 backdrop-blur-sm px-3.5 shadow-ios-sm focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground">
                    linkbiobr.com/s/
                  </span>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={customCode}
                    onChange={(e) =>
                      setCustomCode(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 20)
                      )
                    }
                    placeholder="meu-video"
                    className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  3-20 caracteres: letras minúsculas, números e hífens. Se deixar
                  em branco, geramos um código aleatório.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-4" /> Link criado!
              </p>
              <p className="mt-1 font-mono text-xs">
                linkbiobr.com/s/<strong>{success}</strong>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
