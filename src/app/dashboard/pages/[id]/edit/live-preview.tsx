"use client";

import type { Block, BlockData, PageTheme } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";

export function LivePreview({
  pageId,
  title,
  description,
  avatarUrl,
  coverUrl,
  theme,
  blocks,
}: {
  pageId: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: PageTheme;
  blocks: Block[];
}) {
  const previewBlocks = blocks.map((b) => ({
    id: b.id,
    type: b.type,
    data: b.data as BlockData,
  }));

  return (
    <div className="sticky top-20">
      <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
        Preview ao vivo
      </p>
      <div className="mx-auto w-[320px]">
        <div className="relative rounded-[48px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
          <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
          <div className="relative h-[640px] overflow-hidden rounded-[36px] bg-white">
            <div className="h-full w-full overflow-y-auto">
              <ThemedPage
                pageId={pageId}
                title={title || "Seu título"}
                description={description}
                avatarUrl={avatarUrl}
                coverUrl={coverUrl}
                theme={theme}
                blocks={previewBlocks}
                trackEvents={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
