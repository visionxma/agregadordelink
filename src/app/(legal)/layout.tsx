import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LinkBioLogo } from "@/components/linkbio-logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="ambient-bg min-h-screen">
      <header className="glass-nav sticky top-0 z-30 border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-4">
            <LinkBioLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <article className="legal-prose container mx-auto max-w-3xl px-4 py-12">
        {children}
      </article>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link href="/termos" className="hover:text-foreground">Termos</Link>
            <Link href="/exclusao-de-dados" className="hover:text-foreground">Exclusão</Link>
          </div>
          <p>© {new Date().getFullYear()} LinkBio BR. Todos os direitos reservados.</p>
        </div>
      </footer>

      <style>{`
        .legal-prose h1 { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 0.5rem; }
        .legal-prose h2 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2.5rem; margin-bottom: 1rem; padding-top: 1rem; border-top: 1px solid hsl(var(--border)); }
        .legal-prose h3 { font-size: 1rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .legal-prose p { font-size: 0.9rem; line-height: 1.75; color: hsl(var(--foreground)); margin-bottom: 1rem; }
        .legal-prose ul, .legal-prose ol { font-size: 0.9rem; line-height: 1.75; margin-left: 1.25rem; margin-bottom: 1rem; }
        .legal-prose li { margin-bottom: 0.4rem; }
        .legal-prose ul { list-style-type: disc; }
        .legal-prose ol { list-style-type: lower-alpha; }
        .legal-prose strong { font-weight: 700; }
        .legal-prose table { width: 100%; font-size: 0.8rem; border-collapse: collapse; margin-bottom: 1rem; }
        .legal-prose th, .legal-prose td { border: 1px solid hsl(var(--border)); padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
        .legal-prose th { background: hsl(var(--secondary)); font-weight: 700; }
        .legal-prose .meta { color: hsl(var(--muted-foreground)); font-size: 0.8rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid hsl(var(--border)); }
        .legal-prose .highlight { background: hsl(var(--secondary)); border-left: 3px solid hsl(var(--primary)); padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; margin-bottom: 1rem; }
      `}</style>
    </main>
  );
}
