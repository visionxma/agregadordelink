import {
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Search,
  MessageCircle,
  MessageSquare,
  Send,
  Pin,
  Ghost,
  Video,
} from "lucide-react";
import { detectTrafficSource } from "@/lib/traffic-source";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  search: Search,
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  send: Send,
  pin: Pin,
  ghost: Ghost,
  video: Video,
};

export function TrafficSourceList({
  items,
}: {
  items: { referrer: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const src = detectTrafficSource(item.referrer);
        const Icon = ICON_MAP[src.icon];
        const pct = (item.count / max) * 100;

        return (
          <div key={i} className="relative">
            <div
              className="absolute inset-y-0 left-0 rounded-lg bg-primary/10"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg bg-card border border-border ${src.color}`}
                >
                  {Icon ? <Icon className="size-4" /> : <span className="text-base">{src.icon}</span>}
                </span>
                <span className="truncate text-sm font-medium">{src.name}</span>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums">
                {item.count.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
