import Script from "next/script";
import { MonetagSW } from "@/components/monetag-sw";

export default function ShortLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MonetagSW />
      <Script
        src="https://quge5.com/88/tag.min.js"
        data-zone="233238"
        async
        data-cfasync="false"
        strategy="afterInteractive"
      />
    </>
  );
}
