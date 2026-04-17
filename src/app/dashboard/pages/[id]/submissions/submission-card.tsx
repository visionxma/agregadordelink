"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import type { FormField, FormSubmissionRow } from "@/lib/db/schema";

type Props = {
  submission: FormSubmissionRow;
  fields: FormField[];
  pageTitle: string;
};

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function toWhatsappUrl(phone: string, defaultMessage = ""): string | null {
  const d = digitsOnly(phone);
  if (d.length < 10) return null;
  // Se não vier com código do país, assume Brasil (55) pra números de 10-11 dígitos
  const withCountry = d.length <= 11 ? `55${d}` : d;
  const msg = defaultMessage
    ? `?text=${encodeURIComponent(defaultMessage)}`
    : "";
  return `https://wa.me/${withCountry}${msg}`;
}

export function SubmissionCard({ submission, fields, pageTitle }: Props) {
  const [copied, setCopied] = useState(false);

  // Mapa id → field info
  const fieldMap = new Map(fields.map((f) => [f.id, f]));

  // Encontra primeiro email e primeiro phone na submissão
  const emails: string[] = [];
  const phones: string[] = [];
  for (const [key, value] of Object.entries(submission.data)) {
    const field = fieldMap.get(key);
    const type = field?.type ?? (value.includes("@") ? "email" : "text");
    if (type === "email" && value.includes("@")) emails.push(value);
    if (type === "phone" && digitsOnly(value).length >= 10) phones.push(value);
  }

  const firstEmail = emails[0];
  const firstPhone = phones[0];

  function copyAll() {
    const lines = Object.entries(submission.data).map(([k, v]) => {
      const label = fieldMap.get(k)?.label ?? k;
      return `${label}: ${v}`;
    });
    lines.push(`Enviado em: ${new Date(submission.createdAt).toLocaleString("pt-BR")}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copiado pra área de transferência");
  }

  const whatsappMessage = firstEmail
    ? `Olá! Vi sua resposta no formulário da página "${pageTitle}".`
    : `Olá! Obrigado pela mensagem.`;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {new Date(submission.createdAt).toLocaleString("pt-BR")}
        </p>
        <div className="flex items-center gap-1">
          {firstEmail && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2"
            >
              <a
                href={`mailto:${firstEmail}?subject=${encodeURIComponent(
                  `Re: ${pageTitle}`
                )}`}
              >
                <Mail className="size-3.5" /> Email
              </a>
            </Button>
          )}
          {firstPhone &&
            (() => {
              const url = toWhatsappUrl(firstPhone, whatsappMessage);
              if (!url) return null;
              return (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 px-2 text-emerald-600 hover:text-emerald-700"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon className="size-3.5" /> WhatsApp
                  </a>
                </Button>
              );
            })()}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-2"
            onClick={copyAll}
            title="Copiar tudo"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {Object.entries(submission.data).map(([k, v]) => {
          const field = fieldMap.get(k);
          const label = field?.label ?? k;
          const type = field?.type;
          return (
            <div key={k} className="flex gap-2">
              <span className="shrink-0 font-semibold text-muted-foreground">
                {label}:
              </span>
              {type === "email" && v.includes("@") ? (
                <a
                  href={`mailto:${v}`}
                  className="truncate text-primary hover:underline"
                >
                  {v}
                </a>
              ) : type === "phone" && digitsOnly(v).length >= 10 ? (
                <a
                  href={toWhatsappUrl(v) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline"
                >
                  {v}
                </a>
              ) : (
                <span className="whitespace-pre-wrap break-words">{v}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
