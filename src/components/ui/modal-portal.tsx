"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Renderiza o conteúdo em document.body. Isso evita que ancestrais com
// backdrop-filter / transform / sticky prendam o `position: fixed` do modal
// dentro de alguma coluna — especialmente no editor, onde o painel de
// customização usa backdrop-blur.
export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
