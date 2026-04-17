"use client";

import { useMemo } from "react";
import type {
  Block,
  BlockData,
  Page,
  ThemeBackground,
} from "@/lib/db/schema";
import { normalizeTheme } from "@/lib/normalize-theme";
import { ThemedPage } from "./themed-page";

function bgCss(b: ThemeBackground): string {
  if (b.type === "solid") return b.color;
  if (b.type === "gradient") {
    const dir = {
      "to-br": "135deg",
      "to-bl": "225deg",
      "to-tr": "45deg",
      "to-tl": "315deg",
      "to-r": "90deg",
      "to-b": "180deg",
    }[b.direction];
    const stops = b.via
      ? `${b.from}, ${b.via}, ${b.to}`
      : `${b.from}, ${b.to}`;
    return `linear-gradient(${dir}, ${stops})`;
  }
  return `url(${b.url}) center/cover`;
}

// Renderiza a página real em mini como thumbnail. Usa CSS `zoom` que, diferente
// de `transform: scale`, reduz também o layout box — não deixa espaço fantasma.
export function PagePreviewCard({
  page,
  blocks,
  scale = 0.42,
}: {
  page: Page;
  blocks: Block[];
  scale?: number;
}) {
  const theme = useMemo(() => normalizeTheme(page.theme), [page.theme]);
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

  return (
    <div
      className="relative w-full overflow-hidden"
      style={
        {
          background: bgCss(theme.background),
          maxHeight: "320px",
          "--linkhub-page-min-h": "auto",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none"
        style={{
          // `zoom` funciona em Chrome, Safari e Firefox 126+. Reduz layout box
          // junto com o tamanho visual, então não sobra "espaço vazio".
          zoom: scale,
        }}
      >
        <ThemedPage
          pageId={page.id}
          title={page.title}
          description={page.description}
          avatarUrl={page.avatarUrl}
          coverUrl={page.coverUrl}
          theme={theme}
          blocks={previewBlocks}
          trackEvents={false}
          showAvatarPlaceholder
        />
      </div>
    </div>
  );
}
