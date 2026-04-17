import { useEffect } from "react";

// Trava scroll do body quando o modal tá aberto.
// Evita scroll atrás, pulo de layout e rubber-banding no iOS.
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;
    const scrollBarWidth = window.innerWidth - html.clientWidth;

    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    // Fix mobile: position fixed + top = scrollY mantém a posição visível
    body.style.overflow = "hidden";
    body.style.paddingRight = `${scrollBarWidth}px`;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
