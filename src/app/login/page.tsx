"use client";

import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  Globe,
  Instagram,
  LayoutTemplate,
  Link2,
  MessageCircle,
  Palette,
  QrCode,
  Scissors,
  Sparkles,
  Youtube,
  ClipboardList,
} from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

type Tag = {
  label: string;
  icon: React.ReactNode;
  delay: string;
  top: string;
  left?: string;
  right?: string;
};

const LEFT_TAGS: Tag[] = [
  { label: "Link na bio",  icon: <Link2 className="size-4" />,        delay: "0s",    top: "10%", left: "5%" },
  { label: "Analytics",   icon: <BarChart3 className="size-4" />,     delay: "0.5s",  top: "24%", left: "3%" },
  { label: "QR Code",     icon: <QrCode className="size-4" />,        delay: "1.0s",  top: "40%", left: "6%" },
  { label: "Formulários", icon: <ClipboardList className="size-4" />, delay: "0.3s",  top: "56%", left: "2%" },
  { label: "Temas",       icon: <Palette className="size-4" />,       delay: "0.8s",  top: "71%", left: "7%" },
  { label: "Encurtador",  icon: <Scissors className="size-4" />,      delay: "0.6s",  top: "86%", left: "4%" },
];

const RIGHT_TAGS: Tag[] = [
  { label: "Templates",      icon: <LayoutTemplate className="size-4" />, delay: "0.2s",  top: "10%", right: "4%" },
  { label: "Domínio próprio",icon: <Globe className="size-4" />,          delay: "0.7s",  top: "24%", right: "2%" },
  { label: "Pagamentos",     icon: <CreditCard className="size-4" />,     delay: "0.4s",  top: "40%", right: "6%" },
  { label: "Instagram",      icon: <Instagram className="size-4" />,      delay: "1.1s",  top: "56%", right: "3%" },
  { label: "YouTube",        icon: <Youtube className="size-4" />,        delay: "0.9s",  top: "71%", right: "7%" },
  { label: "WhatsApp",       icon: <MessageCircle className="size-4" />,  delay: "0.1s",  top: "86%", right: "5%" },
];

function FloatingTag({ label, icon, style, delay }: {
  label: string;
  icon: React.ReactNode;
  style: React.CSSProperties;
  delay: string;
}) {
  return (
    <div
      className="absolute hidden items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-md backdrop-blur-sm lg:flex"
      style={{ ...style, animation: "float 4s ease-in-out infinite", animationDelay: delay }}
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: "linear-gradient(135deg, #84cc16 0%, #a3e635 25%, #d9f99d 55%, #bef264 80%, #84cc16 100%)",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
      `}</style>

      {LEFT_TAGS.map((t) => (
        <FloatingTag key={t.label} label={t.label} icon={t.icon} delay={t.delay} style={{ top: t.top, left: t.left }} />
      ))}
      {RIGHT_TAGS.map((t) => (
        <FloatingTag key={t.label} label={t.label} icon={t.icon} delay={t.delay} style={{ top: t.top, right: t.right }} />
      ))}

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white p-10 shadow-2xl">

          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-5" />
              </span>
              <span className="text-2xl font-black tracking-tight text-foreground">linkhub</span>
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-foreground">
              Bem-vindo ao{" "}
              <span className="text-primary">linkhub.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua página, encurte links e analise tudo num lugar só.
            </p>
          </div>

          <GoogleSignInButton label="Entrar com Google" callbackURL="/dashboard" />

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Ao entrar você concorda com nossos{" "}
            <Link href="/terms" className="font-semibold text-primary hover:underline">Termos</Link>
            {" "}e{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacidade</Link>.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-700">
          Não tem conta?{" "}
          <Link href="/signup" className="font-bold text-gray-900 underline hover:text-primary">
            Criar grátis
          </Link>
        </p>
      </div>
    </main>
  );
}
