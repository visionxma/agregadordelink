import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const HARDCODED_ADMINS = ["visionxma@gmail.com"];

export function isAdminEmail(email: string): boolean {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const all = [...HARDCODED_ADMINS, ...fromEnv];
  return all.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminEmail(session.user.email)) redirect("/dashboard");
  return session.user;
}
