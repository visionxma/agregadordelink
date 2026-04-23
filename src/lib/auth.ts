import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  isEmailConfigured,
  sendResetPasswordEmail,
  sendVerifyEmail,
} from "@/lib/email";

// Default: exige verificação de email sempre que Resend estiver configurado.
// Pra desativar explicitamente (ex: ambiente dev com Resend): EMAIL_VERIFICATION=disabled
const requireVerification =
  isEmailConfigured() && process.env.EMAIL_VERIFICATION !== "disabled";

// Origens sempre confiáveis — evita que uma env errada/desatualizada
// bloqueie login com "Invalid origin". Acrescenta qualquer host extra
// definido em APP_HOSTS (ex: subdomínios de staging).
const extraOrigins = (process.env.APP_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)
  .map((h) => {
    if (h.startsWith("http")) return h;
    if (h.startsWith("localhost")) return `http://${h}`;
    return `https://${h}`;
  });

const trustedOrigins = Array.from(
  new Set([
    "https://linkbiobr.com",
    "https://www.linkbiobr.com",
    "http://localhost:3000",
    ...extraOrigins,
  ])
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "https://linkbiobr.com",
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: !requireVerification,
    minPasswordLength: 8,
    requireEmailVerification: requireVerification,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: requireVerification,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerifyEmail(user.email, url);
    },
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
