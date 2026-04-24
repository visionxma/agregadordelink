"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { LinkBioLogo } from "@/components/linkbio-logo";

const COUNTDOWN_SECONDS = 7;

export function AdInterstitial({
  url,
  title,
}: {
  url: string;
  title: string | null;
}) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (remaining <= 0) {
      window.location.replace(url);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, url]);

  const hostname = safeHostname(url);
  const progress = ((COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS) * 100;

  return (
    <main className="ambient-bg flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <LinkBioLogo size="sm" />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Link seguro
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Info card */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-ios">
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Você será redirecionado para
              </p>
              {title && (
                <h1 className="mt-1 truncate text-lg font-black tracking-[-0.02em] sm:text-xl">
                  {title}
                </h1>
              )}
              <p className="mt-1 flex items-center gap-1.5 truncate font-mono text-xs text-primary">
                <ExternalLink className="size-3.5 shrink-0" />
                {hostname}
              </p>
            </div>

            {/* Countdown bar */}
            <div className="border-t border-border bg-secondary/40 px-5 py-3 sm:px-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  {remaining > 0 ? (
                    <>
                      Redirecionando em{" "}
                      <span className="font-black text-primary tabular-nums">
                        {remaining}s
                      </span>
                    </>
                  ) : (
                    "Redirecionando..."
                  )}
                </span>
                <a
                  href={url}
                  className="text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Ir agora →
                </a>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ad slot */}
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden">
            <p className="border-b border-border/60 bg-secondary/30 px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Publicidade
            </p>
            <div className="flex min-h-[250px] items-center justify-center p-4">
              {/* Google AdSense slot — configure NEXT_PUBLIC_ADSENSE_CLIENT + SLOT */}
              <AdSlot />
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Powered by{" "}
            <a
              href="/"
              className="font-semibold text-primary hover:underline"
            >
              linkbiobr.com
            </a>{" "}
            · Crie seu próprio link com anúncios monetizados
          </p>
        </div>
      </section>
    </main>
  );
}

function AdSlot() {
  // Script is loaded globally from src/app/layout.tsx
  const client =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-1736873321168592";
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  useEffect(() => {
    if (!slot) return;
    try {
      // @ts-expect-error — injected by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  if (!slot) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ExternalLink className="size-4" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          Anúncio em aprovação
        </p>
        <p className="px-6 text-[10px] text-muted-foreground/70">
          Assim que o Google AdSense aprovar sua conta e você configurar{" "}
          <code>NEXT_PUBLIC_ADSENSE_SLOT</code>, o anúncio aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight: 250 }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
