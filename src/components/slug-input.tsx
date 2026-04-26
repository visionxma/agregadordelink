"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn, slugify } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; slug: string }
  | { kind: "error"; message: string };

export function SlugInput({
  name = "slug",
  value,
  onChange,
  placeholder = "meu-link",
  required = true,
  ignorePageId,
}: {
  name?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  ignorePageId?: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!value || value.length < 2) {
      setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "checking" });

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const url = `/api/slug-check?slug=${encodeURIComponent(value)}${ignorePageId ? `&ignorePageId=${encodeURIComponent(ignorePageId)}` : ""}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (data.valid && data.available) {
          setStatus({ kind: "ok", slug: data.slug });
        } else {
          setStatus({ kind: "error", message: data.error ?? "Slug inválido" });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStatus({ kind: "idle" });
        }
      }
    }, 400);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, ignorePageId]);

  const ringClass =
    status.kind === "ok"
      ? "border-emerald-500 focus-within:ring-emerald-500"
      : status.kind === "error"
        ? "border-destructive focus-within:ring-destructive"
        : "focus-within:ring-ring";

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-input bg-card/70 backdrop-blur-sm px-3.5 py-1 shadow-ios-sm transition-colors focus-within:ring-2",
          ringClass
        )}
      >
        <span className="text-sm text-muted-foreground">linkbiobr.com/</span>
        <input
          name={name}
          required={required}
          minLength={2}
          maxLength={40}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(slugify(e.target.value))}
          className="flex-1 bg-transparent py-2 text-sm outline-none"
        />
        <StatusIcon status={status} />
      </div>
      {status.kind === "error" && (
        <p className="text-xs text-destructive">{status.message}</p>
      )}
      {status.kind === "ok" && (
        <p className="text-xs text-emerald-600">Disponível ✓</p>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status.kind === "checking") {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  }
  if (status.kind === "ok") {
    return <Check className="size-4 text-emerald-500" />;
  }
  if (status.kind === "error") {
    return <X className="size-4 text-destructive" />;
  }
  return null;
}
