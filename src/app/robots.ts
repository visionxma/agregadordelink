import type { MetadataRoute } from "next";

export const dynamic = "force-static";

function getBaseUrl(): string {
  const url = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  return "https://linkbiobr.com";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/onboarding",
          "/onboarding/*",
          "/api/",
          "/api/*",
          "/__custom/*",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
