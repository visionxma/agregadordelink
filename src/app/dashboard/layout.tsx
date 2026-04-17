// Dashboard lista páginas com preview real — precisa das fontes pro thumbnail
import { publicFontVariables } from "@/lib/fonts-public";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={publicFontVariables}>{children}</div>;
}
