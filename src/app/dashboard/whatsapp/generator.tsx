"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeModal } from "@/components/qr-code-modal";

// Most common country codes for BR users
const COUNTRIES = [
  { code: "55", flag: "🇧🇷", name: "Brasil" },
  { code: "351", flag: "🇵🇹", name: "Portugal" },
  { code: "1", flag: "🇺🇸", name: "EUA / Canadá" },
  { code: "44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "34", flag: "🇪🇸", name: "Espanha" },
  { code: "33", flag: "🇫🇷", name: "França" },
  { code: "49", flag: "🇩🇪", name: "Alemanha" },
  { code: "39", flag: "🇮🇹", name: "Itália" },
  { code: "81", flag: "🇯🇵", name: "Japão" },
  { code: "54", flag: "🇦🇷", name: "Argentina" },
  { code: "56", flag: "🇨🇱", name: "Chile" },
  { code: "52", flag: "🇲🇽", name: "México" },
];

export function WhatsappGenerator() {
  const [country, setCountry] = useState("55");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const fullNumber = `${country}${digits}`;

  const link = useMemo(() => {
    if (!digits) return "";
    const base = `https://wa.me/${fullNumber}`;
    if (message.trim()) {
      return `${base}?text=${encodeURIComponent(message.trim())}`;
    }
    return base;
  }, [digits, fullNumber, message]);

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Form */}
      <div className="space-y-6 rounded-3xl border border-border bg-card/80 p-6 shadow-ios-sm backdrop-blur-xl">
        {/* Country + phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Número do WhatsApp</Label>
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-12 w-32 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} +{c.code}
                </option>
              ))}
            </select>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder={country === "55" ? "11 98765-4321" : "DDD + número"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Digite com DDD. Não precisa colocar 0, (), traço ou espaço.
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="msg">Mensagem pré-preenchida (opcional)</Label>
          <Textarea
            id="msg"
            placeholder="Oi! Vi seu link na bio e..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Aparece quando o usuário abre a conversa.
            </p>
            <p className="text-xs text-muted-foreground">
              {message.length} / 1000
            </p>
          </div>
        </div>

        {/* Quick templates */}
        <div className="space-y-2">
          <Label>Modelos rápidos</Label>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Oi! Vim pelo seu link na bio 👋",
              "Olá! Gostaria de mais informações sobre seus produtos.",
              "Oi, quero agendar um atendimento!",
              "Boa tarde! Pode me ajudar?",
            ].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMessage(t)}
                className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
              >
                {t.slice(0, 32)}{t.length > 32 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview + result */}
      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-ios-sm backdrop-blur-xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Seu link
          </p>
          {link ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="break-all font-mono text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                  {link}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  style={{ background: "#25D366", color: "#fff" }}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <><Check className="size-4" /> Copiado!</>
                  ) : (
                    <><Copy className="size-4" /> Copiar link</>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild size="sm">
                  <a href={link} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" /> Testar
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
                  <QrCode className="size-3.5" /> QR Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <MessageCircle className="size-5" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Digite um número pra gerar o link
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p className="mb-1 font-bold text-foreground">💡 Dica</p>
          Cole esse link no seu Instagram, TikTok ou na sua página LinkBio
          para que clientes entrem em contato com uma mensagem já pronta —
          sem precisar salvar seu número.
        </div>
      </aside>

      <QRCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={link || "https://wa.me"}
        title={`WhatsApp ${fullNumber ? `+${fullNumber}` : ""}`}
      />
    </div>
  );
}
