import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { shortLink } from "@/lib/db/schema";
import { AdInterstitial } from "./interstitial";

export const dynamic = "force-dynamic";

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = code.toLowerCase();

  const [link] = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.code, normalized))
    .limit(1);

  if (!link) notFound();

  // Incrementa clicks
  await db
    .update(shortLink)
    .set({ clicks: sql`${shortLink.clicks} + 1` })
    .where(eq(shortLink.id, link.id));

  return <AdInterstitial url={link.url} title={link.title ?? null} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Redirecionando… · ${code}`,
    robots: { index: false, follow: false },
  };
}
