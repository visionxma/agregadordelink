"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  ShieldAlert,
  ArrowLeftRight,
  Menu,
  X,
} from "lucide-react";
import { LinkBioLogo } from "@/components/linkbio-logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/pages", label: "Páginas", icon: FileText },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/abuse", label: "Denúncias", icon: ShieldAlert },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({
  adminName,
  adminEmail,
  adminImage,
  abusePending = 0,
}: {
  adminName: string;
  adminEmail: string;
  adminImage?: string | null;
  abusePending?: number;
}) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border/60 px-4">
        <div className="flex items-center gap-2">
          <LinkBioLogo size="sm" />
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black tracking-wider text-primary-foreground shadow-ios-sm">
            ADM
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          const isAbuse = href === "/admin/abuse";
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpenMobile(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-primary/10 font-semibold text-primary shadow-ios-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="flex-1">{label}</span>
              {isAbuse && abusePending > 0 && (
                <span className="rounded-full bg-destructive/15 px-1.5 text-[10px] font-bold text-destructive">
                  {abusePending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3 space-y-1">
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-2">
          {adminImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={adminImage} alt="" className="size-7 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
              {adminName?.[0]?.toUpperCase() ?? "A"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{adminName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{adminEmail}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeftRight className="size-4" /> Voltar ao app
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl lg:flex">
        {sidebar}
      </aside>

      {/* Mobile topbar */}
      <header className="glass-nav sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <LinkBioLogo size="sm" />
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">
            ADM
          </span>
        </div>
        {abusePending > 0 && (
          <Link
            href="/admin/abuse"
            className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive"
          >
            {abusePending} denúncias
          </Link>
        )}
      </header>

      {/* Mobile drawer */}
      {openMobile && (
        <>
          <div
            onClick={() => setOpenMobile(false)}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card shadow-ios-lg lg:hidden">
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}
