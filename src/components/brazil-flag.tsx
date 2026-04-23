import type { SVGProps } from "react";

// Bandeira do Brasil simplificada — verde, losango amarelo e círculo azul.
// Proporção oficial 10:7 (1.43). Usada como "BR" no logo do LinkBio BR.
export function BrazilFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 20"
      width="1.4em"
      height="1em"
      aria-label="Brasil"
      role="img"
      {...props}
    >
      <rect width="28" height="20" fill="#009c3b" rx="2" />
      <polygon points="14,3 24.4,10 14,17 3.6,10" fill="#ffdf00" />
      <circle cx="14" cy="10" r="3.8" fill="#002776" />
    </svg>
  );
}
