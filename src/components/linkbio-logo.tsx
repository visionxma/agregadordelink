import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

const GREEN = "#009c3b";
const YELLOW = "#ffdf00";

export function LinkBioMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      role="img"
      aria-label="LinkBio"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* fundo verde */}
      <rect width="40" height="40" rx="10" ry="10" fill={GREEN} />
      {/* ícone de corrente/link em amarelo */}
      <g stroke={YELLOW} strokeWidth="3" strokeLinecap="round" fill="none">
        {/* anel esquerdo */}
        <path d="M14 23 A5 5 0 0 1 14 17 L18 17" />
        <path d="M14 23 L18 23" />
        {/* anel direito */}
        <path d="M26 17 A5 5 0 0 1 26 23 L22 23" />
        <path d="M26 17 L22 17" />
        {/* barra central */}
        <line x1="16" y1="20" x2="24" y2="20" />
      </g>
    </svg>
  );
}

type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<
  LogoSize,
  { mark: number; text: string; gap: string }
> = {
  sm: { mark: 22, text: "text-sm", gap: "gap-1.5" },
  md: { mark: 28, text: "text-base", gap: "gap-2" },
  lg: { mark: 36, text: "text-xl", gap: "gap-2" },
  xl: { mark: 44, text: "text-2xl", gap: "gap-2.5" },
};

export function LinkBioLogo({
  size = "md",
  className,
  accentBio = true,
}: {
  size?: LogoSize;
  className?: string;
  accentBio?: boolean;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "inline-flex items-center font-black tracking-tight text-foreground",
        s.gap,
        s.text,
        className
      )}
    >
      <LinkBioMark width={s.mark} height={s.mark} />
      <span className="leading-none">
        <span>Link</span>
        <span style={accentBio ? { color: GREEN } : undefined}>Bio</span>
      </span>
    </span>
  );
}
