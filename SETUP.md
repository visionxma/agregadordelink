# Setup — LinkHub

## 1. Pré-requisitos
- Node.js 20+ (você tem)
- Postgres — escolha **uma** das opções:
  - **Neon** (recomendado, gratuito): https://neon.tech → crie projeto → copie a connection string
  - **Supabase**: https://supabase.com → Project Settings → Database → connection string (modo session)
  - **Docker local**: `docker run -d --name linkhub-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`

## 2. Variáveis de ambiente
Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha:
- `DATABASE_URL` — string de conexão do Postgres escolhido
- `BETTER_AUTH_SECRET` — gere com: `openssl rand -base64 32` (ou qualquer string aleatória ≥32 caracteres)
- `BETTER_AUTH_URL` — deixe `http://localhost:3000` em dev

## 3. Instalar dependências
```bash
npm install
```

## 4. Rodar migrations
```bash
npm run db:push
```
Isso cria as tabelas no seu Postgres direto do schema (sem migration file — bom pra dev).

Em produção, use `db:generate` + `db:migrate` pra ter migrations versionadas.

## 5. Iniciar dev server
```bash
npm run dev
```

Acesse http://localhost:3000

## 6. Fluxo de teste
1. Clique em **Criar conta** → preencha → é redirecionado pro dashboard
2. Dashboard vazio (feature de criar página vem na Fatia 2)
3. `npm run db:studio` → abre o Drizzle Studio pra inspecionar o banco

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server com hot reload |
| `npm run build` | Build de produção |
| `npm run db:push` | Sincroniza schema com o banco (dev) |
| `npm run db:generate` | Gera SQL migration (prod) |
| `npm run db:migrate` | Aplica migrations (prod) |
| `npm run db:studio` | GUI pra inspecionar o banco |

## Estrutura atual

```
src/
├── app/
│   ├── api/auth/[...all]/route.ts   # Better Auth handler
│   ├── dashboard/                   # área logada
│   ├── login/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx                     # landing
├── components/ui/                   # shadcn (button, input, card, label)
├── lib/
│   ├── auth.ts                      # Better Auth server
│   ├── auth-client.ts               # Better Auth client
│   ├── db/
│   │   ├── index.ts                 # conexão Drizzle
│   │   └── schema.ts                # tabelas
│   ├── id.ts
│   └── utils.ts
└── middleware.ts                    # proteção de rotas
```

## Próximas fatias (roadmap de implementação)

- **Fatia 2** — editor drag-and-drop com 3 blocos (link, texto, imagem)
- **Fatia 3** — renderização pública `/:slug` com SSR + tema
- **Fatia 4** — analytics (view/click) + dashboard de métricas
- **Fatia 5** — OG image dinâmica + SEO completo
- **Fatia 6** — pagamentos (Mercado Pago Pix + Stripe) e checkout nativo
- **Fatia 7** — IA (geração + otimização)
