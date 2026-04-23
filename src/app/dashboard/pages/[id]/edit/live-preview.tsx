"use client";

import { useMemo, useState } from "react";
import { Monitor, RefreshCcw, Smartphone } from "lucide-react";
import type { Block, BlockData, PageTheme } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";
import { cn } from "@/lib/utils";

export function LivePreview({
  pageId,
  title,
  description,
  avatarUrl,
  coverUrl,
  theme,
  blocks,
  customCss,
  customJs,
}: {
  pageId: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: PageTheme;
  blocks: Block[];
  customCss?: string | null;
  customJs?: string | null;
}) {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");
  const [reloadKey, setReloadKey] = useState(0);

  const previewBlocks = useMemo(
    () =>
      blocks.map((b) => ({
        id: b.id,
        type: b.type,
        data: b.data as BlockData,
        style: b.style,
      })),
    [blocks]
  );

  const scopedCss = useMemo(() => {
    if (!customCss) return "";
    return customCss
      .split(/(?=@[a-z-]+)|}/g)
      .map((chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("@")) return trimmed + (chunk.endsWith("}") ? "" : "}");
        return (
          trimmed.replace(
            /([^{]+)\{/,
            (_, sel) =>
              sel
                .split(",")
                .map((s: string) => `.linkhub-preview-scope ${s.trim()}`)
                .join(", ") + "{"
          ) + (chunk.endsWith("}") ? "" : "}")
        );
      })
      .join("");
  }, [customCss]);

  const time = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, []);

  return (
    <div className="sticky top-0">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Preview ao vivo
        </p>
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-full border border-border bg-card/80 p-0.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setView("mobile")}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                view === "mobile"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Mobile"
            >
              <Smartphone className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("desktop")}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                view === "desktop"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Desktop"
            >
              <Monitor className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex size-7 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
            title="Recarregar preview"
          >
            <RefreshCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-8 -z-10 opacity-60 blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.accent}33 0%, transparent 70%)`,
          }}
        />

        {view === "mobile" ? (
          <PhoneFrame time={time}>
            <PreviewContent
              key={reloadKey}
              pageId={pageId}
              title={title}
              description={description}
              avatarUrl={avatarUrl}
              coverUrl={coverUrl}
              theme={theme}
              previewBlocks={previewBlocks}
              scopedCss={scopedCss}
            />
          </PhoneFrame>
        ) : (
          <DesktopFrame>
            <PreviewContent
              key={reloadKey}
              pageId={pageId}
              title={title}
              description={description}
              avatarUrl={avatarUrl}
              coverUrl={coverUrl}
              theme={theme}
              previewBlocks={previewBlocks}
              scopedCss={scopedCss}
            />
          </DesktopFrame>
        )}
      </div>

      {customJs && (
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-center text-[10px] text-amber-700 dark:text-amber-300">
          JS custom roda só na página pública (não no preview)
        </p>
      )}

      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        Mudanças refletem ao salvar
      </p>
    </div>
  );
}

// ============== PHONE FRAME ==============

function PhoneFrame({
  children,
  time,
}: {
  children: React.ReactNode;
  time: string;
}) {
  return (
    <div className="mx-auto w-[320px]">
      <div
        className="relative rounded-[56px] p-[4px]"
        style={{
          background:
            "linear-gradient(135deg, #6a6a6e 0%, #2d2d30 50%, #444447 100%)",
          boxShadow:
            "0 30px 60px -12px rgba(0,0,0,0.35), 0 18px 30px -12px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-24 h-10 w-1 rounded-l-sm bg-neutral-700" />
        <div className="absolute -left-[3px] top-40 h-16 w-1 rounded-l-sm bg-neutral-700" />
        <div className="absolute -left-[3px] top-60 h-16 w-1 rounded-l-sm bg-neutral-700" />
        <div className="absolute -right-[3px] top-36 h-20 w-1 rounded-r-sm bg-neutral-700" />

        {/* Glass bezel */}
        <div className="relative overflow-hidden rounded-[52px] bg-black p-[6px]">
          {/* Screen */}
          <div className="relative h-[640px] overflow-hidden rounded-[46px] bg-white">
            {/* Status bar */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-2.5 text-[11px] font-semibold">
              <span className="tracking-tight">{time}</span>
              <div className="flex items-center gap-1">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </div>
            </div>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2 z-30 h-[30px] w-[108px] -translate-x-1/2 rounded-full bg-black" />

            {/* Content */}
            <div className="absolute inset-0">{children}</div>

            {/* Subtle screen gloss */}
            <div
              className="pointer-events-none absolute inset-0 z-40 rounded-[46px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.04) 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Reflection below */}
      <div
        className="mx-auto mt-2 h-10 w-[280px] rounded-[50%] opacity-30 blur-md"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ============== DESKTOP FRAME ==============

function DesktopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800"
        style={{ boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}
      >
        {/* macOS title bar */}
        <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-yellow-400" />
          <span className="size-3 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 rounded-md bg-white px-2.5 py-0.5 text-[10px] font-mono text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            linkbiobr.com/sua-pagina
          </div>
        </div>
        <div className="relative h-[600px] overflow-hidden bg-white">
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ============== PREVIEW CONTENT ==============

function PreviewContent({
  pageId,
  title,
  description,
  avatarUrl,
  coverUrl,
  theme,
  previewBlocks,
  scopedCss,
}: {
  pageId: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: PageTheme;
  previewBlocks: { id: string; type: string; data: BlockData }[];
  scopedCss: string;
}) {
  return (
    <>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="linkhub-preview-scope hide-scrollbar scroll-contain h-full w-full overflow-y-auto overflow-x-hidden">
        <ThemedPage
          pageId={pageId}
          title={title || "Seu título"}
          description={description}
          avatarUrl={avatarUrl}
          coverUrl={coverUrl}
          theme={theme}
          blocks={previewBlocks}
          trackEvents={false}
          showAvatarPlaceholder
        />
      </div>
    </>
  );
}

// ============== STATUS BAR ICONS ==============

function SignalIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
      <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
      <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
      <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
      <rect x="10.5" y="1" width="2.5" height="9" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
      <path d="M7 9.5C7.55228 9.5 8 9.05228 8 8.5C8 7.94772 7.55228 7.5 7 7.5C6.44772 7.5 6 7.94772 6 8.5C6 9.05228 6.44772 9.5 7 9.5Z" />
      <path
        d="M4.5 5.5C5.2 4.9 6.1 4.5 7 4.5C7.9 4.5 8.8 4.9 9.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M2 3C3.4 1.8 5.1 1 7 1C8.9 1 10.6 1.8 12 3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="20"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
      <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
      <rect
        x="21.5"
        y="3.5"
        width="1.5"
        height="4"
        rx="0.5"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}
