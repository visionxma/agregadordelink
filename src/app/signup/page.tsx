"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3, CreditCard, Globe, Instagram,
  LayoutTemplate, Link2, MessageCircle, Palette,
  QrCode, Scissors, Sparkles, Youtube, ClipboardList,
} from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { BrazilFlag } from "@/components/brazil-flag";

type Tag = {
  id: string;
  label: string;
  icon: React.ReactNode;
  delay: string;
  top: string;
  left?: string;
  right?: string;
  side: "left" | "right";
};

const TAGS: Tag[] = [
  { id: "t1",  label: "Link na bio",      icon: <Link2 className="size-4" />,         delay: "0s",   top: "10%", left: "4%",  side: "left" },
  { id: "t2",  label: "Analytics",        icon: <BarChart3 className="size-4" />,      delay: "0.5s", top: "24%", left: "2%",  side: "left" },
  { id: "t3",  label: "QR Code",          icon: <QrCode className="size-4" />,         delay: "1.0s", top: "40%", left: "5%",  side: "left" },
  { id: "t4",  label: "Formulários",      icon: <ClipboardList className="size-4" />,  delay: "0.3s", top: "57%", left: "2%",  side: "left" },
  { id: "t5",  label: "Temas",            icon: <Palette className="size-4" />,        delay: "0.8s", top: "72%", left: "6%",  side: "left" },
  { id: "t6",  label: "Encurtador",       icon: <Scissors className="size-4" />,       delay: "0.6s", top: "87%", left: "4%",  side: "left" },
  { id: "t7",  label: "Templates",        icon: <LayoutTemplate className="size-4" />, delay: "0.2s", top: "10%", right: "4%", side: "right" },
  { id: "t8",  label: "Domínio próprio",  icon: <Globe className="size-4" />,          delay: "0.7s", top: "24%", right: "2%", side: "right" },
  { id: "t9",  label: "Pagamentos",       icon: <CreditCard className="size-4" />,     delay: "0.4s", top: "40%", right: "5%", side: "right" },
  { id: "t10", label: "Instagram",        icon: <Instagram className="size-4" />,      delay: "1.1s", top: "57%", right: "3%", side: "right" },
  { id: "t11", label: "YouTube",          icon: <Youtube className="size-4" />,        delay: "0.9s", top: "72%", right: "7%", side: "right" },
  { id: "t12", label: "WhatsApp",         icon: <MessageCircle className="size-4" />,  delay: "0.1s", top: "87%", right: "5%", side: "right" },
];

type LineData = { d: string; key: string };

function buildLines(
  tagEls: Record<string, HTMLDivElement | null>,
  cardEl: HTMLDivElement | null,
  container: HTMLElement
): LineData[] {
  if (!cardEl) return [];
  const cRect = container.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const cardCx = cardRect.left - cRect.left + cardRect.width / 2;
  const cardTop = cardRect.top - cRect.top;
  const cardBot = cardRect.bottom - cRect.top;

  return Object.entries(tagEls).flatMap(([id, el]) => {
    if (!el) return [];
    const r = el.getBoundingClientRect();
    const tx = r.left - cRect.left + r.width / 2;
    const ty = r.top - cRect.top + r.height / 2;

    const isLeft = tx < cardCx;
    const cardX = isLeft ? cardRect.left - cRect.left : cardRect.right - cRect.left;
    const cardY = Math.max(cardTop, Math.min(cardBot, ty));

    const mx = (tx + cardX) / 2;
    const d = `M ${tx} ${ty} C ${mx} ${ty}, ${mx} ${cardY}, ${cardX} ${cardY}`;
    return [{ d, key: id }];
  });
}

export default function SignupPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<LineData[]>([]);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      setLines(buildLines(tagRefs.current, cardRef.current, containerRef.current));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #e0f2fe 30%, #bae6fd 60%, #38bdf8 85%, #0284c7 100%)",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>

      <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {lines.map((l) => (
          <path
            key={l.key}
            d={l.d}
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="6 4"
          />
        ))}
      </svg>

      {TAGS.map((t) => (
        <div
          key={t.id}
          ref={(el) => { tagRefs.current[t.id] = el; }}
          className="absolute hidden items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-md backdrop-blur-sm lg:flex"
          style={{
            top: t.top,
            ...(t.left ? { left: t.left } : { right: t.right }),
            animation: "float 4s ease-in-out infinite",
            animationDelay: t.delay,
          }}
        >
          <span className="text-blue-500">{t.icon}</span>
          {t.label}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-md">
        <div ref={cardRef} className="rounded-3xl border border-white/60 bg-white p-10 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-5" />
              </span>
              <span className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
                LinkBio <BrazilFlag className="h-6 w-auto" />
              </span>
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-foreground">
              Crie sua conta no{" "}
              <span className="inline-flex items-center gap-1.5 text-primary">
                LinkBio <BrazilFlag className="h-5 w-auto" />
              </span>
              .
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Grátis pra sempre. Pronto em 30 segundos.
            </p>
          </div>

          <GoogleSignInButton label="Criar conta com Google" callbackURL="/onboarding" />

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Ao criar conta você concorda com nossos{" "}
            <Link href="/terms" className="font-semibold text-primary hover:underline">Termos</Link>
            {" "}e{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacidade</Link>.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-blue-900/70">
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-blue-900 underline hover:text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
