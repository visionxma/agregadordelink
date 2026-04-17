"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  Check,
  Copy,
  Download,
  Mail,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TwitchIcon,
  WhatsappIcon,
  XIcon,
  TelegramIcon,
} from "@/components/social-icons";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export function QRCodeModal({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
    if (!open) setCopied(false);
  }, [open]);

  useBodyScrollLock(open);

  if (!open) return null;

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${encodeURIComponent(title || "linkhub")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadSvg() {
    const svg = document.getElementById("qr-svg-for-download");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `qr-${encodeURIComponent(title || "linkhub")}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function copyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: title ?? "LinkHub",
        text: title ? `Acessa meu link: ${title}` : "Confere meu link",
        url,
      });
    } catch {
      // user cancelou
    }
  }

  const shareText = encodeURIComponent(
    title ? `Acessa meu link: ${title}` : "Confere meu link"
  );
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
      icon: <WhatsappIcon className="size-4" />,
      color: "#25d366",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      icon: <XIcon className="size-4" />,
      color: "#000000",
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
      icon: <TelegramIcon className="size-4" />,
      color: "#26a5e4",
    },
    {
      name: "Email",
      href: `mailto:?subject=${shareText}&body=${encodedUrl}`,
      icon: <Mail className="size-4" />,
      color: "#0a0a0a",
    },
  ];

  // Instagram Stories / TikTok não aceitam URL sharing pela web.
  // Orientamos o usuário a baixar o QR e postar manualmente.

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-8">
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-background shadow-ios-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-bold">Compartilhar</h2>
            {title && (
              <p className="truncate text-xs text-muted-foreground">
                {title}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>

        <div className="p-6 text-center">
          <div
            ref={canvasRef}
            className="relative mx-auto flex size-56 items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-ios-sm"
          >
            <QRCodeCanvas
              value={url}
              size={192}
              level="H"
              marginSize={0}
              fgColor="#0a0a0a"
              bgColor="#ffffff"
            />
          </div>
          <div className="hidden">
            <QRCodeSVG
              id="qr-svg-for-download"
              value={url}
              size={512}
              level="H"
              marginSize={1}
              fgColor="#0a0a0a"
              bgColor="#ffffff"
            />
          </div>

          <button
            type="button"
            onClick={copyUrl}
            className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary/70"
          >
            <span className="truncate font-mono text-xs">{url}</span>
            {copied ? (
              <Check className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <Copy className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>

          {/* Share nativo (mobile) */}
          {canShare && (
            <Button
              onClick={nativeShare}
              className="mt-3 w-full"
              variant="outline"
            >
              <Share2 className="size-4" />
              Compartilhar
            </Button>
          )}

          {/* Share por rede */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Enviar pra
            </p>
            <div className="grid grid-cols-4 gap-2">
              {shareLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-2 transition-all hover:-translate-y-0.5 hover:shadow-ios-sm"
                  title={s.name}
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                  </span>
                  <span className="text-[10px] font-medium">{s.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Download buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
            <Button variant="ghost" size="sm" onClick={downloadPng}>
              <Download className="size-3.5" /> PNG
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadSvg}>
              <Download className="size-3.5" /> SVG
            </Button>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Dica: baixa o PNG pra postar em Stories ou TikTok
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

// suprime warning de import não utilizado
void TwitchIcon;
