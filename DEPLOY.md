# Deploy no Vercel — guia passo a passo

Tempo estimado: **10 minutos** se tiver todos os serviços já configurados.

---

## 1. Atualizar Next.js (2 min, obrigatório)

O build mostrou CVE na versão atual. Roda local:

```bash
npm install next@latest
npm install -D eslint-config-next@latest
git add package.json package-lock.json
git commit -m "chore: bump next to patch CVE-2025-66478"
git push
```

Vercel detecta o push e faz redeploy automaticamente.

---

## 2. Configurar Environment Variables no Vercel (5 min, obrigatório)

Vercel Dashboard → seu projeto → **Settings → Environment Variables**.

Marca os 3 ambientes (**Production**, **Preview**, **Development**) pra cada variável.

### 🔴 Obrigatórias (senão o build quebra)

| Variável | Onde pegar | Valor |
|---|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (Session pooler) | `postgresql://postgres.XXX:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres` |
| `BETTER_AUTH_SECRET` | Gera aleatório | Mínimo 32 caracteres. Use: `openssl rand -base64 32` ou qualquer string longa aleatória |
| `BETTER_AUTH_URL` | URL do seu deploy | `https://agregadordelink.vercel.app` (ou seu domínio custom) |
| `APP_HOSTS` | Hosts que servem o app | `agregadordelink.vercel.app,linkhub.app` (separados por vírgula, sem https://) |

### 🟡 Opcionais (cada feature fica desligada sem sua var)

**Upload de imagem** (Supabase Storage):
| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_REF.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (⚠️ secreta) |

**Email** (forgot password, verificação):
| Variável | Valor |
|---|---|
| `RESEND_API_KEY` | https://resend.com/api-keys → cria key |
| `EMAIL_FROM` | `LinkHub <nao-responda@seudominio.com>` (precisa ter domínio verificado na Resend) |
| `EMAIL_VERIFICATION` | `required` pra forçar verificação. Deixa em branco pra desabilitar |

**OAuth Google** (login com Google):
| Variável | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | https://console.cloud.google.com/apis/credentials |
| `GOOGLE_CLIENT_SECRET` | idem |

**Billing** (Stripe):
| Variável | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → endpoint `/api/stripe/webhook` → Signing secret |
| `STRIPE_PRICE_PRO` | Stripe → Products → Pro → Price ID (começa com `price_...`) |
| `STRIPE_PRICE_BUSINESS` | idem pra Business |

---

## 3. Setup do Supabase Storage (3 min)

Pra upload de imagem funcionar:

1. Supabase Dashboard → **Storage**
2. Clica **New bucket** → nome: `linkhub-uploads`
3. Marca **Public bucket** (imagens precisam ser acessíveis publicamente)
4. Clica **Create**

(Opcional) Policy de RLS pra limitar upload ao próprio usuário — o código já valida auth server-side, mas se quiser mais segurança, crie policy: 
```sql
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'linkhub-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 4. Setup do Resend (3 min, opcional)

Só se quiser email de forgot password / verificação.

1. https://resend.com → criar conta grátis (3000 emails/mês)
2. **Add Domain** → adiciona seu domínio (ex: `seudominio.com`)
3. Copia os registros DNS (TXT + MX) → cola no seu provedor de DNS
4. Espera a verificação (~5 min)
5. **API Keys** → cria uma key → copia
6. Cola em `RESEND_API_KEY` no Vercel
7. Em `EMAIL_FROM` coloca algo tipo `LinkHub <nao-responda@seudominio.com>`

Se ainda não tem domínio, pode usar `onboarding@resend.dev` temporariamente (limite: só envia pro seu próprio email cadastrado).

---

## 5. Setup do Stripe (10 min, opcional)

Só se for ligar os planos Pro/Business agora.

### 5.1 Criar produtos
1. https://dashboard.stripe.com → **Products**
2. **Add product**:
   - Nome: `LinkHub Pro`
   - Preço: R$ 29,00 / mês · recurring
   - Copia o **Price ID** → cola em `STRIPE_PRICE_PRO`
3. Repete pra Business (R$ 79/mês)

### 5.2 Configurar webhook
1. https://dashboard.stripe.com/webhooks → **Add endpoint**
2. URL: `https://agregadordelink.vercel.app/api/stripe/webhook`
3. Events: seleciona:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia o **Signing secret** (começa com `whsec_...`) → cola em `STRIPE_WEBHOOK_SECRET`

### 5.3 API keys
1. Developers → API keys → copia a **Secret key** (`sk_...`)
2. Cola em `STRIPE_SECRET_KEY`

Use as keys de **teste** (`sk_test_...`) enquanto valida — passa pra live quando estiver pronto.

---

## 6. Domínio custom (opcional)

### Apontar seu domínio pro Vercel
1. Vercel → Projeto → **Settings → Domains**
2. Add `seudominio.com` e `www.seudominio.com`
3. Vercel mostra registros DNS (A ou CNAME) → cola no seu provedor DNS
4. Espera ~5 min pra SSL ser provisionado

### Atualiza env vars
- `BETTER_AUTH_URL` → `https://seudominio.com`
- `APP_HOSTS` → `seudominio.com,www.seudominio.com,agregadordelink.vercel.app`

Reimplante depois de mudar.

### Domínios customs por página (feature do produto)
Cada usuário pode apontar o próprio domínio pra uma página específica. O middleware detecta pelo Host header e rewrite pra `/__custom/[domain]`. Instrução pro usuário:
1. Adicionar CNAME: `seudominio.com → cname.vercel-dns.com`
2. No editor da página, informar o domínio (UI pendente — pode usar SQL direto no Supabase por ora)

---

## 7. Checklist pós-deploy

Teste essas coisas no deploy:

- [ ] Landing `/` carrega sem erro
- [ ] `/signup` permite criar conta nova
- [ ] Onboarding completa e cria página
- [ ] Dashboard mostra a página criada
- [ ] Editor salva mudanças (tema, blocos, integrações)
- [ ] Página pública `/{slug}` renderiza com tema + blocos
- [ ] `/login` com forgot password funciona (se Resend configurado)
- [ ] Upload de avatar funciona (se Supabase Storage configurado)
- [ ] `/dashboard/billing` mostra planos e redireciona pro Stripe (se Stripe configurado)
- [ ] `/dashboard/health` checa links
- [ ] `/api/backup` baixa ZIP
- [ ] Encurtador `/dashboard/links` cria short links
- [ ] `/s/{code}` redireciona e conta click
- [ ] Analytics `/dashboard/pages/{id}/analytics` mostra métricas

---

## 8. Troubleshooting

### Build falha com "DATABASE_URL não configurada"
→ Configurou `DATABASE_URL` nos 3 ambientes? **Redeploy** sem commit: Vercel → Deployments → menu ⋯ → **Redeploy**

### Build falha com "BETTER_AUTH_SECRET is required"
→ Configura `BETTER_AUTH_SECRET` com mínimo 32 chars + redeploy

### Página pública mostra 500
→ Verifica logs em Vercel → Runtime Logs. Normalmente é `DATABASE_URL` ausente no runtime (mas ok no build)

### Analytics não grava eventos
→ Confere no Network se `/api/track` retorna 200. Se 500, é conexão com banco

### Uploads falham com "Upload não configurado"
→ Faltam `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + bucket criado

### Stripe webhook retorna 400 "bad signature"
→ `STRIPE_WEBHOOK_SECRET` tá com a signing secret do endpoint errado. Cada endpoint tem sua própria

### Build warning de CVE
→ Atualiza Next.js (passo 1)

### Warning "jose / Edge Runtime"
→ Ignora, é da lib `jose` dentro do Better Auth. Não afeta execução

---

## 9. Próximos passos sugeridos (pós-deploy)

1. **Analytics próprio**: habilitar Vercel Analytics (grátis)
2. **Error tracking**: Sentry (free tier suficiente)
3. **Rate limiting**: Upstash Redis + `@upstash/ratelimit` no `/api/track` e `/api/upload`
4. **CI**: GitHub Actions que roda `npm run build` em cada PR antes de merge
5. **Preview deploys**: Vercel já cria automaticamente em cada branch — compartilhe URL pra validar features antes de mergear pra main

---

## Links úteis

- Dashboard do deploy: https://vercel.com/dashboard
- Repo: https://github.com/visionxma/agregadordelink
- Supabase: https://supabase.com/dashboard
- Stripe: https://dashboard.stripe.com
- Resend: https://resend.com
