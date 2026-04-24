"use client";

import { useMemo, useState } from "react";
import type { Block, BlockData, PageTheme } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";
import { cn } from "@/lib/utils";

// ─── Phone model definitions ──────────────────────────────────────────────────

type CameraStyle = "dynamic-island" | "punch-hole" | "punch-hole-left" | "home-button";

type PhoneModel = {
  id: string;
  label: string;
  // Outer frame
  frameGradient: string;
  frameBoxShadow: string;
  outerRadius: number;
  bezelPx: number;          // bezel between outer shell and screen
  // Screen
  screenRadius: number;
  screenW: number;
  screenH: number;
  // Camera
  camera: CameraStyle;
  // Side buttons positions (top offsets)
  leftButtons: { top: number; height: number }[];
  rightButtons: { top: number; height: number }[];
  // Optional home button at bottom
  hasHomeButton?: boolean;
};

const MODELS: PhoneModel[] = [
  {
    id: "iphone15",
    label: "iPhone 15",
    frameGradient:
      "linear-gradient(145deg, #a0a0a5 0%, #2d2d30 40%, #5a5a5e 70%, #3a3a3d 100%)",
    frameBoxShadow:
      "0 32px 64px -12px rgba(0,0,0,0.45), 0 20px 32px -12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
    outerRadius: 58,
    bezelPx: 10,
    screenRadius: 50,
    screenW: 308,
    screenH: 640,
    camera: "dynamic-island",
    leftButtons: [
      { top: 90, height: 32 },
      { top: 140, height: 60 },
      { top: 215, height: 60 },
    ],
    rightButtons: [{ top: 130, height: 76 }],
  },
  {
    id: "iphone-se",
    label: "iPhone SE",
    frameGradient:
      "linear-gradient(145deg, #636366 0%, #1c1c1e 40%, #3a3a3c 70%, #2c2c2e 100%)",
    frameBoxShadow:
      "0 28px 56px -10px rgba(0,0,0,0.5), 0 16px 28px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    outerRadius: 38,
    bezelPx: 16,
    screenRadius: 8,
    screenW: 272,
    screenH: 548,
    camera: "home-button",
    leftButtons: [
      { top: 80, height: 28 },
      { top: 122, height: 52 },
      { top: 186, height: 52 },
    ],
    rightButtons: [{ top: 110, height: 60 }],
    hasHomeButton: true,
  },
  {
    id: "galaxy-s24",
    label: "Galaxy S24",
    frameGradient:
      "linear-gradient(145deg, #4a4a5a 0%, #16162a 40%, #2a2a3e 70%, #1e1e32 100%)",
    frameBoxShadow:
      "0 32px 64px -12px rgba(10,10,40,0.6), 0 20px 32px -12px rgba(10,10,40,0.35), inset 0 1px 0 rgba(100,100,200,0.12)",
    outerRadius: 52,
    bezelPx: 8,
    screenRadius: 46,
    screenW: 300,
    screenH: 648,
    camera: "punch-hole",
    leftButtons: [{ top: 150, height: 68 }],
    rightButtons: [
      { top: 110, height: 40 },
      { top: 160, height: 68 },
    ],
  },
  {
    id: "pixel-8",
    label: "Pixel 8",
    frameGradient:
      "linear-gradient(145deg, #5a5e6e 0%, #1e2132 40%, #2e3148 70%, #242740 100%)",
    frameBoxShadow:
      "0 30px 60px -12px rgba(10,15,40,0.55), 0 18px 30px -12px rgba(10,15,40,0.3), inset 0 1px 0 rgba(120,130,200,0.1)",
    outerRadius: 56,
    bezelPx: 9,
    screenRadius: 48,
    screenW: 298,
    screenH: 636,
    camera: "punch-hole-left",
    leftButtons: [{ top: 175, height: 72 }],
    rightButtons: [
      { top: 120, height: 36 },
      { top: 168, height: 72 },
    ],
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

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
  const [modelId, setModelId] = useState("iphone15");
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0]!;

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
    <div className="flex flex-col items-center">
      {/* Model picker */}
      <div className="mb-5 flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 backdrop-blur-sm shadow-ios-sm">
        {MODELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModelId(m.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
              modelId === m.id
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Ambient glow */}
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-10 -z-10 opacity-50 blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${theme.accent}44 0%, transparent 65%)`,
          }}
        />

        <PhoneFrame model={model} time={time}>
          <PreviewContent
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
      </div>

      {customJs && (
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-center text-[10px] text-amber-700 dark:text-amber-300">
          JS custom roda só na página pública
        </p>
      )}
    </div>
  );
}

// ─── Phone frame ──────────────────────────────────────────────────────────────

function PhoneFrame({
  model,
  time,
  children,
}: {
  model: PhoneModel;
  time: string;
  children: React.ReactNode;
}) {
  const outerW = model.screenW + model.bezelPx * 2 + 8;
  const outerH = model.screenH + model.bezelPx * 2 + 8 + (model.hasHomeButton ? 52 : 0);

  return (
    <div className="flex flex-col items-center">
      {/* Outer shell */}
      <div
        style={{
          width: outerW,
          height: outerH,
          borderRadius: model.outerRadius,
          background: model.frameGradient,
          boxShadow: model.frameBoxShadow,
          padding: 4,
          position: "relative",
        }}
      >
        {/* Side buttons — left */}
        {model.leftButtons.map((btn, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -3,
              top: btn.top,
              width: 3,
              height: btn.height,
              background: "rgba(100,100,104,0.9)",
              borderRadius: "2px 0 0 2px",
            }}
          />
        ))}

        {/* Side buttons — right */}
        {model.rightButtons.map((btn, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: -3,
              top: btn.top,
              width: 3,
              height: btn.height,
              background: "rgba(100,100,104,0.9)",
              borderRadius: "0 2px 2px 0",
            }}
          />
        ))}

        {/* Inner bezel */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: model.outerRadius - 4,
            background: "#0a0a0a",
            padding: model.bezelPx - 4,
            overflow: "hidden",
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: model.screenW,
              height: model.screenH,
              borderRadius: model.screenRadius,
              background: "#fff",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Status bar */}
            <div
              className="absolute inset-x-0 top-0 z-20 flex items-center justify-between"
              style={{
                padding: model.camera === "home-button" ? "6px 14px" : "10px 18px 4px",
                color: "#000",
              }}
            >
              <span className="text-[10px] font-semibold tracking-tight">{time}</span>
              <div className="flex items-center gap-1 text-black">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </div>
            </div>

            {/* Camera cutout */}
            {model.camera === "dynamic-island" && (
              <div
                className="absolute z-30"
                style={{
                  top: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 110,
                  height: 30,
                  borderRadius: 20,
                  background: "#000",
                }}
              />
            )}

            {model.camera === "punch-hole" && (
              <div
                className="absolute z-30"
                style={{
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#000",
                }}
              />
            )}

            {model.camera === "punch-hole-left" && (
              <div
                className="absolute z-30"
                style={{
                  top: 13,
                  left: "50%",
                  transform: "translateX(-30px)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#000",
                }}
              />
            )}

            {/* Content scrollable area */}
            <div className="absolute inset-0">
              {children}
            </div>

            {/* Screen gloss */}
            <div
              className="pointer-events-none absolute inset-0 z-40"
              style={{
                borderRadius: model.screenRadius,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 100%)",
              }}
            />
          </div>

          {/* Home button area for iPhone SE */}
          {model.hasHomeButton && (
            <div className="flex items-center justify-center" style={{ height: 52 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Shadow reflection */}
      <div
        style={{
          width: outerW * 0.85,
          height: 20,
          marginTop: 8,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.35,
        }}
      />
    </div>
  );
}

// ─── Preview content ──────────────────────────────────────────────────────────

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
  previewBlocks: { id: string; type: string; data: BlockData; style?: Record<string, unknown> }[];
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

// ─── Status bar icons ─────────────────────────────────────────────────────────

function SignalIcon() {
  return (
    <svg width="15" height="10" viewBox="0 0 16 10" fill="currentColor">
      <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
      <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
      <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
      <rect x="10.5" y="1" width="2.5" height="9" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 14 10" fill="currentColor">
      <path d="M7 9.5C7.55228 9.5 8 9.05228 8 8.5C8 7.94772 7.55228 7.5 7 7.5C6.44772 7.5 6 7.94772 6 8.5C6 9.05228 6.44772 9.5 7 9.5Z" />
      <path d="M4.5 5.5C5.2 4.9 6.1 4.5 7 4.5C7.9 4.5 8.8 4.9 9.5 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M2 3C3.4 1.8 5.1 1 7 1C8.9 1 10.6 1.8 12 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="23" height="11" viewBox="0 0 24 11" fill="none">
      <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
      <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
