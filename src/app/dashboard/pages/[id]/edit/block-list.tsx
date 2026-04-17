"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  Clock,
  FileText,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  Minus,
  Music,
  Play,
  Quote,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  Type,
} from "lucide-react";
import type { Block, BlockData, FormField } from "@/lib/db/schema";
import { BlockStyleEditor } from "./block-style-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  deleteBlock,
  reorderBlocks,
  toggleBlockGoal,
  updateBlock,
} from "../../actions";

export function BlockList({ blocks }: { blocks: Block[] }) {
  const [items, setItems] = useState(blocks);
  const [, startTransition] = useTransition();
  const pendingDeletions = useRef(new Map<string, NodeJS.Timeout>());

  // Sincroniza quando servidor manda nova lista
  useEffect(() => {
    setItems(blocks);
  }, [blocks]);

  function handleDeleteWithUndo(blockId: string) {
    // Cancela timeout pendente desse bloco (se user clicou delete de novo)
    const existing = pendingDeletions.current.get(blockId);
    if (existing) clearTimeout(existing);

    // Remove optimista da UI
    setItems((curr) => curr.filter((b) => b.id !== blockId));

    // Agenda delete real em 5s
    const timeoutId = setTimeout(() => {
      deleteBlock(blockId).catch(() => {
        // Silencia qualquer erro — provável race já tratado server-side
      });
      pendingDeletions.current.delete(blockId);
    }, 5000);
    pendingDeletions.current.set(blockId, timeoutId);

    // Toast com desfazer
    toast("Bloco removido", {
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () => {
          const t = pendingDeletions.current.get(blockId);
          if (t) {
            clearTimeout(t);
            pendingDeletions.current.delete(blockId);
          }
          // Restaura bloco na lista
          const restored = blocks.find((b) => b.id === blockId);
          if (restored) {
            setItems((curr) => {
              const next = [...curr, restored];
              next.sort((a, b) => a.position - b.position);
              return next;
            });
          }
        },
      },
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        Nenhum bloco ainda. Adicione o primeiro abaixo.
      </div>
    );
  }

  const pageId = items[0]?.pageId;

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next); // optimistic
    if (!pageId) return;
    startTransition(() =>
      reorderBlocks(
        pageId,
        next.map((b) => b.id)
      )
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((b) => (
            <SortableBlock
              key={b.id}
              block={b}
              onDelete={() => handleDeleteWithUndo(b.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBlock({
  block,
  onDelete,
}: {
  block: Block;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const [pending, startTransition] = useTransition();
  const data = block.data as BlockData;

  function handleUpdate(next: BlockData) {
    startTransition(() => updateBlock(block.id, next));
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "shadow-ios-lg ring-2 ring-primary")}
    >
      <CardContent className="flex gap-3 p-4">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing"
          aria-label="Arrastar pra reordenar"
        >
          <GripVertical className="size-4" />
        </button>

        <BlockIcon type={block.type} />

        <div className="flex-1 space-y-2">
          {data.kind === "link" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Texto do botão</Label>
                <Input
                  defaultValue={data.label}
                  onBlur={(e) =>
                    handleUpdate({ ...data, label: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  type="url"
                  defaultValue={data.url}
                  placeholder="https://..."
                  onBlur={(e) =>
                    handleUpdate({ ...data, url: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {data.kind === "text" && (
            <div className="space-y-1">
              <Label className="text-xs">Texto</Label>
              <Textarea
                defaultValue={data.content}
                rows={2}
                onBlur={(e) =>
                  handleUpdate({ ...data, content: e.target.value })
                }
              />
            </div>
          )}

          {data.kind === "image" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">URL da imagem</Label>
                <Input
                  type="url"
                  defaultValue={data.url}
                  placeholder="https://..."
                  onBlur={(e) =>
                    handleUpdate({ ...data, url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Link ao clicar <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  type="url"
                  defaultValue={data.href ?? ""}
                  placeholder="https://..."
                  onBlur={(e) =>
                    handleUpdate({
                      ...data,
                      href: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alt (acessibilidade)</Label>
                <Input
                  defaultValue={data.alt ?? ""}
                  onBlur={(e) =>
                    handleUpdate({ ...data, alt: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {data.kind === "video" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Plataforma</Label>
                <select
                  defaultValue={data.provider}
                  onChange={(e) =>
                    handleUpdate({
                      ...data,
                      provider: e.target.value as "youtube" | "vimeo",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  ID do vídeo ou URL completa
                </Label>
                <Input
                  defaultValue={data.videoId}
                  placeholder={
                    data.provider === "youtube"
                      ? "dQw4w9WgXcQ ou https://youtube.com/watch?v=..."
                      : "76979871 ou https://vimeo.com/76979871"
                  }
                  onBlur={(e) =>
                    handleUpdate({
                      ...data,
                      videoId: extractVideoId(e.target.value, data.provider),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Cola a URL completa e a gente extrai o ID.
                </p>
              </div>
            </>
          )}

          {data.kind === "divider" && (
            <p className="text-xs text-muted-foreground">Linha divisória</p>
          )}

          {/* Editor de estilo por bloco — aparece em todos os tipos */}
          <BlockStyleEditor
            blockId={block.id}
            currentStyle={block.style ?? {}}
          />

          {data.kind === "newsletter" && (
            <>
              <Input
                defaultValue={data.title}
                placeholder="Assine a newsletter"
                onBlur={(e) =>
                  handleUpdate({ ...data, title: e.target.value })
                }
              />
              <Input
                defaultValue={data.description ?? ""}
                placeholder="Descrição curta"
                onBlur={(e) =>
                  handleUpdate({ ...data, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  defaultValue={data.buttonLabel}
                  placeholder="Botão"
                  onBlur={(e) =>
                    handleUpdate({ ...data, buttonLabel: e.target.value })
                  }
                />
                <Input
                  defaultValue={data.placeholder}
                  placeholder="Placeholder"
                  onBlur={(e) =>
                    handleUpdate({ ...data, placeholder: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Emails capturados ficam em{" "}
                <strong>Analytics → Export CSV</strong>.
              </p>
            </>
          )}

          {data.kind === "whatsapp" && (
            <>
              <Input
                defaultValue={data.label}
                placeholder="💬 Falar no WhatsApp"
                onBlur={(e) =>
                  handleUpdate({ ...data, label: e.target.value })
                }
              />
              <Input
                defaultValue={data.phone}
                placeholder="5511999999999 (código país + DDD + número)"
                onBlur={(e) =>
                  handleUpdate({
                    ...data,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <Textarea
                defaultValue={data.message ?? ""}
                rows={2}
                placeholder="Mensagem pré-preenchida (opcional)"
                onBlur={(e) =>
                  handleUpdate({ ...data, message: e.target.value })
                }
              />
            </>
          )}

          {data.kind === "music" && (
            <>
              <select
                defaultValue={data.provider}
                onChange={(e) =>
                  handleUpdate({
                    ...data,
                    provider: e.target.value as "spotify" | "apple",
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="spotify">Spotify</option>
                <option value="apple">Apple Music</option>
              </select>
              <Input
                defaultValue={data.url}
                placeholder={
                  data.provider === "spotify"
                    ? "https://open.spotify.com/track/..."
                    : "https://music.apple.com/..."
                }
                onBlur={(e) =>
                  handleUpdate({ ...data, url: e.target.value })
                }
              />
            </>
          )}

          {data.kind === "social-embed" && (
            <>
              <select
                defaultValue={data.provider}
                onChange={(e) =>
                  handleUpdate({
                    ...data,
                    provider: e.target.value as "instagram" | "tiktok",
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
              <Input
                defaultValue={data.url}
                placeholder={
                  data.provider === "instagram"
                    ? "https://www.instagram.com/p/CODIGO/"
                    : "https://www.tiktok.com/@user/video/ID"
                }
                onBlur={(e) =>
                  handleUpdate({ ...data, url: e.target.value })
                }
              />
            </>
          )}

          {data.kind === "form" && (
            <>
              <Input
                defaultValue={data.title}
                placeholder="Título"
                onBlur={(e) =>
                  handleUpdate({ ...data, title: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  defaultValue={data.submitLabel}
                  placeholder="Botão"
                  onBlur={(e) =>
                    handleUpdate({ ...data, submitLabel: e.target.value })
                  }
                />
                <Input
                  defaultValue={data.successMessage ?? ""}
                  placeholder="Msg sucesso"
                  onBlur={(e) =>
                    handleUpdate({ ...data, successMessage: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Campos do formulário
                </p>
                {data.fields.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Nenhum campo. Adicione pelo menos um.
                  </p>
                )}
                {data.fields.map((f, i) => (
                  <div
                    key={f.id}
                    className="space-y-1.5 rounded-lg bg-secondary/60 p-2"
                  >
                    <div className="grid grid-cols-[1fr_130px] gap-1.5">
                      <Input
                        defaultValue={f.label}
                        placeholder="Rótulo (ex: Nome)"
                        onBlur={(e) => {
                          const next = [...data.fields];
                          next[i] = {
                            ...next[i]!,
                            label: e.target.value,
                          };
                          handleUpdate({ ...data, fields: next });
                        }}
                      />
                      <select
                        defaultValue={f.type}
                        onChange={(e) => {
                          const next = [...data.fields];
                          next[i] = {
                            ...next[i]!,
                            type: e.target.value as FormField["type"],
                          };
                          handleUpdate({ ...data, fields: next });
                        }}
                        className="flex h-9 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="text">Texto curto</option>
                        <option value="email">Email</option>
                        <option value="phone">WhatsApp / Tel</option>
                        <option value="textarea">Texto longo</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px]">
                        <input
                          type="checkbox"
                          defaultChecked={f.required}
                          onChange={(e) => {
                            const next = [...data.fields];
                            next[i] = {
                              ...next[i]!,
                              required: e.target.checked,
                            };
                            handleUpdate({ ...data, fields: next });
                          }}
                          className="size-3"
                        />
                        Obrigatório
                      </label>
                      <div className="flex items-center gap-2">
                        {i > 0 && (
                          <button
                            type="button"
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const next = [...data.fields];
                              [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                              handleUpdate({ ...data, fields: next });
                            }}
                          >
                            ↑
                          </button>
                        )}
                        {i < data.fields.length - 1 && (
                          <button
                            type="button"
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const next = [...data.fields];
                              [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
                              handleUpdate({ ...data, fields: next });
                            }}
                          >
                            ↓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate({
                              ...data,
                              fields: data.fields.filter((_, x) => x !== i),
                            })
                          }
                          className="text-[10px] text-destructive hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        fields: [
                          ...data.fields,
                          {
                            id: Math.random().toString(36).slice(2, 9),
                            label: "Novo campo",
                            type: "text",
                            required: false,
                          },
                        ],
                      })
                    }
                  >
                    + Campo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        fields: [
                          ...data.fields,
                          {
                            id: Math.random().toString(36).slice(2, 9),
                            label: "WhatsApp",
                            type: "phone",
                            required: true,
                          },
                        ],
                      })
                    }
                  >
                    + WhatsApp
                  </Button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Respostas em{" "}
                <strong>Respostas → {data.title || "Formulário"}</strong>.
              </p>
            </>
          )}

          {data.kind === "countdown" && (
            <>
              <Input
                defaultValue={data.title}
                placeholder="Título"
                onBlur={(e) =>
                  handleUpdate({ ...data, title: e.target.value })
                }
              />
              <Input
                type="datetime-local"
                defaultValue={new Date(data.targetDate)
                  .toISOString()
                  .slice(0, 16)}
                onBlur={(e) =>
                  handleUpdate({
                    ...data,
                    targetDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
              <Input
                defaultValue={data.finishedMessage ?? ""}
                placeholder="Mensagem ao terminar"
                onBlur={(e) =>
                  handleUpdate({ ...data, finishedMessage: e.target.value })
                }
              />
            </>
          )}

          {data.kind === "faq" && (
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/60 p-2">
                  <Input
                    defaultValue={item.q}
                    placeholder="Pergunta"
                    className="mb-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, q: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <Textarea
                    defaultValue={item.a}
                    rows={2}
                    placeholder="Resposta"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, a: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-destructive"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        items: data.items.filter((_, x) => x !== i),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUpdate({
                    ...data,
                    items: [...data.items, { q: "Pergunta", a: "Resposta" }],
                  })
                }
              >
                + Adicionar pergunta
              </Button>
            </div>
          )}

          {data.kind === "testimonials" && (
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/60 p-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input
                      defaultValue={item.name}
                      placeholder="Nome"
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = { ...next[i]!, name: e.target.value };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                    <Input
                      defaultValue={item.role ?? ""}
                      placeholder="Cargo/Role"
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = { ...next[i]!, role: e.target.value };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                  </div>
                  <Textarea
                    defaultValue={item.quote}
                    rows={2}
                    placeholder="Depoimento"
                    className="mt-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, quote: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-destructive"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        items: data.items.filter((_, x) => x !== i),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUpdate({
                    ...data,
                    items: [
                      ...data.items,
                      { name: "", quote: "" },
                    ],
                  })
                }
              >
                + Adicionar depoimento
              </Button>
            </div>
          )}

          {data.kind === "map" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">
                  Endereço, coordenadas ou link do Google Maps
                </Label>
                <Input
                  defaultValue={data.query}
                  placeholder="Av. Paulista 1578 · -23.56,-46.65 · https://maps.app.goo.gl/..."
                  onBlur={(e) =>
                    handleUpdate({ ...data, query: e.target.value })
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Cola direto o link do Google Maps (Compartilhar → Copiar link)
                  ou digite o endereço completo.
                </p>
              </div>
              <Input
                defaultValue={data.label ?? ""}
                placeholder="Rótulo (opcional) — ex: Onde estamos"
                onBlur={(e) =>
                  handleUpdate({ ...data, label: e.target.value })
                }
              />
            </>
          )}

          {data.kind === "events" && (
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/60 p-2">
                  <Input
                    defaultValue={item.title}
                    placeholder="Nome do evento"
                    className="mb-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, title: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input
                      type="datetime-local"
                      defaultValue={
                        item.date
                          ? new Date(item.date).toISOString().slice(0, 16)
                          : ""
                      }
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = {
                          ...next[i]!,
                          date: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                    <Input
                      defaultValue={item.city ?? ""}
                      placeholder="Cidade"
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = { ...next[i]!, city: e.target.value };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                  </div>
                  <Input
                    type="url"
                    defaultValue={item.url ?? ""}
                    placeholder="Link de ingresso (opcional)"
                    className="mt-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, url: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-destructive"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        items: data.items.filter((_, x) => x !== i),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUpdate({
                    ...data,
                    items: [
                      ...data.items,
                      {
                        title: "",
                        date: new Date(
                          Date.now() + 7 * 24 * 3600 * 1000
                        ).toISOString(),
                      },
                    ],
                  })
                }
              >
                + Adicionar evento
              </Button>
            </div>
          )}

          {data.kind === "products" && (
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/60 p-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input
                      defaultValue={item.title}
                      placeholder="Produto"
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = { ...next[i]!, title: e.target.value };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                    <Input
                      defaultValue={item.price ?? ""}
                      placeholder="R$ 99"
                      onBlur={(e) => {
                        const next = [...data.items];
                        next[i] = { ...next[i]!, price: e.target.value };
                        handleUpdate({ ...data, items: next });
                      }}
                    />
                  </div>
                  <Input
                    type="url"
                    defaultValue={item.imageUrl ?? ""}
                    placeholder="URL da imagem"
                    className="mt-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, imageUrl: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <Input
                    type="url"
                    defaultValue={item.url ?? ""}
                    placeholder="URL de compra"
                    className="mt-1"
                    onBlur={(e) => {
                      const next = [...data.items];
                      next[i] = { ...next[i]!, url: e.target.value };
                      handleUpdate({ ...data, items: next });
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-destructive"
                    onClick={() =>
                      handleUpdate({
                        ...data,
                        items: data.items.filter((_, x) => x !== i),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUpdate({
                    ...data,
                    items: [...data.items, { title: "", price: "" }],
                  })
                }
              >
                + Adicionar produto
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-8 shrink-0",
              block.isGoal
                ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                : "text-muted-foreground"
            )}
            disabled={pending}
            onClick={() =>
              startTransition(() => toggleBlockGoal(block.id, !block.isGoal))
            }
            title={
              block.isGoal ? "Remover como conversão" : "Marcar como conversão"
            }
          >
            <Target className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-destructive"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BlockIcon({ type }: { type: string }) {
  const cls = "size-5 shrink-0 text-muted-foreground mt-1";
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
  return null;
}

// Extrai ID de URL do YouTube/Vimeo, ou retorna a string como-está se já for ID
function extractVideoId(
  input: string,
  provider: "youtube" | "vimeo"
): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (provider === "youtube") {
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
      const v = url.searchParams.get("v");
      if (v) return v;
      const shortsMatch = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1]!;
      const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1]!;
    }
    if (provider === "vimeo") {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts.find((p) => /^\d+$/.test(p));
      if (id) return id;
    }
  } catch {}
  return trimmed;
}
