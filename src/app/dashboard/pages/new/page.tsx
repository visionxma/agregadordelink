import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGalleryTemplates, getBlankTemplate } from "@/lib/load-templates";
import { TemplateWizard } from "./template-wizard";

export default async function NewPagePage() {
  const templates = await loadGalleryTemplates();
  const blank = getBlankTemplate();
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  return (
    <main className="ambient-bg flex h-screen flex-col overflow-hidden">
      <header className="glass-nav z-30 shrink-0 border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          </Button>
          <div className="text-xs font-semibold text-muted-foreground">
            Nova página
          </div>
        </div>
      </header>

      <TemplateWizard
        templates={templates}
        blank={blank}
        categories={categories}
      />
    </main>
  );
}
