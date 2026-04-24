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
  Crown,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Palette,
  Settings,
  Settings2,
  Star,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import type { Block, BlockData, Page, PageTheme } from "@/lib/db/schema";
import { BlockEditorForm, BlockTypeIcon, getBlockLabel } from "./block-editor-form";
import { LivePreview } from "./live-preview";
import { ThemePicker } from "./theme-picker";
import { PalettePicker } from "./palette-picker";
import { CustomizerPanel } from "./customizer-panel";
import { PageSettingsForm } from "./page-settings-form";
import { CustomDomainForm } from "./custom-domain-form";
import { IntegrationsForm } from "./integrations-form";
import { AdvancedForm } from "./advanced-form";
import { AddBlockBar } from "./add-block-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteBlock,
  reorderBlocks,
  toggleBlockGoal,
  toggleBlockVisible,
} from "../../actions";

type PlanTier = "free" | "pro" | "business";

interface EditorShellProps {
  page: Page;
  initialBlocks: Block[];
  theme: PageTheme;
  planTier: PlanTier;
}

type RightTab = "block" | "themes" | "customize" | "settings" | "pixels" | "advanced";

export function EditorShell({ page, initialBlocks, theme, planTier }: EditorShellProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("block");
  const [, startTransition] = useTransition();
  const pendingDeletions = useRef(new Map<string, NodeJS.Timeout>());

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setRightTab("block");
  }

  function handleBlockDataUpdate(blockId: string, data: BlockData) {
    setBlocks((curr) =>
      curr.map((b) => (b.id === blockId ? { ...b, data } : b))
    );
  }

  function handleDeleteWithUndo(blockId: string) {
    const existing = pendingDeletions.current.get(blockId);
    if (existing) clearTimeout(existing);

    if (selectedId === blockId) setSelectedId(null);
    setBlocks((curr) => curr.filter((b) => b.id !== blockId));

    const timeoutId = setTimeout(() => {
      deleteBlock(blockId).catch(() => {});
      pendingDeletions.current.delete(blockId);
    }, 5000);
    pendingDeletions.current.set(blockId, timeoutId);

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
          const restored = initialBlocks.find((b) => b.id === blockId);
          if (restored) {
            setBlocks((curr) => {
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(blocks, oldIdx, newIdx);
    setBlocks(next);
    startTransition(() => reorderBlocks(page.id, next.map((b) => b.id)));
  }

  const rightTabs: { id: RightTab; label: string; icon: React.ReactNode; badge?: "pro" | "business" }[] = [
    { id: "block", label: "Bloco", icon: <Layers className="size-3.5" /> },
    { id: "themes", label: "Temas", icon: <Palette className="size-3.5" /> },
    { id: "customize", label: "Estilo", icon: <Settings2 className="size-3.5" /> },
    {
      id: "settings",
      label: "Página",
      icon: <Settings className="size-3.5" />,
      badge: planTier === "free" ? "pro" : undefined,
    },
    {
      id: "pixels",
      label: "Pixels",
      icon: <Zap className="size-3.5" />,
      badge: planTier === "free" ? "pro" : undefined,
    },
    {
      id: "advanced",
      label: "Avançado",
      icon: <Settings className="size-3.5" />,
      badge: planTier === "free" ? "pro" : planTier === "pro" ? "business" : undefined,
    },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT PANEL — compact block list */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Blocos
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">
            {blocks.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {blocks.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum bloco ainda.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  {blocks.map((b) => (
                    <CompactBlockRow
                      key={b.id}
                      block={b}
                      selected={selectedId === b.id}
                      onSelect={() => handleSelect(b.id)}
                      onDelete={() => handleDeleteWithUndo(b.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="border-t border-border/40 p-2">
          <AddBlockBar pageId={page.id} compact />
        </div>
      </aside>

      {/* CENTER — live preview canvas */}
      <main className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-secondary/30 px-6 py-6">
        <div className="w-full max-w-sm">
          <LivePreview
            pageId={page.id}
            title={page.title}
            description={page.description}
            avatarUrl={page.avatarUrl}
            coverUrl={page.coverUrl}
            theme={theme}
            blocks={blocks}
            customCss={page.customCss}
            customJs={page.customJs}
          />
        </div>
      </main>

      {/* RIGHT PANEL — contextual properties */}
      <aside className="flex w-80 shrink-0 flex-col border-l border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none">
          {rightTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRightTab(t.id)}
              title={t.label}
              className={cn(
                "relative flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-colors shrink-0",
                rightTab === t.id
                  ? "bg-background text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              {t.icon}
              <span className="truncate w-full text-center leading-none">{t.label}</span>
              {t.badge === "pro" && (
                <Star className="absolute right-0.5 top-0.5 size-2 fill-amber-400 text-amber-400" />
              )}
              {t.badge === "business" && (
                <Crown className="absolute right-0.5 top-0.5 size-2 fill-purple-500 text-purple-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {rightTab === "block" && (
            <BlockTab
              block={selectedBlock}
              onDelete={selectedBlock ? () => handleDeleteWithUndo(selectedBlock.id) : undefined}
              onBlockUpdate={
                selectedBlock
                  ? (data) => handleBlockDataUpdate(selectedBlock.id, data)
                  : undefined
              }
            />
          )}

          {rightTab === "themes" && (
            <div className="space-y-5">
              <ThemePicker pageId={page.id} currentPreset={theme.preset} />
              <p className="text-xs text-muted-foreground">
                24 presets completos (cores + fonte + botão + efeito).
              </p>
              <div className="border-t border-border pt-4">
                <PalettePicker pageId={page.id} />
              </div>
            </div>
          )}

          {rightTab === "customize" && (
            <CustomizerPanel pageId={page.id} theme={theme} />
          )}

          {rightTab === "settings" && (
            <div className="space-y-4">
              <PageSettingsForm page={page} />
              <CustomDomainForm page={page} planTier={planTier} />
            </div>
          )}

          {rightTab === "pixels" && (
            <IntegrationsForm page={page} planTier={planTier} />
          )}

          {rightTab === "advanced" && (
            <AdvancedForm page={page} planTier={planTier} />
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── Compact block row (left panel) ──────────────────────────────────────────

function CompactBlockRow({
  block,
  selected,
  onSelect,
  onDelete,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const [pending, startTransition] = useTransition();
  const data = block.data as BlockData;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs transition-colors",
        selected
          ? "bg-primary/10 ring-1 ring-primary/30 text-foreground"
          : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
        isDragging && "ring-2 ring-primary bg-card shadow-ios"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Arrastar"
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* Click area */}
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 min-w-0 items-center gap-1.5 text-left"
      >
        <BlockTypeIcon type={block.type} className={cn("size-3.5 shrink-0", selected ? "text-primary" : "")} />
        <span className="truncate font-medium text-[11px] leading-none">
          {getBlockLabel(data)}
        </span>
      </button>

      {/* Action buttons — shown on hover or when selected */}
      <div className={cn(
        "flex items-center gap-0.5 shrink-0 transition-opacity",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button
          type="button"
          title={block.isGoal ? "Remover conversão" : "Marcar como conversão"}
          disabled={pending}
          onClick={() => startTransition(() => toggleBlockGoal(block.id, !block.isGoal))}
          className={cn(
            "flex size-5 items-center justify-center rounded transition-colors",
            block.isGoal
              ? "text-emerald-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Target className="size-3" />
        </button>
        <button
          type="button"
          title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
          disabled={pending}
          onClick={() => startTransition(() => toggleBlockVisible(block.id, !block.visible))}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          {block.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        </button>
        <button
          type="button"
          title="Excluir bloco"
          disabled={pending}
          onClick={onDelete}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Block tab content (right panel) ─────────────────────────────────────────

function BlockTab({
  block,
  onDelete,
  onBlockUpdate,
}: {
  block: Block | null;
  onDelete?: () => void;
  onBlockUpdate?: (data: BlockData) => void;
}) {
  const [pending, startTransition] = useTransition();

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Layers className="size-5" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Selecione um bloco
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Clique em um bloco à esquerda para editar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Block header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BlockTypeIcon type={block.type} className="size-4 text-primary" />
          <span className="text-sm font-semibold">
            {getBlockLabel(block.data as BlockData)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-7",
              block.isGoal
                ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                : "text-muted-foreground"
            )}
            disabled={pending}
            title={block.isGoal ? "Remover conversão" : "Marcar como conversão"}
            onClick={() =>
              startTransition(() => toggleBlockGoal(block.id, !block.isGoal))
            }
          >
            <Target className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            disabled={pending}
            title="Excluir bloco"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Block editor form */}
      <BlockEditorForm block={block} onUpdate={onBlockUpdate} />
    </div>
  );
}
