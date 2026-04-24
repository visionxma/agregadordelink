"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  FileText,
  GalleryHorizontal,
  Grid3x3,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Link2,
  MapPin,
  MessageCircle,
  Minus,
  MousePointerClick,
  Music,
  Play,
  Plus,
  Quote,
  ShoppingBag,
  Sparkles,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlockType } from "@/lib/db/schema";
import { addBlock } from "../../actions";

type BlockOption = {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
};

const groups: { title: string; items: BlockOption[] }[] = [
  {
    title: "Básico",
    items: [
      { type: "link", label: "Link", icon: <Link2 className="size-4" /> },
      { type: "text", label: "Texto", icon: <Type className="size-4" /> },
      {
        type: "image",
        label: "Imagem",
        icon: <ImageIcon className="size-4" />,
      },
      { type: "video", label: "Vídeo", icon: <Play className="size-4" /> },
      { type: "divider", label: "Divisor", icon: <Minus className="size-4" /> },
    ],
  },
  {
    title: "Engajamento",
    items: [
      {
        type: "newsletter",
        label: "Newsletter",
        icon: <Sparkles className="size-4" />,
      },
      {
        type: "whatsapp",
        label: "WhatsApp",
        icon: <MessageCircle className="size-4" />,
      },
      {
        type: "form",
        label: "Formulário",
        icon: <FileText className="size-4" />,
      },
      {
        type: "countdown",
        label: "Countdown",
        icon: <Clock className="size-4" />,
      },
    ],
  },
  {
    title: "Mídia social",
    items: [
      {
        type: "music",
        label: "Música",
        icon: <Music className="size-4" />,
      },
      {
        type: "social-embed",
        label: "Post Insta/TikTok",
        icon: <Sparkles className="size-4" />,
      },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      {
        type: "faq",
        label: "FAQ",
        icon: <HelpCircle className="size-4" />,
      },
      {
        type: "testimonials",
        label: "Depoimentos",
        icon: <Quote className="size-4" />,
      },
      {
        type: "map",
        label: "Mapa",
        icon: <MapPin className="size-4" />,
      },
      {
        type: "events",
        label: "Eventos",
        icon: <CalendarDays className="size-4" />,
      },
      {
        type: "products",
        label: "Produtos",
        icon: <ShoppingBag className="size-4" />,
      },
    ],
  },
  {
    title: "Layouts",
    items: [
      {
        type: "grid",
        label: "Grade",
        icon: <LayoutGrid className="size-4" />,
      },
      {
        type: "image-carousel",
        label: "Carrossel de imagens",
        icon: <Images className="size-4" />,
      },
      {
        type: "product-carousel",
        label: "Carrossel de produtos",
        icon: <GalleryHorizontal className="size-4" />,
      },
      {
        type: "product-grid",
        label: "Grade de produtos",
        icon: <Grid3x3 className="size-4" />,
      },
      {
        type: "button-grid",
        label: "Botões",
        icon: <MousePointerClick className="size-4" />,
      },
    ],
  },
];

export function AddBlockBar({ pageId, compact }: { pageId: string; compact?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function add(type: BlockType) {
    startTransition(async () => {
      const res = await addBlock(pageId, type);
      if (res && "error" in res) toast.error(res.error);
    });
  }

  if (compact) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="size-3.5" /> Adicionar bloco
        </button>
        {open && (
          <div className="mt-2 max-h-64 overflow-y-auto space-y-2 rounded-xl border border-border bg-card p-2 shadow-ios-sm">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="mb-1 px-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {g.title}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      disabled={pending}
                      onClick={() => { add(b.type); setOpen(false); }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <span className="shrink-0 [&>svg]:size-3">{b.icon}</span>
                      <span className="truncate">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-5 shadow-ios-sm">
      <p className="mb-4 text-sm font-semibold">Adicionar bloco</p>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((b) => (
                <Button
                  key={b.type}
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => add(b.type)}
                >
                  {b.icon} {b.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
