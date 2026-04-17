"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function RealtimeWidget({ pageId }: { pageId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;
    async function poll() {
      try {
        const res = await fetch(`/api/realtime?pageId=${pageId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped) setCount(data.count ?? 0);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [pageId]);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      <span className="relative flex size-2">
        <span
          className={`absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 ${count === 0 ? "opacity-0" : "opacity-75"}`}
        />
        <span
          className={`relative inline-flex size-2 rounded-full ${count > 0 ? "bg-emerald-500" : "bg-neutral-400"}`}
        />
      </span>
      <Eye className="size-3.5" />
      {count === 0 ? (
        <span>Ninguém olhando agora</span>
      ) : (
        <span>
          {count} {count === 1 ? "pessoa olhando" : "pessoas olhando"} agora
        </span>
      )}
    </div>
  );
}
