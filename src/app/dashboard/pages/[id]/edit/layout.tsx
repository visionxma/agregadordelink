// Editor mostra preview ao vivo — precisa das fontes pro usuário ver seu tema
import { publicFontVariables } from "@/lib/fonts-public";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={publicFontVariables}>{children}</div>;
}
