"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function SidebarTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1 rounded-2xl bg-secondary/80 backdrop-blur p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-semibold transition-all",
              active === t.id
                ? "bg-card text-foreground shadow-ios-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
