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
  abusePending = 0,
}: {
  adminName: string;
  adminEmail: string;
  abusePending?: number;
}) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  const sidebar = (
    <>
      <div className="flex h-14 items-center justify-between gap-2 border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-black">
            ADM
          </span>
          <span className="text-sm font-bold text-zinc-200">LinkBio BR</span>
        </div>
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          className="lg:hidden text-zinc-400 hover:text-zinc-100"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          const isAbuse = href === "/admin/abuse";
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpenMobile(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${active ? "text-emerald-400" : ""}`} />
              <span className="flex-1">{label}</span>
              {isAbuse && abusePending > 0 && (
                <span className="rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-300">
                  {abusePending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-1">
        <div className="px-3 py-2">
          <p className="truncate text-xs font-semibold text-zinc-300">{adminName}</p>
          <p className="truncate text-[10px] text-zinc-500">{adminEmail}</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <ArrowLeftRight className="size-4" /> Voltar ao app
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-zinc-800 bg-zinc-900 lg:flex">
        {sidebar}
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            className="text-zinc-400 hover:text-zinc-100"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-black">
            ADM
          </span>
          <span className="text-sm font-bold text-zinc-200">LinkBio BR</span>
        </div>
        {abusePending > 0 && (
          <Link
            href="/admin/abuse"
            className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300"
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
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}
