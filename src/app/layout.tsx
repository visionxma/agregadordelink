import type { Metadata } from "next";
import { Toaster } from "sonner";
import { allFontVariables, inter } from "@/lib/fonts";
import "./globals.css";

const BASE_URL = "https://linkbiobr.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "LinkBio — Sua bio, muito além do link",
    template: "%s · LinkBio",
  },
  description:
    "Crie uma mini-landing page de alta conversão com checkout nativo, IA e analytics de verdade. Alternativa brasileira ao Linktree.",
  keywords: [
    "link na bio",
    "linktree alternativa",
    "bio link brasil",
    "página de perfil",
    "encurtador de links",
    "link bio instagram",
    "analytics",
    "brasil",
  ],
  authors: [{ name: "VisionX", url: BASE_URL }],
  creator: "VisionX",
  publisher: "LinkBio",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "LinkBio",
    title: "LinkBio — Sua bio, muito além do link",
    description:
      "Crie uma mini-landing page de alta conversão com checkout nativo, IA e analytics de verdade.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "LinkBio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkBio — Sua bio, muito além do link",
    description:
      "Crie uma mini-landing page de alta conversão com checkout nativo, IA e analytics de verdade.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={allFontVariables}
    >
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "LinkBio",
                url: "https://linkbiobr.com",
                logo: "https://linkbiobr.com/logo.png",
                description:
                  "Plataforma brasileira de link na bio com analytics, checkout nativo e IA.",
                foundingLocation: { "@type": "Place", name: "Maranhão, Brasil" },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "LinkBio",
                url: "https://linkbiobr.com",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://linkbiobr.com/{search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "1rem",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
