import Script from "next/script";
import { MonetagSW } from "@/components/monetag-sw";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-1736873321168592";

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
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
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
