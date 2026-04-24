import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { block, page, type BlockData } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";
import { PixelScripts } from "@/components/pixel-scripts";
import { normalizeTheme } from "@/lib/normalize-theme";

async function loadByDomain(domain: string) {
  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.customDomain, domain), eq(page.published, true)))
    .limit(1);
  if (!p) return null;
  const blocks = await db
    .select()
    .from(block)
    .where(and(eq(block.pageId, p.id), eq(block.visible, true)))
    .orderBy(asc(block.position));
  return { page: p, blocks };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain);
  const data = await loadByDomain(decoded);
  if (!data) return { title: "Não encontrado", robots: { index: false } };

  const title = data.page.seoTitle ?? data.page.title;
  const description = data.page.seoDescription ?? data.page.description ?? undefined;
  const canonical = `https://${decoded}`;
  const ogImage = data.page.ogImageUrl
    ? [{ url: data.page.ogImageUrl, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: ogImage,
      type: "profile",
      url: canonical,
      siteName: data.page.title,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage[0].url] : undefined,
    },
  };
}

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain);
  const data = await loadByDomain(decoded);
  if (!data) notFound();

  const blocksData = data.blocks.map((b) => ({
    id: b.id,
    type: b.type,
    data: b.data as BlockData,
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: data.page.title,
    description: data.page.description ?? undefined,
    url: `https://${decoded}`,
    dateModified: data.page.updatedAt?.toISOString(),
    mainEntity: {
      "@type": "Person",
      name: data.page.title,
      description: data.page.description ?? undefined,
      image: data.page.avatarUrl ?? undefined,
      url: `https://${decoded}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PixelScripts integrations={data.page.integrations ?? {}} />
      {data.page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: data.page.customCss }} />
      )}
      {data.page.customJs && (
        <script
          dangerouslySetInnerHTML={{ __html: data.page.customJs }}
          defer
        />
      )}
      <ThemedPage
        pageId={data.page.id}
        title={data.page.title}
        description={data.page.description}
        avatarUrl={data.page.avatarUrl}
        coverUrl={data.page.coverUrl}
        theme={normalizeTheme(data.page.theme)}
        blocks={blocksData}
      />
    </>
  );
}
