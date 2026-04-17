import type { PageTemplate } from "@/lib/templates";
import { getTemplateTheme } from "@/lib/templates";
import { ThemeThumbnail } from "@/components/theme-thumbnail";

export function TemplateThumbnail({ template }: { template: PageTemplate }) {
  const theme = getTemplateTheme(template);
  const label = template.suggestedTitle.split(" ")[0] || template.name;
  return <ThemeThumbnail theme={theme} label={label} />;
}
