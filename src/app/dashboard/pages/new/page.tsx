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
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-10">
        <TemplateWizard
          templates={templates}
          blank={blank}
          categories={categories}
        />
      </section>
    </main>
  );
}
