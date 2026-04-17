"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Page } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { updateAdvanced } from "../../actions";

export function AdvancedForm({ page }: { page: Page }) {
  const [pending, startTransition] = useTransition();
  const [css, setCss] = useState(page.customCss ?? "");
  const [js, setJs] = useState(page.customJs ?? "");

  function save() {
    startTransition(async () => {
      const result = await updateAdvanced(page.id, {
        customCss: css,
        customJs: js,
      });
      if (result?.ok) toast.success("Salvo");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mb-1 size-4" />
          <strong>Uso avançado.</strong> CSS e JS mal escritos podem quebrar
          sua página. Use só se souber o que tá fazendo.
        </div>

        <div className="space-y-2">
          <Label htmlFor="css">CSS custom</Label>
          <Textarea
            id="css"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder={`/* Exemplo:\na { text-transform: uppercase; }\nh1 { letter-spacing: 2px; }\n*/`}
            rows={8}
            className="font-mono text-xs"
            maxLength={20000}
          />
          <p className="text-xs text-muted-foreground">
            É injetado dentro de um{" "}
            <code className="rounded bg-secondary px-1">&lt;style&gt;</code> na
            sua página pública. Sem @import remotos.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="js">JavaScript custom</Label>
          <Textarea
            id="js"
            value={js}
            onChange={(e) => setJs(e.target.value)}
            placeholder={`// Exemplo:\nconsole.log('Minha página carregou');\ndocument.querySelectorAll('a').forEach(a => {\n  a.addEventListener('click', () => console.log(a.href));\n});`}
            rows={8}
            className="font-mono text-xs"
            maxLength={20000}
          />
          <p className="text-xs text-muted-foreground">
            Roda só na sua página pública, depois dos pixels. Sem{" "}
            <code className="rounded bg-secondary px-1">document.write</code>.
          </p>
        </div>

        <Button onClick={save} disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Salvar avançado"}
        </Button>
      </CardContent>
    </Card>
  );
}
