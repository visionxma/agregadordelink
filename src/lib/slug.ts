import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { page, shortLink } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

// Rotas da aplicação + palavras reservadas (nunca podem virar slug)
export const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "signup",
  "logout",
  "api",
  "onboarding",
  "s", // prefixo do encurtador
  "r", // redirect reservado
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "demo",
  "pricing",
  "privacy",
  "terms",
  "help",
  "support",
  "about",
  "contact",
  "admin",
  "settings",
  "new",
  "edit",
  "create",
  "delete",
  "update",
  "www",
  "mail",
  "email",
  "blog",
  "docs",
  "app",
  "static",
  "public",
  "assets",
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$|^[a-z0-9]{1,2}$/;

export type SlugValidation =
  | { valid: true; slug: string }
  | { valid: false; error: string };

/** Normaliza e valida formato. Não checa DB. */
export function validateSlugFormat(input: string): SlugValidation {
  const slug = slugify(input);

  if (slug.length < 2) {
    return { valid: false, error: "Slug precisa ter pelo menos 2 caracteres." };
  }
  if (slug.length > 40) {
    return { valid: false, error: "Slug tem que ter no máximo 40 caracteres." };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      error:
        "Use só letras minúsculas, números e hífens. Não pode começar/terminar com hífen.",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: "Esse nome é reservado. Escolha outro." };
  }
  return { valid: true, slug };
}

/** Checa se slug já existe no banco (como página). */
export async function isPageSlugAvailable(slug: string): Promise<boolean> {
  const rows = await db
    .select({ id: page.id })
    .from(page)
    .where(eq(page.slug, slug))
    .limit(1);
  return rows.length === 0;
}

/** Valida formato + disponibilidade de slug de página. */
export async function validatePageSlug(
  input: string
): Promise<SlugValidation> {
  const format = validateSlugFormat(input);
  if (!format.valid) return format;
  const available = await isPageSlugAvailable(format.slug);
  if (!available) {
    return { valid: false, error: "Esse slug já está em uso. Tenta outro." };
  }
  return format;
}

/** Gera slug único com base em `base`, adicionando sufixo se necessário. */
export async function generateUniquePageSlug(base: string): Promise<string> {
  const normalized = slugify(base) || "meu-link";
  const base2 = RESERVED_SLUGS.has(normalized)
    ? `${normalized}-1`
    : normalized;
  let slug = base2;
  let attempt = 1;
  while (!(await isPageSlugAvailable(slug))) {
    attempt++;
    slug = `${base2}-${attempt}`;
    if (attempt > 50) {
      slug = `${base2}-${Date.now().toString(36).slice(-6)}`;
      break;
    }
  }
  return slug;
}

// ============== SHORTLINK CODES ==============

const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"; // sem 0/1/i/l/o pra evitar confusão

export function generateShortCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function validateShortCodeFormat(input: string): SlugValidation {
  const code = input.trim().toLowerCase();
  if (code.length < 3 || code.length > 20) {
    return {
      valid: false,
      error: "Código do link curto precisa ter 3 a 20 caracteres.",
    };
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(code)) {
    return {
      valid: false,
      error: "Só letras minúsculas, números e hífens.",
    };
  }
  if (RESERVED_SLUGS.has(code)) {
    return { valid: false, error: "Esse código é reservado. Escolha outro." };
  }
  return { valid: true, slug: code };
}

export async function isShortCodeAvailable(code: string): Promise<boolean> {
  const rows = await db
    .select({ id: shortLink.id })
    .from(shortLink)
    .where(eq(shortLink.code, code))
    .limit(1);
  return rows.length === 0;
}

export async function generateUniqueShortCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateShortCode(6);
    if (await isShortCodeAvailable(code)) return code;
  }
  // fallback: 8 chars
  for (let i = 0; i < 5; i++) {
    const code = generateShortCode(8);
    if (await isShortCodeAvailable(code)) return code;
  }
  throw new Error("Falha ao gerar código único.");
}
