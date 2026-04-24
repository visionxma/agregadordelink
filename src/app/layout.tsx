import type { Metadata } from "next";
import { Toaster } from "sonner";
import { allFontVariables, inter } from "@/lib/fonts";
import "./globals.css";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-1736873321168592";

export const metadata: Metadata = {
  title: "LinkBio BR — Sua bio, muito além do link",
  description:
    "Crie uma mini-landing page de alta conversão com checkout nativo, IA e analytics de verdade.",
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
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
