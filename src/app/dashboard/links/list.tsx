"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2, MousePointerClick, QrCode, Trash2 } from "lucide-react";
import type { ShortLink } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { QRCodeModal } from "@/components/qr-code-modal";
import { deleteShortLink } from "./actions";

export function ShortLinksList({ links }: { links: ShortLink[] }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrTitle, setQrTitle] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (links.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Link2 className="size-5" />
        </div>
        <p className="font-semibold">Nenhum link curto ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cola uma URL acima pra criar seu primeiro.
        </p>
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://linkhub.app";

  function shortUrl(code: string) {
    return `${baseUrl}/s/${code}`;
  }

  function copy(id: string, code: string) {
    navigator.clipboard.writeText(shortUrl(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleDelete(id: string) {
    if (!confirm("Deletar este link? As estatísticas serão perdidas.")) return;
    startTransition(() => deleteShortLink(id));
  }

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-4 shadow-ios-sm transition-shadow hover:shadow-ios"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Link2 className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            {link.title && (
              <p className="truncate text-sm font-semibold">{link.title}</p>
            )}
            <p className="truncate font-mono text-sm text-primary">
              /s/{link.code}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              → {link.url}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MousePointerClick className="size-3.5" />
            <span className="font-semibold tabular-nums">{link.clicks}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copy(link.id, link.code)}
              title="Copiar link"
            >
              {copiedId === link.id ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setQrUrl(shortUrl(link.code));
                setQrTitle(link.title ?? link.code);
              }}
              title="QR code"
            >
              <QrCode className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              onClick={() => handleDelete(link.id)}
              title="Deletar"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <QRCodeModal
        open={!!qrUrl}
        onClose={() => setQrUrl(null)}
        url={qrUrl ?? ""}
        title={qrTitle}
      />
    </div>
  );
}
