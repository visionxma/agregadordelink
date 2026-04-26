import Link from "next/link";
import { LayoutDashboard, Users, FileText, CreditCard, Settings, LogOut } from "lucide-react";
import { requireAdmin } from "./lib";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/pages", label: "Páginas", icon: FileText },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-black">ADM</span>
          <span className="text-sm font-bold text-zinc-200">LinkBio BR</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-3 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <LogOut className="size-4" /> Sair do Admin
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 pl-56">
        <div className="min-h-screen p-8">{children}</div>
      </div>
    </div>
  );
}
