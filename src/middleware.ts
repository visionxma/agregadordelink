import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const APP_HOSTS = new Set(
  (process.env.APP_HOSTS ?? "localhost:3000,linkhub.app")
    .split(",")
    .map((h) => h.trim().toLowerCase())
);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  // === Custom domain routing ===
  // Se o host não for um dos domínios do app, trata como custom domain
  // e faz rewrite pra /[slug] da página com esse customDomain
  const isAppHost =
    APP_HOSTS.has(host) ||
    APP_HOSTS.has(host.replace(/:\d+$/, "")) ||
    host.endsWith(".vercel.app") ||
    host.startsWith("localhost");

  if (!isAppHost && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    const url = request.nextUrl.clone();
    url.pathname = `/__custom/${host}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // === Auth gating ===
  const sessionCookie = getSessionCookie(request);
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
