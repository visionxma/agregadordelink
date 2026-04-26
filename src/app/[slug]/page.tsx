import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { block, page, user, type BlockData } from "@/lib/db/schema";
import { ThemedPage } from "@/components/themed-page";
import { PixelScripts } from "@/components/pixel-scripts";
import { normalizeTheme } from "@/lib/normalize-theme";
import { RESERVED_SLUGS } from "@/lib/slug";
import { ClaimSlugLanding } from "./claim-slug-landing";
import { getUserPlanLimits } from "@/lib/get-plan-limits";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$|^[a-z0-9]{1,2}$/;

async function loadPage(slug: string) {
  if (RESERVED_SLUGS.has(slug)) return null;
  const [row] = await db
    .select({ page, verified: user.verified })
    .from(page)
    .innerJoin(user, eq(page.userId, user.id))
    .where(and(eq(page.slug, slug), eq(page.published, true)));
  if (!row) return null;
  const blocks = await db
    .select()
    .from(block)
    .where(and(eq(block.pageId, row.page.id), eq(block.visible, true)))
    .orderBy(asc(block.position));
  return { page: row.page, blocks, verified: row.verified };
}

const BASE_URL = "https://linkbiobr.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPage(slug);
  if (!data) {
    if (SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug)) {
      const canonical = `${BASE_URL}/${slug}`;
      return {
        title: `@${slug} está disponível no LinkBio`,
        description: `Reivindique /${slug} no LinkBio. Link na bio, encurtador, QR code e analytics — grátis.`,
        openGraph: {
          title: `@${slug} está disponível no LinkBio`,
          description: `Reivindique /${slug} no LinkBio.`,
          url: canonical,
          siteName: "LinkBio",
          locale: "pt_BR",
        },
        alternates: { canonical },
      };
    }
    return { title: "Página não encontrada", robots: { index: false } };
  }

  const title = data.page.seoTitle ?? data.page.title;
  const description = data.page.seoDescription ?? data.page.description ?? undefined;
  const canonical = `${BASE_URL}/${data.page.slug}`;
  const ogImage = data.page.ogImageUrl
    ? [{ url: data.page.ogImageUrl, width: 1200, height: 630, alt: title }]
    : [{ url: `${canonical}/opengraph-image`, width: 1200, height: 630, alt: title }];

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
      siteName: "LinkBio",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage[0].url],
    },
  };
}

export default async function PublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadPage(slug);
  if (!data) {
    if (SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug)) {
      return <ClaimSlugLanding slug={slug} />;
    }
    notFound();
  }

  const blocksData = data.blocks.map((b) => ({
    id: b.id,
    type: b.type,
    data: b.data as BlockData,
    style: b.style,
  }));

  const limits = await getUserPlanLimits(data.page.userId);
  // Branding aparece por padrão. Só some quando o plano permite remover
  // E o usuário escolheu esconder via theme.hideBranding.
  const theme = data.page.theme as { hideBranding?: boolean } | null;
  const showBranding = !(limits.removeBranding && theme?.hideBranding === true);

  const pageUrl = `${BASE_URL}/${data.page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: data.page.title,
    description: data.page.description ?? undefined,
    url: pageUrl,
    dateModified: data.page.updatedAt?.toISOString(),
    mainEntity: {
      "@type": "Person",
      name: data.page.title,
      description: data.page.description ?? undefined,
      image: data.page.avatarUrl ?? undefined,
      url: pageUrl,
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
        pageSlug={data.page.slug}
        title={data.page.title}
        description={data.page.description}
        avatarUrl={data.page.avatarUrl}
        coverUrl={data.page.coverUrl}
        theme={normalizeTheme(data.page.theme)}
        blocks={blocksData}
        verified={data.verified}
        showBranding={showBranding}
      />
    </>
  );
}
