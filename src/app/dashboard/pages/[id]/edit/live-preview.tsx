"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Block, BlockData, PageTheme } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";
import { cn } from "@/lib/utils";

// ─── Phone model definitions ──────────────────────────────────────────────────

type CameraStyle = "dynamic-island" | "punch-hole" | "punch-hole-left" | "home-button";

type PhoneModel = {
  id: string;
  label: string;
  frameGradient: string;
  frameBoxShadow: string;
  outerRadius: number;
  bezelPx: number;
  screenRadius: number;
  screenW: number;
  screenH: number;
  camera: CameraStyle;
  topPad: number;
  leftButtons: { top: number; height: number }[];
  rightButtons: { top: number; height: number }[];
  hasHomeButton?: boolean;
};

const MODELS: PhoneModel[] = [
  {
    id: "iphone15",
    label: "iPhone 15",
    frameGradient:
      "linear-gradient(160deg, #b0b0b5 0%, #2d2d30 45%, #555558 75%, #3a3a3d 100%)",
    frameBoxShadow:
      "0 40px 80px -16px rgba(0,0,0,0.5), 0 24px 40px -12px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.3)",
    outerRadius: 58,
    bezelPx: 10,
    screenRadius: 50,
    screenW: 308,
    screenH: 640,
    camera: "dynamic-island",
    topPad: 58,
    leftButtons: [
      { top: 90, height: 32 },
      { top: 140, height: 60 },
      { top: 216, height: 60 },
    ],
    rightButtons: [{ top: 130, height: 76 }],
  },
  {
    id: "iphone-se",
    label: "iPhone SE",
    frameGradient:
      "linear-gradient(160deg, #6e6e72 0%, #1c1c1e 45%, #3a3a3c 75%, #2c2c2e 100%)",
    frameBoxShadow:
      "0 36px 72px -14px rgba(0,0,0,0.55), 0 20px 36px -10px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
    outerRadius: 38,
    bezelPx: 16,
    screenRadius: 8,
    screenW: 272,
    screenH: 548,
    camera: "home-button",
    topPad: 22,
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
      "linear-gradient(160deg, #525265 0%, #14142a 45%, #282838 75%, #1c1c30 100%)",
    frameBoxShadow:
      "0 40px 80px -16px rgba(8,8,36,0.65), 0 24px 40px -12px rgba(8,8,36,0.38), inset 0 1px 0 rgba(120,120,200,0.14), inset 0 -1px 0 rgba(0,0,0,0.4)",
    outerRadius: 52,
    bezelPx: 8,
    screenRadius: 46,
    screenW: 300,
    screenH: 648,
    camera: "punch-hole",
    topPad: 36,
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
      "linear-gradient(160deg, #606472 0%, #1c2035 45%, #2c3050 75%, #222640 100%)",
    frameBoxShadow:
      "0 40px 80px -16px rgba(8,12,40,0.6), 0 24px 40px -12px rgba(8,12,40,0.35), inset 0 1px 0 rgba(130,140,210,0.12), inset 0 -1px 0 rgba(0,0,0,0.35)",
    outerRadius: 56,
    bezelPx: 9,
    screenRadius: 48,
    screenW: 298,
    screenH: 636,
    camera: "punch-hole-left",
    topPad: 36,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const phoneOuterW = model.screenW + model.bezelPx * 2 + 8;
  const phoneOuterH =
    model.screenH + model.bezelPx * 2 + 8 + (model.hasHomeButton ? 52 : 0);
  const totalContentH = phoneOuterH + 92;
  const totalContentW = phoneOuterW;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { height, width } = entry.contentRect;
      const scaleH = (height - 32) / totalContentH;
      const scaleW = (width - 48) / totalContentW;
      setScale(Math.min(scaleH, scaleW, 1));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [totalContentH, totalContentW]);

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
        if (trimmed.startsWith("@"))
          return trimmed + (chunk.endsWith("}") ? "" : "}");
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
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Model picker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginBottom: 20,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "3px 4px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModelId(m.id)}
              style={{
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                transition: "all 0.15s",
                background: modelId === m.id ? "rgba(0,0,0,0.85)" : "transparent",
                color: modelId === m.id ? "#fff" : "rgba(0,0,0,0.45)",
                boxShadow: modelId === m.id ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Ambient glow */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              position: "absolute",
              inset: -60,
              zIndex: -1,
              opacity: 0.45,
              filter: "blur(48px)",
              borderRadius: "50%",
              background: `radial-gradient(circle at 50% 40%, ${theme.accent}55 0%, transparent 65%)`,
              pointerEvents: "none",
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
              topPad={model.topPad}
              screenRadius={model.screenRadius}
            />
          </PhoneFrame>
        </div>

        {customJs && (
          <p
            style={{
              marginTop: 12,
              borderRadius: 10,
              border: "1px solid rgba(245,158,11,0.2)",
              background: "rgba(245,158,11,0.08)",
              padding: "5px 12px",
              fontSize: 10,
              color: "#92400e",
              textAlign: "center",
            }}
          >
            JS custom roda só na página pública
          </p>
        )}
      </div>
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
  const outerH =
    model.screenH + model.bezelPx * 2 + 8 + (model.hasHomeButton ? 52 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
          flexShrink: 0,
        }}
      >
        {/* Thin highlight rim at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            borderRadius: "0 0 50% 50%",
          }}
        />

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
              background: "linear-gradient(180deg, rgba(120,120,124,0.9) 0%, rgba(80,80,84,0.9) 100%)",
              borderRadius: "2px 0 0 2px",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.3)",
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
              background: "linear-gradient(180deg, rgba(120,120,124,0.9) 0%, rgba(80,80,84,0.9) 100%)",
              borderRadius: "0 2px 2px 0",
              boxShadow: "1px 0 2px rgba(0,0,0,0.3)",
            }}
          />
        ))}

        {/* Inner bezel — dark glass */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: model.outerRadius - 4,
            background: "radial-gradient(ellipse at 50% 0%, #2a2a2c, #080808)",
            padding: model.bezelPx - 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            // Force GPU compositing for reliable border-radius clipping
            isolation: "isolate",
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
              flexShrink: 0,
              // Critical: ensures children respect border-radius
              isolation: "isolate",
              willChange: "transform",
            }}
          >
            {/* ── Topbar overlay (fixed, always on top) ── */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: model.topPad,
                zIndex: 50,
                pointerEvents: "none",
              }}
            >
              {/* Frosted glass bg */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backdropFilter: "saturate(180%) blur(16px)",
                  WebkitBackdropFilter: "saturate(180%) blur(16px)",
                  background: "rgba(255,255,255,0.72)",
                  borderBottom: "0.5px solid rgba(0,0,0,0.08)",
                }}
              />

              {/* Time + icons row */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding:
                    model.camera === "home-button" ? "6px 16px 0" : "10px 20px 0",
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#111",
                  }}
                >
                  {time}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#111" }}>
                  <SignalIcon />
                  <WifiIcon />
                  <BatteryIcon />
                </div>
              </div>

              {/* Camera — Dynamic Island */}
              {model.camera === "dynamic-island" && (
                <div
                  style={{
                    position: "absolute",
                    top: 9,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 112,
                    height: 32,
                    borderRadius: 24,
                    background: "#000",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.5)",
                  }}
                />
              )}
              {/* Camera — Punch-hole center */}
              {model.camera === "punch-hole" && (
                <div
                  style={{
                    position: "absolute",
                    top: 11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#000",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 1px 4px rgba(0,0,0,0.4)",
                  }}
                />
              )}
              {/* Camera — Punch-hole left */}
              {model.camera === "punch-hole-left" && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: "calc(50% - 32px)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#000",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 1px 4px rgba(0,0,0,0.4)",
                  }}
                />
              )}
            </div>

            {/* ── Scrollable content ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: model.screenRadius,
                overflow: "hidden",
              }}
            >
              {children}
            </div>

            {/* ── Bottom fade — shows there's more content ── */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 36,
                background: "linear-gradient(to top, rgba(255,255,255,0.55) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 45,
                borderBottomLeftRadius: model.screenRadius,
                borderBottomRightRadius: model.screenRadius,
              }}
            />

            {/* Screen gloss */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: model.screenRadius,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.04) 100%)",
                pointerEvents: "none",
                zIndex: 60,
              }}
            />
          </div>

          {/* Home button */}
          {model.hasHomeButton && (
            <div
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  background:
                    "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.08), rgba(0,0,0,0.2))",
                  boxShadow:
                    "inset 0 1px 3px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ground shadow */}
      <div
        style={{
          width: outerW * 0.7,
          height: 16,
          marginTop: 10,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
          opacity: 0.25,
        }}
      />
    </div>
  );
}

// ─── Preview content ──────────────────────────────────────────────────────────

const SCROLL_STYLE = `
  .phone-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.15) transparent;
  }
  .phone-scroll::-webkit-scrollbar {
    width: 2px;
  }
  .phone-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .phone-scroll::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.15);
    border-radius: 99px;
  }
  .phone-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.28);
  }
`;

function PreviewContent({
  pageId,
  title,
  description,
  avatarUrl,
  coverUrl,
  theme,
  previewBlocks,
  scopedCss,
  topPad,
  screenRadius,
}: {
  pageId: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: PageTheme;
  previewBlocks: { id: string; type: string; data: BlockData; style?: Record<string, unknown> }[];
  scopedCss: string;
  topPad: number;
  screenRadius: number;
}) {
  return (
    <>
      <style>{SCROLL_STYLE}</style>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div
        className="linkhub-preview-scope phone-scroll"
        style={{
          height: "100%",
          width: "100%",
          overflowY: "scroll",
          overflowX: "hidden",
          borderRadius: screenRadius,
        }}
      >
        <div style={{ paddingTop: topPad, paddingBottom: 32 }}>
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
      <path d="M7 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path
        d="M4.5 5.5C5.2 4.9 6.1 4.5 7 4.5c.9 0 1.8.4 2.5 1"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
      <path
        d="M2 3c1.4-1.2 3.1-2 5-2s3.6.8 5 2"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="1.5" y="1.5" width="18" height="9" rx="2" fill="currentColor" />
      <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
