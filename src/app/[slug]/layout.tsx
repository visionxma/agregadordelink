import { publicFontVariables } from "@/lib/fonts-public";

export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={publicFontVariables}>{children}</div>;
}
