"use client";

import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import type { Page, PageIntegrations } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  FacebookIcon,
  TiktokIcon,
} from "@/components/social-icons";
import { updateIntegrations } from "../../actions";
import { PlanGate } from "@/components/plan-gate";
import type { PlanTier } from "@/lib/db/schema";

type Field = {
  key: keyof PageIntegrations;
  label: string;
  placeholder: string;
  help: string;
  icon: React.ReactNode;
  docsUrl: string;
};

const fields: Field[] = [
  {
    key: "metaPixelId",
    label: "Meta Pixel (Facebook / Instagram)",
    placeholder: "1234567890123456",
    help: "ID numérico de 15-16 dígitos do seu Pixel.",
    icon: <FacebookIcon className="size-5" />,
    docsUrl: "https://business.facebook.com/events_manager2/",
  },
  {
    key: "gaId",
    label: "Google Analytics (GA4)",
    placeholder: "G-XXXXXXXXXX",
    help: "Measurement ID que começa com G-.",
    icon: <span className="text-xl">🅖</span>,
    docsUrl: "https://analytics.google.com/",
  },
  {
    key: "gtmId",
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    help: "Container ID que começa com GTM-.",
    icon: <span className="text-xl">🅖</span>,
    docsUrl: "https://tagmanager.google.com/",
  },
  {
    key: "tiktokPixelId",
    label: "TikTok Pixel",
    placeholder: "CXXXXXXXXXXXXXXXXXXX",
    help: "ID do Pixel do TikTok Events Manager.",
    icon: <TiktokIcon className="size-5" />,
    docsUrl: "https://ads.tiktok.com/",
  },
];

export function IntegrationsForm({ page, planTier = "free" }: { page: Page; planTier?: PlanTier }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<PageIntegrations>({
    metaPixelId: page.integrations.metaPixelId ?? "",
    gaId: page.integrations.gaId ?? "",
    gtmId: page.integrations.gtmId ?? "",
    tiktokPixelId: page.integrations.tiktokPixelId ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateIntegrations(page.id, values);
      if (result?.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <PlanGate
      required="pro"
      currentPlan={planTier}
      label="Pixels e Analytics"
      description="Meta Pixel, GA4, TikTok Pixel e Google Tag Manager"
    >
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
            ℹ️ Pixels são carregados só na página pública, não no editor.
          </div>

          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={f.key} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{f.icon}</span>
                  {f.label}
                </Label>
                <a
                  href={f.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  Painel <ExternalLink className="size-2.5" />
                </a>
              </div>
              <Input
                id={f.key}
                value={(values[f.key] as string) ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                maxLength={32}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{f.help}</p>
            </div>
          ))}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : saved ? "Salvo ✓" : "Salvar integrações"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </PlanGate>
  );
}
