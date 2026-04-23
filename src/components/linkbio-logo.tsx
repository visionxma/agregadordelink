import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

// Brasil — cores oficiais
const GREEN = "#009c3b";
const YELLOW = "#ffdf00";
const BLUE = "#002776";

// Mark: losango amarelo da bandeira com cantos levemente suavizados,
// círculo azul central com um símbolo de link em branco. Tudo dentro de
// um quadrado verde arredondado — Brasil + serviço de link numa só peça.
export function LinkBioMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      role="img"
      aria-label="LinkBio BR"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* fundo verde arredondado */}
      <rect width="40" height="40" rx="10" ry="10" fill={GREEN} />
      {/* losango amarelo (cantos suavizados com path) */}
      <path
        d="M20 5.5 L33.8 20 L20 34.5 L6.2 20 Z"
        fill={YELLOW}
        stroke={YELLOW}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* círculo azul central */}
      <circle cx="20" cy="20" r="6.6" fill={BLUE} />
      {/* símbolo de link em branco dentro do círculo */}
      <g
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M17.6 22.4 L22.4 17.6" />
        <path d="M18.1 24.4 A2.6 2.6 0 0 1 15.6 21.9 L17 20.5" />
        <path d="M21.9 15.6 A2.6 2.6 0 0 1 24.4 18.1 L23 19.5" />
      </g>
    </svg>
  );
}

// Logo completa: mark + texto "LinkBio" com "Bio" no verde da bandeira.
// A integração das formas acontece pelas cores compartilhadas (verde no
// texto casa com o mark) e pelo losango/círculo que já remete à bandeira
// sem precisar de uma bandeira separada no final.
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
