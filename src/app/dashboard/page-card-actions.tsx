"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  BarChart3,
  Copy,
  ExternalLink,
  MoreVertical,
  QrCode,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QRCodeModal } from "@/components/qr-code-modal";
import { ModalPortal } from "@/components/ui/modal-portal";
import { deletePage } from "./pages/actions";

export function PageCardActions({
  id,
  slug,
  title,
}: {
  id: string;
  slug: string;
  title: string;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `/${slug}`;

  function openMenu() {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const MENU_W = 192;
    // Align menu's right edge to button's right edge; open upward
    setMenuPos({
      top: rect.top - 6,
      left: Math.max(8, rect.right - MENU_W),
    });
    setMenuOpen(true);
  }

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    function onScroll() {
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [menuOpen]);

  function handleCopyLink() {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
    setMenuOpen(false);
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePage(id);
      } catch {
        // redirect() throws NEXT_REDIRECT — expected
      }
    });
  }

  return (
    <>
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/dashboard/pages/${id}/edit`}>Editar</Link>
        </Button>
        <Button asChild size="icon" variant="outline" title="Abrir página">
          <Link href={`/${slug}`} target="_blank">
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>

        {/* 3-dots menu trigger */}
        <Button
          ref={buttonRef}
          size="icon"
          variant="outline"
          title="Mais opções"
          onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
        >
          <MoreVertical className="size-3.5" />
        </Button>
      </div>

      {/* Dropdown menu — rendered via portal to escape card overflow */}
      {menuOpen && menuPos && (
        <ModalPortal>
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, transform: "translateY(-100%)" }}
            className="z-50 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-ios-lg backdrop-blur-xl animate-slide-up"
          >
            <MenuItem
              onClick={() => {
                setQrOpen(true);
                setMenuOpen(false);
              }}
              icon={<QrCode className="size-3.5" />}
              label="QR Code"
            />
            <MenuItem
              onClick={handleCopyLink}
              icon={<Copy className="size-3.5" />}
              label="Copiar link"
            />
            <Link
              href={`/dashboard/pages/${id}/analytics`}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
              onClick={() => setMenuOpen(false)}
            >
              <BarChart3 className="size-3.5" />
              Analytics
            </Link>
            <div className="border-t border-border/60" />
            <MenuItem
              onClick={() => {
                setConfirmOpen(true);
                setMenuOpen(false);
              }}
              icon={<Trash2 className="size-3.5" />}
              label="Excluir"
              destructive
            />
          </div>
        </ModalPortal>
      )}

      {/* QR modal */}
      <QRCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={url}
        title={title}
      />

      {/* Delete confirmation */}
      {confirmOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-ios-lg">
              <div className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                  <TriangleAlert className="size-6" />
                </div>
                <h3 className="text-xl font-black tracking-[-0.02em]">
                  Excluir "{title}"?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Essa ação é <strong>permanente</strong> e não pode ser desfeita.
                  Ao excluir você perde:
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-destructive" />
                    Todos os blocos e links da página
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-destructive" />
                    Todas as estatísticas e cliques registrados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-destructive" />
                    Respostas de formulários e inscrições
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-destructive" />
                    O link <code className="text-[11px]">linkbiobr.com/{slug}</code> ficará livre para outros
                  </li>
                </ul>
              </div>
              <div className="flex gap-2 border-t border-border bg-secondary/40 p-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmOpen(false)}
                  disabled={pending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  {pending ? "Excluindo..." : "Sim, excluir"}
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

function MenuItem({
  onClick,
  icon,
  label,
  destructive,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors " +
        (destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-secondary/70")
      }
    >
      {icon}
      {label}
    </button>
  );
}
