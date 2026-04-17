import type { PageTheme, ThemeBackground } from "@/lib/db/schema";
import { fontCssVarMap } from "@/lib/fonts";
import { cn } from "@/lib/utils";

function bg(b: ThemeBackground): React.CSSProperties {
  if (b.type === "solid") return { background: b.color };
  if (b.type === "gradient") {
    const dir = {
      "to-br": "to bottom right",
      "to-bl": "to bottom left",
      "to-tr": "to top right",
      "to-tl": "to top left",
      "to-r": "to right",
      "to-b": "to bottom",
    }[b.direction];
    const stops = b.via ? `${b.from}, ${b.via}, ${b.to}` : `${b.from}, ${b.to}`;
    return { background: `linear-gradient(${dir}, ${stops})` };
  }
  return {
    backgroundImage: `url(${b.url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function ThemeThumbnail({
  theme,
  label,
  className,
}: {
  theme: PageTheme;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-44 w-full flex-col items-center justify-center overflow-hidden rounded-xl px-4 py-5",
        className
      )}
      style={{
        ...bg(theme.background),
        color: theme.foreground,
        fontFamily: fontCssVarMap[theme.font],
      }}
    >
      <div
        className="mb-2 size-8 rounded-full bg-white/30"
        style={
          theme.avatarShape === "square"
            ? { borderRadius: 0 }
            : theme.avatarShape === "rounded"
              ? { borderRadius: "8px" }
              : {}
        }
      />
      <div
        className="text-xs font-bold leading-tight"
        style={{ fontFamily: fontCssVarMap[theme.titleFont ?? theme.font] }}
      >
        {label ?? "Preview"}
      </div>
      <div
        className="mt-3 w-3/4 py-1 text-center text-[10px] font-medium"
        style={miniButton(theme)}
      >
        Link um
      </div>
      <div
        className="mt-1.5 w-3/4 py-1 text-center text-[10px] font-medium"
        style={miniButton(theme)}
      >
        Link dois
      </div>
    </div>
  );
}

function miniButton(theme: PageTheme): React.CSSProperties {
  const s = theme.buttonStyle;
  const base: React.CSSProperties = {};
  if (s === "pill") base.borderRadius = "9999px";
  else if (s === "sharp") base.borderRadius = "0";
  else if (s === "neubrutalism") {
    base.borderRadius = "0";
    base.border = `2px solid ${theme.foreground}`;
    base.boxShadow = `3px 3px 0 ${theme.foreground}`;
  } else if (s === "glass") {
    base.borderRadius = "8px";
    base.border = "1px solid rgba(255,255,255,0.3)";
    base.background = "rgba(255,255,255,0.15)";
    return { ...base, color: theme.foreground };
  } else if (s === "outline") {
    base.borderRadius = "8px";
    base.border = `2px solid ${theme.accent}`;
    base.background = "transparent";
    return { ...base, color: theme.foreground };
  } else if (s === "underline") {
    base.borderRadius = "0";
    base.borderBottom = `2px solid ${theme.foreground}`;
    base.background = "transparent";
    return { ...base, color: theme.foreground };
  } else {
    base.borderRadius = "8px";
  }
  return { ...base, background: theme.accent, color: theme.accentForeground };
}
