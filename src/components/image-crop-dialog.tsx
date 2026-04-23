"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ModalPortal } from "@/components/ui/modal-portal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

export type CropAspect = "square" | "cover" | "portrait";

const ASPECT_CONFIG: Record<
  CropAspect,
  { ratio: number; outW: number; outH: number; label: string }
> = {
  square: { ratio: 1, outW: 512, outH: 512, label: "Avatar (1:1)" },
  cover: { ratio: 3, outW: 1500, outH: 500, label: "Capa (3:1)" },
  portrait: { ratio: 9 / 16, outW: 1080, outH: 1920, label: "Fundo (9:16)" },
};

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = url;
    });
    return img;
  } finally {
    // url revogado depois que o elemento não é mais usado; aqui mantemos
    // vivo via closure — consumidor limpa ao trocar imagem
  }
}

function detectAlpha(img: HTMLImageElement, mime: string): boolean {
  // Só PNG/WebP/GIF podem ter alpha. JPEG nunca tem.
  if (!/png|webp|gif/i.test(mime)) return false;
  const sampleSize = 128;
  const w = Math.min(img.naturalWidth, sampleSize);
  const h = Math.min(img.naturalHeight, sampleSize);
  if (w === 0 || h === 0) return false;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, w, h);
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function ImageCropDialog({
  file,
  aspect,
  onCancel,
  onConfirm,
}: {
  file: File;
  aspect: CropAspect;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const cfg = ASPECT_CONFIG[aspect];

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [hasAlpha, setHasAlpha] = useState(false);
  const [whiteBg, setWhiteBg] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ CW: 400, CH: 400 });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );
  const [dragging, setDragging] = useState(false);

  useBodyScrollLock(true);

  // Dimensões do container do crop — cabem no viewport.
  useLayoutEffect(() => {
    function measure() {
      const maxW = Math.min(540, window.innerWidth - 48);
      const maxH = Math.min(
        420,
        Math.max(240, window.innerHeight - 320)
      );
      const viewRatio = maxW / maxH;
      const CW = cfg.ratio >= viewRatio ? maxW : maxH * cfg.ratio;
      const CH = cfg.ratio >= viewRatio ? maxW / cfg.ratio : maxH;
      setSize({ CW, CH });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cfg.ratio]);

  // Carrega imagem + detecta alpha quando file muda.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) return;
      const alpha = detectAlpha(image, file.type);
      setImg(image);
      setImgUrl(url);
      setHasAlpha(alpha);
      setWhiteBg(alpha);
      setZoom(1);
      setLoading(false);
    };
    image.onerror = () => {
      if (cancelled) return;
      setLoading(false);
    };
    image.src = url;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Quando img/size/zoom mudam, ajusta offset pra manter imagem cobrindo o crop.
  const recenter = useCallback(() => {
    if (!img) return;
    const { CW, CH } = size;
    const baseScale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight);
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    setOffset({ x: (CW - dispW) / 2, y: (CH - dispH) / 2 });
  }, [img, size, zoom]);

  // Recentraliza só quando a imagem ou o tamanho do container mudam.
  useEffect(() => {
    if (!img) return;
    const { CW, CH } = size;
    const baseScale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight);
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    setOffset({ x: (CW - dispW) / 2, y: (CH - dispH) / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, size.CW, size.CH]);

  function clamp(x: number, y: number, dispW: number, dispH: number) {
    const { CW, CH } = size;
    return {
      x: Math.min(0, Math.max(CW - dispW, x)),
      y: Math.min(0, Math.max(CH - dispH, y)),
    };
  }

  function handleZoom(newZoom: number) {
    if (!img) return;
    const { CW, CH } = size;
    const baseScale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight);
    const prevDispW = img.naturalWidth * baseScale * zoom;
    const prevDispH = img.naturalHeight * baseScale * zoom;
    const newDispW = img.naturalWidth * baseScale * newZoom;
    const newDispH = img.naturalHeight * baseScale * newZoom;
    const centerRatioX = prevDispW > 0 ? (CW / 2 - offset.x) / prevDispW : 0.5;
    const centerRatioY = prevDispH > 0 ? (CH / 2 - offset.y) / prevDispH : 0.5;
    const rawX = CW / 2 - centerRatioX * newDispW;
    const rawY = CH / 2 - centerRatioY * newDispH;
    setZoom(newZoom);
    setOffset(clamp(rawX, rawY, newDispW, newDispH));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!img) return;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || !img) return;
    const { CW, CH } = size;
    const baseScale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight);
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset(
      clamp(dragRef.current.ox + dx, dragRef.current.oy + dy, dispW, dispH)
    );
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!img) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    const next = Math.min(4, Math.max(1, zoom + delta));
    handleZoom(next);
  }

  async function handleApply() {
    if (!img) return;
    setApplying(true);
    try {
      const { CW, CH } = size;
      const baseScale = Math.max(
        CW / img.naturalWidth,
        CH / img.naturalHeight
      );
      const dispW = img.naturalWidth * baseScale * zoom;
      const dispH = img.naturalHeight * baseScale * zoom;

      const outW = cfg.outW;
      const outH = cfg.outH;
      const k = outW / CW; // escala container → output

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível");

      if (whiteBg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        img,
        offset.x * k,
        offset.y * k,
        dispW * k,
        dispH * k
      );

      // Se achatou em branco OU não tem alpha, sai JPEG (menor). Se preservou
      // transparência, sai PNG.
      const preserveAlpha = hasAlpha && !whiteBg;
      const mime = preserveAlpha ? "image/png" : "image/jpeg";
      const ext = preserveAlpha ? "png" : "jpg";
      const quality = preserveAlpha ? undefined : 0.92;

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, mime, quality)
      );
      if (!blob) throw new Error("Falha ao gerar imagem");

      const baseName = file.name.replace(/\.[^.]+$/, "") || "imagem";
      const out = new File([blob], `${baseName}.${ext}`, { type: mime });
      onConfirm(out);
    } catch {
      setApplying(false);
    }
  }

  const baseScale =
    img && img.naturalWidth > 0 && img.naturalHeight > 0
      ? Math.max(size.CW / img.naturalWidth, size.CH / img.naturalHeight)
      : 1;
  const dispW = img ? img.naturalWidth * baseScale * zoom : 0;
  const dispH = img ? img.naturalHeight * baseScale * zoom : 0;

  return (
    <ModalPortal>
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div className="flex min-h-full items-center justify-center py-8">
        <div
          className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between border-b px-5 py-3">
            <div>
              <h2 className="text-base font-bold">Ajustar imagem</h2>
              <p className="text-xs text-muted-foreground">
                {cfg.label} · arraste e dê zoom pra enquadrar
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="size-4" />
            </Button>
          </header>

          <div className="space-y-4 p-5">
            <div className="flex justify-center">
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border shadow-inner touch-none select-none",
                  dragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  width: size.CW,
                  height: size.CH,
                  backgroundColor: whiteBg ? "#ffffff" : undefined,
                  backgroundImage: whiteBg
                    ? undefined
                    : "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
              >
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {img && imgUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imgUrl}
                    alt=""
                    draggable={false}
                    style={{
                      position: "absolute",
                      left: offset.x,
                      top: offset.y,
                      width: dispW,
                      height: dispH,
                      maxWidth: "none",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Zoom</Label>
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                  onClick={() => handleZoom(Math.max(1, zoom - 0.2))}
                  disabled={!img}
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => handleZoom(Number(e.target.value))}
                  disabled={!img}
                  className="flex-1 accent-primary"
                />
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                  onClick={() => handleZoom(Math.min(4, zoom + 0.2))}
                  disabled={!img}
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>
            </div>

            {hasAlpha && (
              <label className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs">
                <input
                  type="checkbox"
                  checked={whiteBg}
                  onChange={(e) => setWhiteBg(e.target.checked)}
                  className="mt-0.5 size-4"
                />
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">
                    Adicionar fundo branco
                  </div>
                  <div className="text-muted-foreground">
                    Imagem com transparência detectada. Com o fundo branco, o
                    PNG vai ficar bonito em qualquer tema.
                  </div>
                </div>
              </label>
            )}
          </div>

          <footer className="flex items-center justify-between gap-2 border-t bg-muted/30 px-5 py-3">
            <button
              type="button"
              onClick={recenter}
              disabled={!img}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Centralizar
            </button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={applying}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                disabled={!img || applying}
              >
                {applying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {applying ? "Enviando..." : "Aplicar"}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
