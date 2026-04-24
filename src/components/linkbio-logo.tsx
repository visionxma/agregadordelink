import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

const GREEN = "#009c3b";
const YELLOW = "#ffdf00";

// Dois anéis interligados sem fundo — verde + amarelo da paleta
export function LinkBioMark({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 28"
      role="img"
      aria-label="LinkBio"
      className={cn("shrink-0", className)}
      style={{ height: "auto", ...style }}
      {...props}
    >
      <defs>
        <clipPath id="lbm-top">
          <rect x="0" y="0" width="44" height="14" />
        </clipPath>
        <clipPath id="lbm-bot">
          <rect x="0" y="14" width="44" height="14" />
        </clipPath>
      </defs>
      {/* Anel amarelo — metade inferior (atrás do verde) */}
      <circle clipPath="url(#lbm-bot)" cx="32" cy="14" r="10" fill="none" stroke={YELLOW} strokeWidth="6" />
      {/* Anel verde — completo, camada do meio */}
      <circle cx="12" cy="14" r="10" fill="none" stroke={GREEN} strokeWidth="6" />
      {/* Anel amarelo — metade superior (na frente do verde) */}
      <circle clipPath="url(#lbm-top)" cx="32" cy="14" r="10" fill="none" stroke={YELLOW} strokeWidth="6" />
    </svg>
  );
}

type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<LogoSize, { markW: number; text: string; gap: string }> = {
  sm: { markW: 28, text: "text-sm", gap: "gap-1.5" },
  md: { markW: 36, text: "text-base", gap: "gap-2" },
  lg: { markW: 46, text: "text-xl", gap: "gap-2" },
  xl: { markW: 58, text: "text-2xl", gap: "gap-2.5" },
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
      <LinkBioMark width={s.markW} />
      <span className="leading-none">
        <span>Link</span>
        <span style={accentBio ? { color: GREEN } : undefined}>Bio</span>
      </span>
    </span>
  );
}
