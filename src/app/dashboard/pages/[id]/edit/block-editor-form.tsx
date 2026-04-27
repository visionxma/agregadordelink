"use client";

import { useTransition } from "react";
import {
  CalendarDays, Clock, FileText, HelpCircle,
  Image as ImageIcon, Link2, MapPin, MessageCircle,
  Minus, Music, Play, Quote, ShoppingBag, Sparkles, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SocialIconPicker } from "@/components/social-icon-picker";
import { BlockStyleEditor } from "./block-style-editor";
import { cn } from "@/lib/utils";
import type { Block, BlockData, FormField } from "@/lib/db/schema";
import { updateBlock } from "../../actions";

export function BlockEditorForm({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate?: (data: BlockData) => void;
}) {
  const [, startTransition] = useTransition();
  const data = block.data as BlockData;

  function handleUpdate(next: BlockData) {
    onUpdate?.(next);
    startTransition(() => updateBlock(block.id, next));
  }

  return (
    <div className="space-y-3">
      {data.kind === "link" && (
        <>
          <Field label="Texto do botão">
            <Input defaultValue={data.label} onBlur={(e) => handleUpdate({ ...data, label: e.target.value })} />
          </Field>
          <Field label="URL">
            <Input type="url" defaultValue={data.url} placeholder="https://..." onBlur={(e) => handleUpdate({ ...data, url: e.target.value })} />
          </Field>
        </>
      )}

      {data.kind === "text" && (
        <Field label="Texto">
          <Textarea defaultValue={data.content} rows={3} onBlur={(e) => handleUpdate({ ...data, content: e.target.value })} />
        </Field>
      )}

      {data.kind === "image" && (
        <>
          <Field label="URL da imagem">
            <Input type="url" defaultValue={data.url} placeholder="https://..." onBlur={(e) => handleUpdate({ ...data, url: e.target.value })} />
          </Field>
          <Field label="Link ao clicar (opcional)">
            <Input type="url" defaultValue={data.href ?? ""} placeholder="https://..." onBlur={(e) => handleUpdate({ ...data, href: e.target.value || undefined })} />
          </Field>
          <Field label="Alt (acessibilidade)">
            <Input defaultValue={data.alt ?? ""} onBlur={(e) => handleUpdate({ ...data, alt: e.target.value })} />
          </Field>
        </>
      )}

      {data.kind === "video" && (
        <>
          <Field label="Cole a URL do vídeo">
            <Input
              defaultValue={data.videoId}
              placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
              onBlur={(e) => {
                const detected = detectVideoFromUrl(e.target.value);
                handleUpdate({ ...data, provider: detected.provider, videoId: detected.id });
              }}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Aceita YouTube (watch, shorts, youtu.be) e Vimeo. O player aparece direto no botão.
            </p>
          </Field>
          {data.videoId && (
            <p className="text-[11px] text-emerald-600">
              ✓ Vídeo detectado ({data.provider}): {data.videoId}
            </p>
          )}
        </>
      )}

      {data.kind === "divider" && (
        <p className="text-xs text-muted-foreground">Linha divisória — sem configurações.</p>
      )}

      {data.kind === "spacer" && (
        <Field label={`Altura: ${data.height}px`}>
          <input
            type="range"
            min={8}
            max={200}
            step={4}
            defaultValue={data.height}
            className="w-full accent-primary"
            onMouseUp={(e) => handleUpdate({ ...data, height: Number((e.target as HTMLInputElement).value) })}
            onTouchEnd={(e) => handleUpdate({ ...data, height: Number((e.target as HTMLInputElement).value) })}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>8px</span><span>200px</span>
          </div>
        </Field>
      )}

      {data.kind === "newsletter" && (
        <>
          <Field label="Título"><Input defaultValue={data.title} onBlur={(e) => handleUpdate({ ...data, title: e.target.value })} /></Field>
          <Field label="Descrição"><Input defaultValue={data.description ?? ""} onBlur={(e) => handleUpdate({ ...data, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Botão"><Input defaultValue={data.buttonLabel} onBlur={(e) => handleUpdate({ ...data, buttonLabel: e.target.value })} /></Field>
            <Field label="Placeholder"><Input defaultValue={data.placeholder} onBlur={(e) => handleUpdate({ ...data, placeholder: e.target.value })} /></Field>
          </div>
        </>
      )}

      {data.kind === "whatsapp" && (
        <>
          <Field label="Rótulo"><Input defaultValue={data.label} placeholder="💬 Falar no WhatsApp" onBlur={(e) => handleUpdate({ ...data, label: e.target.value })} /></Field>
          <Field label="Número (com DDD e país)"><Input defaultValue={data.phone} placeholder="5511999999999" onBlur={(e) => handleUpdate({ ...data, phone: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Mensagem pré-preenchida"><Textarea defaultValue={data.message ?? ""} rows={2} placeholder="Opcional" onBlur={(e) => handleUpdate({ ...data, message: e.target.value })} /></Field>
        </>
      )}

      {data.kind === "music" && (
        <>
          <select defaultValue={data.provider} onChange={(e) => handleUpdate({ ...data, provider: e.target.value as "spotify" | "apple" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="spotify">Spotify</option>
            <option value="apple">Apple Music</option>
          </select>
          <Input defaultValue={data.url} placeholder="https://open.spotify.com/track/..." onBlur={(e) => handleUpdate({ ...data, url: e.target.value })} />
        </>
      )}

      {data.kind === "social-embed" && (
        <>
          <select defaultValue={data.provider} onChange={(e) => handleUpdate({ ...data, provider: e.target.value as "instagram" | "tiktok" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
          <Input defaultValue={data.url} placeholder={data.provider === "instagram" ? "https://www.instagram.com/p/..." : "https://www.tiktok.com/@user/video/..."} onBlur={(e) => handleUpdate({ ...data, url: e.target.value })} />
        </>
      )}

      {data.kind === "form" && (
        <>
          <Field label="Título"><Input defaultValue={data.title} onBlur={(e) => handleUpdate({ ...data, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Botão"><Input defaultValue={data.submitLabel} onBlur={(e) => handleUpdate({ ...data, submitLabel: e.target.value })} /></Field>
            <Field label="Msg sucesso"><Input defaultValue={data.successMessage ?? ""} onBlur={(e) => handleUpdate({ ...data, successMessage: e.target.value })} /></Field>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Campos</p>
            {data.fields.map((f, i) => (
              <div key={f.id} className="space-y-1.5 rounded-lg bg-secondary/60 p-2">
                <div className="grid grid-cols-[1fr_120px] gap-1.5">
                  <Input defaultValue={f.label} placeholder="Rótulo" onBlur={(e) => { const next = [...data.fields]; next[i] = { ...next[i]!, label: e.target.value }; handleUpdate({ ...data, fields: next }); }} />
                  <select defaultValue={f.type} onChange={(e) => { const next = [...data.fields]; next[i] = { ...next[i]!, type: e.target.value as FormField["type"] }; handleUpdate({ ...data, fields: next }); }} className="rounded-md border border-input bg-transparent px-2 text-xs">
                    <option value="text">Texto</option><option value="email">Email</option><option value="phone">Telefone</option><option value="textarea">Longo</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px]">
                    <input type="checkbox" defaultChecked={f.required} onChange={(e) => { const next = [...data.fields]; next[i] = { ...next[i]!, required: e.target.checked }; handleUpdate({ ...data, fields: next }); }} className="size-3" /> Obrigatório
                  </label>
                  <button type="button" className="text-[10px] text-destructive" onClick={() => handleUpdate({ ...data, fields: data.fields.filter((_, x) => x !== i) })}>Remover</button>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-1.5">
              <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, fields: [...data.fields, { id: Math.random().toString(36).slice(2, 9), label: "Campo", type: "text", required: false }] })}>+ Campo</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, fields: [...data.fields, { id: Math.random().toString(36).slice(2, 9), label: "WhatsApp", type: "phone", required: true }] })}>+ WhatsApp</Button>
            </div>
          </div>
        </>
      )}

      {data.kind === "countdown" && (
        <>
          <Field label="Título"><Input defaultValue={data.title} onBlur={(e) => handleUpdate({ ...data, title: e.target.value })} /></Field>
          <Field label="Data e hora"><Input type="datetime-local" defaultValue={new Date(data.targetDate).toISOString().slice(0, 16)} onBlur={(e) => handleUpdate({ ...data, targetDate: new Date(e.target.value).toISOString() })} /></Field>
          <Field label="Mensagem ao terminar"><Input defaultValue={data.finishedMessage ?? ""} onBlur={(e) => handleUpdate({ ...data, finishedMessage: e.target.value })} /></Field>
        </>
      )}

      {data.kind === "faq" && (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
              <Input defaultValue={item.q} placeholder="Pergunta" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, q: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <Textarea defaultValue={item.a} rows={2} placeholder="Resposta" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, a: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <button type="button" className="text-[10px] text-destructive" onClick={() => handleUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, items: [...data.items, { q: "Pergunta", a: "Resposta" }] })}>+ Pergunta</Button>
        </div>
      )}

      {data.kind === "testimonials" && (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
              <div className="grid grid-cols-2 gap-1.5">
                <Input defaultValue={item.name} placeholder="Nome" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, name: e.target.value }; handleUpdate({ ...data, items: next }); }} />
                <Input defaultValue={item.role ?? ""} placeholder="Cargo" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, role: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              </div>
              <Textarea defaultValue={item.quote} rows={2} placeholder="Depoimento" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, quote: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <button type="button" className="text-[10px] text-destructive" onClick={() => handleUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, items: [...data.items, { name: "", quote: "" }] })}>+ Depoimento</Button>
        </div>
      )}

      {data.kind === "map" && (
        <>
          <Field label="Endereço ou link do Google Maps">
            <Input defaultValue={data.query} placeholder="Av. Paulista 1578 ou link do maps" onBlur={(e) => handleUpdate({ ...data, query: e.target.value })} />
          </Field>
          <Field label="Rótulo (opcional)">
            <Input defaultValue={data.label ?? ""} placeholder="Onde estamos" onBlur={(e) => handleUpdate({ ...data, label: e.target.value })} />
          </Field>
        </>
      )}

      {data.kind === "events" && (
        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
              <Input defaultValue={item.title} placeholder="Nome do evento" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, title: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <div className="grid grid-cols-2 gap-1.5">
                <Input type="datetime-local" defaultValue={item.date ? new Date(item.date).toISOString().slice(0, 16) : ""} onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, date: e.target.value ? new Date(e.target.value).toISOString() : "" }; handleUpdate({ ...data, items: next }); }} />
                <Input defaultValue={item.city ?? ""} placeholder="Cidade" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, city: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              </div>
              <button type="button" className="text-[10px] text-destructive" onClick={() => handleUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, items: [...data.items, { title: "", date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() }] })}>+ Evento</Button>
        </div>
      )}

      {data.kind === "products" && <ProductsEditor data={data} onUpdate={handleUpdate} />}
      {data.kind === "grid" && <GridEditor data={data} onUpdate={handleUpdate} />}
      {data.kind === "image-carousel" && <CarouselEditor data={data} onUpdate={handleUpdate} />}
      {data.kind === "product-grid" && <ProductsEditor data={data} onUpdate={handleUpdate} withColumns />}
      {data.kind === "product-carousel" && <ProductsEditor data={data} onUpdate={handleUpdate} />}

      {data.kind === "button-grid" && (
        <div className="space-y-2">
          <ColumnSelector value={data.columns} onChange={(columns) => handleUpdate({ ...data, columns })} />
          <div className="flex items-center gap-2">
            <Label className="text-[11px] text-muted-foreground">Estilo</Label>
            <div className="flex gap-1">
              {(["filled", "plain"] as const).map((s) => (
                <button key={s} type="button" onClick={() => handleUpdate({ ...data, style: s })} className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", (data.style ?? "filled") === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
                  {s === "filled" ? "Com fundo" : "Só ícone"}
                </button>
              ))}
            </div>
          </div>
          {data.items.map((item, i) => (
            <div key={i} className="space-y-1.5 rounded-lg bg-secondary/60 p-2">
              <SocialIconPicker value={item.icon} onChange={(icon) => { const next = [...data.items]; next[i] = { ...next[i]!, icon }; handleUpdate({ ...data, items: next }); }} />
              <Input defaultValue={item.label} placeholder="Texto (vazio = só ícone)" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, label: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <Input type="url" defaultValue={item.url} placeholder="https://" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, url: e.target.value }; handleUpdate({ ...data, items: next }); }} />
              <button type="button" className="text-[10px] text-destructive" onClick={() => handleUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => handleUpdate({ ...data, items: [...data.items, { label: "", url: "https://" }] })}>+ Botão</Button>
        </div>
      )}

      {/* Estilo do bloco — aparece em todos */}
      <div className="border-t border-border pt-3">
        <BlockStyleEditor blockId={block.id} currentStyle={block.style ?? {}} />
      </div>
    </div>
  );
}

// ─── Sub-editors ──────────────────────────────────────────────────────────────

function ProductsEditor({ data, onUpdate, withColumns = false }: { data: Extract<BlockData, { kind: "products" | "product-grid" | "product-carousel" }>; onUpdate: (d: BlockData) => void; withColumns?: boolean }) {
  return (
    <div className="space-y-2">
      {withColumns && "columns" in data && <ColumnSelector value={(data as { columns: Cols }).columns} onChange={(columns) => onUpdate({ ...data, columns } as BlockData)} />}
      {data.items.map((item, i) => (
        <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
          <div className="grid grid-cols-2 gap-1.5">
            <Input defaultValue={item.title} placeholder="Produto" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, title: e.target.value }; onUpdate({ ...data, items: next } as BlockData); }} />
            <Input defaultValue={item.price ?? ""} placeholder="R$ 99" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, price: e.target.value }; onUpdate({ ...data, items: next } as BlockData); }} />
          </div>
          <Input type="url" defaultValue={item.imageUrl ?? ""} placeholder="URL da imagem" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, imageUrl: e.target.value }; onUpdate({ ...data, items: next } as BlockData); }} />
          <Input type="url" defaultValue={item.url ?? ""} placeholder="URL de compra" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, url: e.target.value }; onUpdate({ ...data, items: next } as BlockData); }} />
          <button type="button" className="text-[10px] text-destructive" onClick={() => onUpdate({ ...data, items: data.items.filter((_, x) => x !== i) } as BlockData)}>Remover</button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onUpdate({ ...data, items: [...data.items, { title: "", price: "" }] } as BlockData)}>+ Produto</Button>
    </div>
  );
}

function GridEditor({ data, onUpdate }: { data: Extract<BlockData, { kind: "grid" }>; onUpdate: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <ColumnSelector value={data.columns} onChange={(columns) => onUpdate({ ...data, columns })} />
      {data.items.map((item, i) => (
        <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
          <Input defaultValue={item.title ?? ""} placeholder="Título (opcional)" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, title: e.target.value }; onUpdate({ ...data, items: next }); }} />
          <Input type="url" defaultValue={item.imageUrl ?? ""} placeholder="URL da imagem" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, imageUrl: e.target.value }; onUpdate({ ...data, items: next }); }} />
          <Input type="url" defaultValue={item.url ?? ""} placeholder="URL de destino (opcional)" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, url: e.target.value }; onUpdate({ ...data, items: next }); }} />
          <button type="button" className="text-[10px] text-destructive" onClick={() => onUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onUpdate({ ...data, items: [...data.items, { title: "" }] })}>+ Item</Button>
    </div>
  );
}

function CarouselEditor({ data, onUpdate }: { data: Extract<BlockData, { kind: "image-carousel" }>; onUpdate: (d: BlockData) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-[11px] text-muted-foreground">Proporção</Label>
        <select value={data.aspect ?? "3:4"} onChange={(e) => onUpdate({ ...data, aspect: e.target.value as NonNullable<typeof data.aspect> })} className="rounded-md border border-input bg-card px-2 py-1 text-xs">
          <option value="1:1">Quadrado (1:1)</option><option value="3:4">Retrato 3:4</option><option value="12:16">Retrato 12:16</option><option value="9:16">Vertical 9:16</option><option value="4:3">Paisagem 4:3</option><option value="16:12">Paisagem 16:12</option><option value="16:9">Horizontal 16:9</option>
        </select>
      </div>
      {data.items.map((item, i) => (
        <div key={i} className="rounded-lg bg-secondary/60 p-2 space-y-1">
          <Input type="url" defaultValue={item.imageUrl} placeholder="URL da imagem" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, imageUrl: e.target.value }; onUpdate({ ...data, items: next }); }} />
          <Input defaultValue={item.caption ?? ""} placeholder="Legenda (opcional)" onBlur={(e) => { const next = [...data.items]; next[i] = { ...next[i]!, caption: e.target.value }; onUpdate({ ...data, items: next }); }} />
          <button type="button" className="text-[10px] text-destructive" onClick={() => onUpdate({ ...data, items: data.items.filter((_, x) => x !== i) })}>Remover</button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onUpdate({ ...data, items: [...data.items, { imageUrl: "" }] })}>+ Imagem</Button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 7;
function ColumnSelector({ value, onChange }: { value: Cols; onChange: (v: Cols) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label className="text-[11px] text-muted-foreground">Colunas</Label>
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n as Cols)} className={cn("size-7 rounded-md border text-xs font-semibold transition-colors", value === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function detectVideoFromUrl(input: string): { provider: "youtube" | "vimeo"; id: string } {
  const trimmed = input.trim();
  if (!trimmed) return { provider: "youtube", id: "" };
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtu.be")) {
      return { provider: "youtube", id: url.pathname.slice(1).split("/")[0] || "" };
    }
    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v) return { provider: "youtube", id: v };
      const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts) return { provider: "youtube", id: shorts[1]! };
      const embed = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return { provider: "youtube", id: embed[1]! };
    }
    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
      if (id) return { provider: "vimeo", id };
    }
  } catch {}
  // Não conseguiu detectar — assume YouTube e usa input bruto como ID
  return { provider: "youtube", id: trimmed };
}

function extractVideoId(input: string, provider: "youtube" | "vimeo"): string {
  const trimmed = input.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (provider === "youtube") {
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
      const v = url.searchParams.get("v"); if (v) return v;
      const s = url.pathname.match(/\/shorts\/([^/?]+)/); if (s) return s[1]!;
    }
    if (provider === "vimeo") {
      const id = url.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
      if (id) return id;
    }
  } catch {}
  return trimmed;
}

export function BlockTypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = cn("size-3.5 shrink-0 text-muted-foreground", className);
  if (type === "link") return <Link2 className={cls} />;
  if (type === "text") return <Type className={cls} />;
  if (type === "image") return <ImageIcon className={cls} />;
  if (type === "video") return <Play className={cls} />;
  if (type === "divider") return <Minus className={cls} />;
  if (type === "newsletter") return <Sparkles className={cls} />;
  if (type === "whatsapp") return <MessageCircle className={cls} />;
  if (type === "music") return <Music className={cls} />;
  if (type === "social-embed") return <Sparkles className={cls} />;
  if (type === "form") return <FileText className={cls} />;
  if (type === "countdown") return <Clock className={cls} />;
  if (type === "faq") return <HelpCircle className={cls} />;
  if (type === "testimonials") return <Quote className={cls} />;
  if (type === "map") return <MapPin className={cls} />;
  if (type === "events") return <CalendarDays className={cls} />;
  if (type === "products") return <ShoppingBag className={cls} />;
  return <Sparkles className={cls} />;
}

export function getBlockLabel(data: BlockData): string {
  switch (data.kind) {
    case "link": return data.label || "Link";
    case "text": return (data.content?.slice(0, 36) || "Texto") + (data.content?.length > 36 ? "…" : "");
    case "image": return "Imagem";
    case "video": return data.videoId ? `Vídeo · ${data.provider}` : "Vídeo";
    case "divider": return "Divisor";
    case "newsletter": return data.title || "Newsletter";
    case "whatsapp": return data.label || "WhatsApp";
    case "music": return `Música · ${data.provider}`;
    case "social-embed": return `Embed · ${data.provider}`;
    case "form": return data.title || "Formulário";
    case "countdown": return data.title || "Contagem regressiva";
    case "faq": return `FAQ (${data.items.length})`;
    case "testimonials": return `Depoimentos (${data.items.length})`;
    case "map": return data.label || data.query?.slice(0, 28) || "Mapa";
    case "events": return `Eventos (${data.items.length})`;
    case "products": return `Produtos (${data.items.length})`;
    case "grid": return `Grade (${data.items.length})`;
    case "image-carousel": return `Carrossel (${data.items.length})`;
    case "product-grid": return `Grade produtos (${data.items.length})`;
    case "product-carousel": return `Carrossel produtos (${data.items.length})`;
    case "button-grid": return `Botões (${data.items.length})`;
    default: return "Bloco";
  }
}
