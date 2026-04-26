"use client";

import { useMemo, useState } from "react";

type Point = { date: string; views: number; clicks: number };

export function DailyChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { width, height, padding, max, viewsPath, clicksPath, viewsArea, clicksArea, points } = useMemo(() => {
    const W = 800;
    const H = 240;
    const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const max = Math.max(1, ...data.map((d) => Math.max(d.views, d.clicks)));
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const ptsViews: { x: number; y: number }[] = [];
    const ptsClicks: { x: number; y: number }[] = [];
    data.forEach((d, i) => {
      const x = PAD.left + i * stepX;
      const yV = PAD.top + innerH - (d.views / max) * innerH;
      const yC = PAD.top + innerH - (d.clicks / max) * innerH;
      ptsViews.push({ x, y: yV });
      ptsClicks.push({ x, y: yC });
    });

    const toSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const cur = pts[i]!;
        const cpX = (prev.x + cur.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${cur.y}, ${cur.x} ${cur.y}`;
      }
      return d;
    };
    const toAreaPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      const line = toSmoothPath(pts);
      return `${line} L ${pts[pts.length - 1]!.x} ${PAD.top + innerH} L ${pts[0]!.x} ${PAD.top + innerH} Z`;
    };

    return {
      width: W,
      height: H,
      padding: PAD,
      max,
      viewsPath: toSmoothPath(ptsViews),
      clicksPath: toSmoothPath(ptsClicks),
      viewsArea: toAreaPath(ptsViews),
      clicksArea: toAreaPath(ptsClicks),
      points: data.map((d, i) => ({
        ...d,
        xV: ptsViews[i]!.x,
        yV: ptsViews[i]!.y,
        xC: ptsClicks[i]!.x,
        yC: ptsClicks[i]!.y,
      })),
    };
  }, [data]);

  // Y axis labels (4 níveis)
  const yLabels = useMemo(() => {
    const steps = 4;
    const innerH = height - padding.top - padding.bottom;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = Math.round((max * i) / steps);
      const y = padding.top + innerH - (i / steps) * innerH;
      return { value, y };
    });
  }, [max, height, padding]);

  // X axis labels (mostra ~6 datas)
  const xLabels = useMemo(() => {
    if (data.length === 0) return [];
    const stepX = (width - padding.left - padding.right) / Math.max(1, data.length - 1);
    const everyN = Math.max(1, Math.ceil(data.length / 6));
    return data
      .map((d, i) => ({ d, i }))
      .filter(({ i }) => i % everyN === 0 || i === data.length - 1)
      .map(({ d, i }) => ({
        date: formatDateShort(d.date),
        x: padding.left + i * stepX,
      }));
  }, [data, width, padding]);

  const total = useMemo(
    () => ({
      views: data.reduce((a, b) => a + b.views, 0),
      clicks: data.reduce((a, b) => a + b.clicks, 0),
    }),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Sem dados ainda.
      </div>
    );
  }

  const hover = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-64 w-full"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={l.y}
              y2={l.y}
              stroke="currentColor"
              className="text-border"
              strokeDasharray={i === 0 ? "0" : "2 4"}
              strokeWidth={i === 0 ? 1 : 0.5}
            />
            <text
              x={padding.left - 6}
              y={l.y}
              dy="0.32em"
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {l.value}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {l.date}
          </text>
        ))}

        {/* Áreas */}
        <path d={viewsArea} fill="url(#viewsGrad)" />
        <path d={clicksArea} fill="url(#clicksGrad)" />

        {/* Linhas */}
        <path d={viewsPath} fill="none" stroke="rgb(16,185,129)" strokeWidth="2" />
        <path d={clicksPath} fill="none" stroke="rgb(59,130,246)" strokeWidth="2" strokeDasharray="0" />

        {/* Hover targets (transparentes, full height) */}
        {points.map((p, i) => {
          const stepX = (width - padding.left - padding.right) / Math.max(1, points.length - 1);
          return (
            <rect
              key={i}
              x={p.xV - stepX / 2}
              y={padding.top}
              width={stepX}
              height={height - padding.top - padding.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          );
        })}

        {/* Hover indicator */}
        {hover && (
          <>
            <line
              x1={hover.xV}
              x2={hover.xV}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="currentColor"
              className="text-primary/40"
              strokeWidth="1"
            />
            <circle cx={hover.xV} cy={hover.yV} r="4" fill="rgb(16,185,129)" stroke="white" strokeWidth="2" />
            <circle cx={hover.xC} cy={hover.yC} r="4" fill="rgb(59,130,246)" stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-xs shadow-lg"
          style={{
            left: `${(hover.xV / width) * 100}%`,
            top: 0,
          }}
        >
          <p className="font-bold">{formatDateLong(hover.date)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{hover.views}</span> visitas
          </p>
          <p className="flex items-center gap-1.5 text-blue-600">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="font-semibold">{hover.clicks}</span> cliques
          </p>
        </div>
      )}

      {/* Footer com totais e legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Visitas</span>
            <span className="font-semibold tabular-nums">{total.views.toLocaleString("pt-BR")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Cliques</span>
            <span className="font-semibold tabular-nums">{total.clicks.toLocaleString("pt-BR")}</span>
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Passe o mouse pra ver detalhes
        </span>
      </div>
    </div>
  );
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
