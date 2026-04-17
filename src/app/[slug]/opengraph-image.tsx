import { ImageResponse } from "next/og";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { page } from "@/lib/db/schema";
import { normalizeTheme } from "@/lib/normalize-theme";
import type { ThemeBackground } from "@/lib/db/schema";

export const runtime = "nodejs";
export const alt = "LinkHub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function backgroundCss(b: ThemeBackground): string {
  if (b.type === "solid") return b.color;
  if (b.type === "gradient") {
    const dir = {
      "to-br": "135deg",
      "to-bl": "225deg",
      "to-tr": "45deg",
      "to-tl": "315deg",
      "to-r": "90deg",
      "to-b": "180deg",
    }[b.direction];
    const stops = b.via
      ? `${b.from}, ${b.via}, ${b.to}`
      : `${b.from}, ${b.to}`;
    return `linear-gradient(${dir}, ${stops})`;
  }
  return b.url;
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const [p] = await db
    .select()
    .from(page)
    .where(and(eq(page.slug, params.slug), eq(page.published, true)))
    .limit(1);

  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "#007AFF",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
          }}
        >
          LinkHub
        </div>
      ),
      { ...size }
    );
  }

  const theme = normalizeTheme(p.theme);
  const bg = backgroundCss(theme.background);
  const title = p.title;
  const description = p.description ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          background: bg,
          color: theme.foreground,
          fontFamily: "sans-serif",
        }}
      >
        {p.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={p.avatarUrl}
            width={180}
            height={180}
            style={{
              borderRadius: 9999,
              marginBottom: 40,
              objectFit: "cover",
              border: `8px solid ${theme.foreground}20`,
            }}
          />
        )}
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textAlign: "center",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 32,
              marginTop: 24,
              opacity: 0.8,
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {description}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 22,
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.accentForeground,
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            ✨
          </div>
          linkhub.app/{p.slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
