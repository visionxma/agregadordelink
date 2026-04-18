#!/usr/bin/env bash
# Empurra todas as vars de .env.vercel pra Vercel (Production).
# Uso:
#   1. Copie .env.example → .env.vercel e preencha os valores
#   2. npm i -g vercel && vercel login && vercel link
#   3. bash scripts/push-env-vercel.sh
#
# .env.vercel NUNCA deve ser commitado (já está no .gitignore via .env*).

set -euo pipefail

ENV_FILE=".env.vercel"
TARGET="${1:-production}"   # production | preview | development

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE não existe. Copie .env.example e preencha."
  exit 1
fi

if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI não instalada. Rode: npm i -g vercel"
  exit 1
fi

echo "🚀 Empurrando vars de $ENV_FILE pra Vercel ($TARGET)..."
echo ""

while IFS= read -r line || [[ -n "$line" ]]; do
  # Pula comentários e linhas vazias
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Separa KEY=VALUE
  key="${line%%=*}"
  value="${line#*=}"

  # Remove aspas duplas/simples das pontas
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  # Pula valores vazios
  [[ -z "$value" ]] && { echo "⏭️  $key (vazio, pulando)"; continue; }

  # Remove var existente (se já existir) e adiciona de novo
  vercel env rm "$key" "$TARGET" --yes 2>/dev/null || true
  printf "%s" "$value" | vercel env add "$key" "$TARGET" > /dev/null
  echo "✅ $key"
done < "$ENV_FILE"

echo ""
echo "✨ Pronto. Rode 'vercel --prod' pra fazer redeploy."
