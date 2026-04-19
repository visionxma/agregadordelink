#!/usr/bin/env node
// Empurra todas as vars de .env.vercel pra Vercel.
// Uso: node scripts/push-env-vercel.mjs [production|preview|development]
// Default: production

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const TARGET = process.argv[2] ?? "production";
const ENV_FILE = ".env.vercel";

if (!existsSync(ENV_FILE)) {
  console.error(`❌ ${ENV_FILE} não existe. Copie .env.example e preencha.`);
  process.exit(1);
}

// Checa se vercel CLI está disponível
const check = spawnSync("vercel", ["--version"], { shell: true, stdio: "ignore" });
if (check.status !== 0) {
  console.error("❌ Vercel CLI não instalada. Rode: npm i -g vercel");
  process.exit(1);
}

const content = readFileSync(ENV_FILE, "utf8");
const lines = content.split(/\r?\n/);

console.log(`🚀 Empurrando vars de ${ENV_FILE} pra Vercel (${TARGET})...\n`);

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  // Remove aspas das pontas
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!value) {
    console.log(`⏭️  ${key} (vazio, pulando)`);
    continue;
  }

  // Remove var existente (ignore error se não existe)
  spawnSync("vercel", ["env", "rm", key, TARGET, "--yes"], {
    shell: true,
    stdio: "ignore",
  });

  // Adiciona via stdin
  const add = spawnSync("vercel", ["env", "add", key, TARGET], {
    shell: true,
    input: value,
    stdio: ["pipe", "ignore", "pipe"],
  });

  if (add.status !== 0) {
    console.error(`❌ ${key} — falhou: ${add.stderr?.toString().trim()}`);
  } else {
    console.log(`✅ ${key}`);
  }
}

console.log("\n✨ Pronto. Rode 'vercel --prod' pra fazer redeploy.");
