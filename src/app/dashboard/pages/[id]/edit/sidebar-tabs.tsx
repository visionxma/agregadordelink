"use client";

import { useState } from "react";
import { Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  badge?: "pro" | "business";
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
              "relative rounded-xl px-3 py-2 text-xs font-semibold transition-all",
              active === t.id
                ? "bg-card text-foreground shadow-ios-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {t.badge === "pro" && (
              <Star className="absolute -right-0.5 -top-0.5 size-2.5 fill-amber-400 text-amber-400" />
            )}
            {t.badge === "business" && (
              <Crown className="absolute -right-0.5 -top-0.5 size-2.5 fill-purple-500 text-purple-500" />
            )}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
