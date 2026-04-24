"use client";

import { useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Page } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateAdvanced } from "../../actions";
import { PlanGate, LockedLabel } from "@/components/plan-gate";
import type { PlanTier } from "@/lib/db/schema";

export function AdvancedForm({ page, planTier = "free" }: { page: Page; planTier?: PlanTier }) {
  const [pending, startTransition] = useTransition();
  const cssRef = useRef<HTMLTextAreaElement>(null);
  const jsRef = useRef<HTMLTextAreaElement>(null);
  const [showRef, setShowRef] = useState(false);

  function save() {
    const css = cssRef.current?.value ?? "";
    const js = jsRef.current?.value ?? "";
    startTransition(async () => {
      const result = await updateAdvanced(page.id, {
        customCss: css,
        customJs: js,
      });
      if (result?.ok) toast.success("Salvo — CSS/JS aplicados na página pública");
      else if (result?.error) toast.error(result.error);
    });
  }

  function insertToCss(snippet: string) {
    if (!cssRef.current) return;
    const current = cssRef.current.value;
    const prefix = current && !current.endsWith("\n") ? "\n\n" : "";
    cssRef.current.value = current + prefix + snippet;
    cssRef.current.focus();
    toast.success("CSS inserido");
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mb-1 size-4" />
          <strong>Uso avançado.</strong> CSS e JS mal escritos podem quebrar
          sua página. Use <code className="rounded bg-amber-500/20 px-1">!important</code>{" "}
          pra sobrescrever as cores do tema.
        </div>

        <button
          type="button"
          onClick={() => setShowRef((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <span className="flex items-center gap-2">
            <Code2 className="size-4" />
            Seletores + exemplos prontos
          </span>
          <span className="text-xs text-muted-foreground">
            {showRef ? "Fechar" : "Abrir"}
          </span>
        </button>
        {showRef && <SelectorReference onInsert={insertToCss} />}

        <PlanGate
          required="pro"
          currentPlan={planTier}
          label="CSS personalizado"
          description="Estilize sua página com código CSS próprio"
        >
        <div className="space-y-2">
          <Label htmlFor="css">
            <LockedLabel required="pro" currentPlan={planTier}>CSS custom</LockedLabel>
          </Label>
          <textarea
            ref={cssRef}
            id="css"
            name="css"
            defaultValue={page.customCss ?? ""}
            placeholder="/* .linkhub-button { text-transform: uppercase !important; } */"
            rows={12}
            maxLength={20000}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Para sobrescrever cores do tema, adicione{" "}
            <code className="rounded bg-secondary px-1">!important</code>.
          </p>
        </div>
        </PlanGate>

        <PlanGate
          required="business"
          currentPlan={planTier}
          label="JavaScript personalizado"
          description="Execute código JS na sua página pública"
        >
        <div className="space-y-2">
          <Label htmlFor="js">
            <LockedLabel required="business" currentPlan={planTier}>JavaScript custom</LockedLabel>
          </Label>
          <textarea
            ref={jsRef}
            id="js"
            name="js"
            defaultValue={page.customJs ?? ""}
            placeholder="// document.querySelectorAll('.linkhub-button')..."
            rows={12}
            maxLength={20000}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Roda na página pública depois dos pixels.
          </p>
        </div>
        </PlanGate>

        <Button onClick={save} disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Salvar avançado"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SelectorReference({
  onInsert,
}: {
  onInsert: (snippet: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Estrutura
        </p>
        <SelectorGroup
          items={[
            { sel: ".linkhub-page", desc: "Container principal" },
            { sel: ".linkhub-cover", desc: "Banner da capa" },
            { sel: ".linkhub-avatar", desc: "Foto de perfil" },
            { sel: ".linkhub-title", desc: "Nome (h1)" },
            { sel: ".linkhub-bio", desc: "Descrição" },
            { sel: ".linkhub-blocks", desc: "Container dos blocos" },
            { sel: ".linkhub-footer", desc: 'Rodapé' },
          ]}
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Blocos
        </p>
        <SelectorGroup
          items={[
            { sel: ".linkhub-block", desc: "Qualquer bloco" },
            { sel: ".linkhub-block-link", desc: "Só blocos link" },
            { sel: ".linkhub-block-text", desc: "Só blocos texto" },
            { sel: ".linkhub-block-image", desc: "Só blocos imagem" },
            { sel: ".linkhub-block-video", desc: "Só blocos vídeo" },
            { sel: ".linkhub-button", desc: "Botões clicáveis" },
          ]}
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Exemplos prontos (clica pra inserir)
        </p>
        <div className="space-y-2">
          <ExampleSnippet
            title="Botões UPPERCASE"
            code={`.linkhub-button {
  text-transform: uppercase !important;
  letter-spacing: 3px !important;
  font-weight: 900 !important;
}`}
            onInsert={onInsert}
          />
          <ExampleSnippet
            title="Avatar girando"
            code={`.linkhub-avatar {
  animation: spin 20s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}`}
            onInsert={onInsert}
          />
          <ExampleSnippet
            title="Título em itálico grande"
            code={`.linkhub-title {
  font-style: italic;
  font-size: 3rem !important;
}`}
            onInsert={onInsert}
          />
          <ExampleSnippet
            title="Botões com borda dupla"
            code={`.linkhub-button {
  border: 3px double currentColor !important;
  border-radius: 9999px !important;
}`}
            onInsert={onInsert}
          />
          <ExampleSnippet
            title="Sombra no hover"
            code={`.linkhub-button:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.25) !important;
  transform: translateY(-4px) scale(1.03) !important;
}`}
            onInsert={onInsert}
          />
          <ExampleSnippet
            title="Esconder rodapé LinkBio BR"
            code={`.linkhub-footer {
  display: none !important;
}`}
            onInsert={onInsert}
          />
        </div>
      </div>
    </div>
  );
}

function SelectorGroup({
  items,
}: {
  items: { sel: string; desc: string }[];
}) {
  return (
    <div className="space-y-1">
      {items.map((i) => (
        <SelectorRow key={i.sel} sel={i.sel} desc={i.desc} />
      ))}
    </div>
  );
}

function SelectorRow({ sel, desc }: { sel: string; desc: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(sel);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
    >
      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-primary">
        {sel}
      </code>
      <span className="flex-1 truncate text-[11px] text-muted-foreground">
        {desc}
      </span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
}

function ExampleSnippet({
  title,
  code,
  onInsert,
}: {
  title: string;
  code: string;
  onInsert: (code: string) => void;
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold">{title}</p>
        <button
          type="button"
          onClick={() => onInsert(code)}
          className="flex shrink-0 items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Inserir
        </button>
      </div>
      <pre className="overflow-x-auto rounded bg-background p-2 font-mono text-[10px] leading-tight">
        {code}
      </pre>
    </div>
  );
}
