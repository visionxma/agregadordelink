import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, BarChart3, ExternalLink } from "lucide-react";
import { EditorHeaderQr } from "./editor-header-qr";
import { PublishTemplateButton } from "./publish-template-button";
import { IntegrationsForm } from "./integrations-form";
import { AdvancedForm } from "./advanced-form";
import { CustomDomainForm } from "./custom-domain-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { block, page } from "@/lib/db/schema";
import { getUserPlanLimits } from "@/lib/get-plan-limits";
import { getPlan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { normalizeTheme } from "@/lib/normalize-theme";
import { PageSettingsForm } from "./page-settings-form";
import { BlockList } from "./block-list";
import { AddBlockBar } from "./add-block-bar";
import { ThemePicker } from "./theme-picker";
import { PalettePicker } from "./palette-picker";
import { LivePreview } from "./live-preview";
import { CustomizerPanel } from "./customizer-panel";
import { SidebarTabs } from "./sidebar-tabs";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.id, id), eq(page.userId, session.user.id)));
  if (!p) notFound();

  const blocks = await db
    .select()
    .from(block)
    .where(eq(block.pageId, id))
    .orderBy(asc(block.position));

  const theme = normalizeTheme(p.theme);
  const limits = await getUserPlanLimits(session.user.id);

  // Descobre o tier a partir dos limites (compara com os planos)
  const planTier =
    limits.customJs ? "business" : limits.customCss ? "pro" : "free";

  return (
    <main className="ambient-bg flex h-screen flex-col overflow-hidden">
      <header className="glass-nav z-30 shrink-0 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
            <div className="border-l border-border pl-3">
              <h1 className="text-sm font-bold">{p.title}</h1>
              <p className="text-xs text-muted-foreground">
                linkbiobr.com/{p.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!p.published && (
              <span className="rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Rascunho
              </span>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/pages/${p.id}/analytics`}>
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/pages/${p.id}/submissions`}>
                <span className="hidden sm:inline">Respostas</span>
                <span className="sm:hidden">📬</span>
              </Link>
            </Button>
            <PublishTemplateButton pageId={p.id} suggestedName={p.title} />
            <EditorHeaderQr slug={p.slug} title={p.title} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/${p.slug}`} target="_blank">
                <ExternalLink className="size-4" /> Ver ao vivo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto grid flex-1 gap-6 overflow-y-auto px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px_minmax(0,400px)]">
        <div className="space-y-6 min-w-0">
          <div>
            <h2 className="mb-4 text-lg font-bold tracking-tight">Blocos</h2>
            <BlockList blocks={blocks} />
          </div>
          <AddBlockBar pageId={p.id} />
        </div>

        <div className="hidden lg:block">
          <LivePreview
            pageId={p.id}
            title={p.title}
            description={p.description}
            avatarUrl={p.avatarUrl}
            coverUrl={p.coverUrl}
            theme={theme}
            blocks={blocks}
            customCss={p.customCss}
            customJs={p.customJs}
          />
        </div>

        <aside>
          <SidebarTabs
            tabs={[
              {
                id: "themes",
                label: "Temas",
                content: (
                  <div className="space-y-5">
                    <ThemePicker pageId={p.id} currentPreset={theme.preset} />
                    <p className="text-xs text-muted-foreground">
                      24 presets completos (cores + fonte + botão + efeito).
                    </p>
                    <div className="border-t border-border pt-4">
                      <PalettePicker pageId={p.id} />
                    </div>
                  </div>
                ),
              },
              {
                id: "customize",
                label: "Personalizar",
                content: <CustomizerPanel pageId={p.id} theme={theme} />,
              },
              {
                id: "settings",
                label: "Página",
                content: (
                  <div className="space-y-4">
                    <PageSettingsForm page={p} />
                    <CustomDomainForm page={p} planTier={planTier} />
                  </div>
                ),
              },
              {
                id: "integrations",
                label: "Pixels",
                content: <IntegrationsForm page={p} planTier={planTier} />,
              },
              {
                id: "advanced",
                label: "Avançado",
                content: <AdvancedForm page={p} planTier={planTier} />,
              },
            ]}
          />
        </aside>
      </section>
    </main>
  );
}
