"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const LEFT_TAGS = [
  { label: "Link na bio", icon: "🔗", delay: "0s", top: "12%", left: "4%" },
  { label: "Analytics", icon: "📊", delay: "0.4s", top: "28%", left: "2%" },
  { label: "QR Code", icon: "⬛", delay: "0.8s", top: "45%", left: "6%" },
  { label: "Formulários", icon: "📋", delay: "0.3s", top: "62%", left: "3%" },
  { label: "Temas", icon: "🎨", delay: "1.1s", top: "76%", left: "8%" },
  { label: "Encurtador", icon: "✂️", delay: "0.6s", top: "88%", left: "5%" },
];

const RIGHT_TAGS = [
  { label: "Templates", icon: "✨", delay: "0.2s", top: "10%", right: "4%" },
  { label: "Domínio próprio", icon: "🌐", delay: "0.7s", top: "24%", right: "2%" },
  { label: "Stripe", icon: "💳", delay: "0.5s", top: "39%", right: "5%" },
  { label: "Instagram", icon: "📸", delay: "1.0s", top: "54%", right: "3%" },
  { label: "YouTube", icon: "▶️", delay: "0.9s", top: "68%", right: "7%" },
  { label: "WhatsApp", icon: "💬", delay: "0.1s", top: "82%", right: "4%" },
];

function FloatingTag({
  label,
  icon,
  style,
  delay,
}: {
  label: string;
  icon: string;
  style: React.CSSProperties;
  delay: string;
}) {
  return (
    <div
      className="absolute hidden items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-sm font-semibold text-foreground shadow-ios-sm backdrop-blur-sm lg:flex"
      style={{ ...style, animation: `float 4s ease-in-out infinite`, animationDelay: delay }}
    >
      <span>{icon}</span>
      {label}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: "linear-gradient(135deg, #99CFFF 0%, #c8e8ff 40%, #e0f0ff 70%, #99CFFF 100%)",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Tags flutuantes esquerda */}
      {LEFT_TAGS.map((tag) => (
        <FloatingTag
          key={tag.label}
          label={tag.label}
          icon={tag.icon}
          delay={tag.delay}
          style={{ top: tag.top, left: tag.left }}
        />
      ))}

      {/* Tags flutuantes direita */}
      {RIGHT_TAGS.map((tag) => (
        <FloatingTag
          key={tag.label}
          label={tag.label}
          icon={tag.icon}
          delay={tag.delay}
          style={{ top: tag.top, right: (tag as any).right }}
        />
      ))}

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white/95 p-10 shadow-ios-lg backdrop-blur-xl">

          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-ios-glow">
                <Sparkles className="size-5" />
              </span>
              <span className="text-2xl font-black tracking-tight text-foreground">
                linkhub
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-foreground">
              Bem-vindo ao{" "}
              <span className="text-primary">linkhub.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua página, encurte links e analise tudo num lugar só.
            </p>
          </div>

          {/* Google Button */}
          <GoogleSignInButton label="Entrar com Google" callbackURL="/dashboard" />

          {/* Terms */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Ao entrar, você concorda com nossos{" "}
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              Privacidade
            </Link>
            .
          </p>
        </div>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-foreground/70">
          Não tem conta?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Criar grátis
          </Link>
        </p>
      </div>
    </main>
  );
}
