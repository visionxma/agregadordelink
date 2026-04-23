import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM ?? "LinkBio BR <onboarding@resend.dev>";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export function isEmailConfigured(): boolean {
  return !!apiKey;
}

async function send(to: string, subject: string, html: string) {
  const r = getResend();
  if (!r) {
    console.warn("[email] Resend não configurado. Email NÃO enviado:", subject);
    console.warn("[email] Conteúdo:\n", html);
    return;
  }
  await r.emails.send({ from: fromEmail, to, subject, html });
}

const baseStyle = `font-family: -apple-system, 'Segoe UI', sans-serif; max-width: 480px; margin: 40px auto; padding: 40px 32px; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; color: #0a0a0a;`;

const button = (url: string, label: string) =>
  `<a href="${url}" style="display: inline-block; background: #009c3b; color: #fff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0;">${label}</a>`;

export async function sendVerifyEmail(to: string, url: string) {
  const html = `
    <div style="${baseStyle}">
      <h1 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px;">Confirme seu email</h1>
      <p style="color: #737373; margin: 0 0 8px;">Clica no botão abaixo pra confirmar seu email e começar a usar o LinkBio BR.</p>
      ${button(url, "Confirmar email")}
      <p style="color: #a3a3a3; font-size: 12px;">Se você não criou conta no LinkBio BR, ignora esse email.</p>
    </div>
  `;
  await send(to, "Confirme seu email — LinkBio BR", html);
}

export async function sendResetPasswordEmail(to: string, url: string) {
  const html = `
    <div style="${baseStyle}">
      <h1 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px;">Resetar senha</h1>
      <p style="color: #737373; margin: 0 0 8px;">Clica no botão abaixo pra criar uma nova senha. Esse link expira em 1 hora.</p>
      ${button(url, "Resetar senha")}
      <p style="color: #a3a3a3; font-size: 12px;">Se você não pediu isso, pode ignorar.</p>
    </div>
  `;
  await send(to, "Resetar senha — LinkBio BR", html);
}
