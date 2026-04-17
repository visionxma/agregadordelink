"use client";

import { useEffect, useRef } from "react";
import type { ButtonHover, ClickSound, CursorStyle } from "@/lib/db/schema";

// ============== CURSOR CSS ==============

export function cursorCss(cursor: CursorStyle | undefined): string {
  if (!cursor || cursor === "default") return "auto";
  if (cursor === "pointer") return "pointer";
  const emojiMap: Record<string, string> = {
    sparkle: "✨",
    heart: "❤️",
    fire: "🔥",
    star: "⭐",
  };
  const emoji = emojiMap[cursor];
  if (!emoji) return "auto";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="26" font-size="26">${emoji}</text></svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27");
  return `url('data:image/svg+xml;utf8,${encoded}') 4 4, auto`;
}

// ============== CLICK SOUND ==============

let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext ||
      // @ts-expect-error webkit prefix
      window.webkitAudioContext)();
    return audioCtx;
  } catch {
    return null;
  }
}

export function playClickSound(sound: ClickSound | undefined) {
  if (!sound || sound === "none") return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain).connect(ctx.destination);

  switch (sound) {
    case "pop":
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case "click":
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    case "ding": {
      osc.type = "sine";
      osc.frequency.setValueAtTime(988, now); // B5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      // segunda nota
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2).connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1319, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.1, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);
      break;
    }
    case "tap": {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
}

// ============== TILT BUTTON ==============

export function TiltWrapper({
  children,
  hoverStyle,
}: {
  children: React.ReactNode;
  hoverStyle: ButtonHover;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (hoverStyle === "tilt") {
      const handleMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      };
      const handleLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);
      return () => {
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      };
    }

    if (hoverStyle === "glare") {
      const handleMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.3), transparent 50%)`;
      };
      const handleLeave = () => {
        el.style.background = "";
      };
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);
      return () => {
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      };
    }
  }, [hoverStyle]);

  if (hoverStyle === "none" || hoverStyle === "lift") {
    return <>{children}</>;
  }

  return (
    <div
      ref={ref}
      className="relative transition-transform duration-150"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {hoverStyle === "glare" && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity"
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
