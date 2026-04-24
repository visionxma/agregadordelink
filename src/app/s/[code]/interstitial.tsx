"use client";

import { useEffect, useRef, useState } from "react";
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
              <MonotagBanner />
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

function MonotagBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const script = document.createElement("script");
    script.dataset.zone = "10921578";
    script.src = "https://nap5k.com/tag.min.js";
    container.appendChild(script);
    return () => {
      if (container.contains(script)) container.removeChild(script);
    };
  }, []);

  return <div ref={ref} className="w-full min-h-[250px]" />;
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
