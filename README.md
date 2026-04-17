# LinkHub (nome provisório) — Plataforma SaaS de Link na Bio

> Um agregador de links que combina o melhor do Linktree, Biosites, Entrai e Linkme.bio — e vai além com IA generativa, SEO real, monetização nativa e performance de primeira classe.

---

## 1. Proposta de Valor

**Problema:** Plataformas atuais são "páginas de links" bonitas, mas limitadas. A maioria:
- Tem SEO ruim (páginas iframe/JS-heavy, sem meta tags dinâmicas, sem SSR).
- Monetização é rasa (um botão de PIX, link pra Stripe).
- Analytics superficial (contagem de cliques, sem funil).
- Personalização trava no "muda a cor do botão".
- IA, quando existe, só gera texto de bio.

**Nossa aposta:** entregar uma **mini-landing page de alta conversão**, indexável no Google, com **checkout nativo**, **IA que otimiza a página** (não só cria), e **analytics de negócio** (receita, LTV, origem).

---

## 2. Diferenciais vs. Concorrência

| Recurso | Linktree | Biosites | Entrai | Linkme.bio | **LinkHub** |
|---|:-:|:-:|:-:|:-:|:-:|
| SSR + SEO real (meta, sitemap, schema.org) | ❌ | ❌ | Parcial | ❌ | ✅ |
| Checkout nativo (Pix, cartão, assinatura) | ❌ | Parcial | ✅ | Parcial | ✅ |
| IA que otimiza (A/B, copy, ordem dos links) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics de receita + funil | ❌ | ❌ | ❌ | ❌ | ✅ |
| Agendamento nativo (Calendly embutido) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Multi-página + white-label (agências) | ❌ | Parcial | ❌ | ✅ | ✅ |
| Editor drag-and-drop com blocos custom | Parcial | ✅ | Parcial | ❌ | ✅ |
| Performance (LCP < 1s, edge) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Integração com gateways BR (Mercado Pago, Pagar.me, Asaas) | ❌ | ❌ | ❌ | Parcial | ✅ |
| Domínio próprio no plano gratuito | ❌ | ✅ | ❌ | ❌ | ✅ |
| API pública + webhooks | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Features

### 3.1 MVP (lançamento — 8 semanas)
- **Editor visual** drag-and-drop de blocos (link, vídeo, imagem, texto, CTA, formulário, produto).
- **Templates por nicho** (creator, comércio, serviços, infoproduto, restaurante, imóveis).
- **Domínio gratuito** (`usuario.linkhub.app`) + domínio próprio (plano pago).
- **Analytics básico**: cliques, visitas, origem (UTM), device, país.
- **SEO on-page**: SSR (Next.js), meta tags editáveis, OG image automática, sitemap, robots.
- **QR Code dinâmico** (muda destino sem trocar o QR).
- **Temas + modo escuro** + fontes Google.
- **Autenticação** (email/senha, Google, magic link).
- **Plano gratuito generoso** (ver seção 6).

### 3.2 V2 (3–6 meses pós-MVP)
- **Checkout nativo**: Pix, cartão, boleto, assinatura recorrente (Mercado Pago + Stripe).
- **Produtos digitais**: entrega automática de arquivo/link após pagamento.
- **Agendamento**: slots de horário, integração com Google Calendar, lembretes por email.
- **Email capture** + automação simples (boas-vindas, sequência).
- **A/B testing** de ordem de links e copy.
- **Multi-página** (1 conta, N páginas — cada uma com URL distinta).
- **Analytics avançado**: funil (visita → clique → compra), cohort, LTV, receita.

### 3.3 V3 (diferencial de mercado)
- **IA Generativa Profunda**:
  - Gera página completa a partir de um prompt ou do perfil do Instagram.
  - Sugere **melhorias em tempo real** (copy, ordem, CTA) baseado em performance real da página.
  - Cria OG images automáticas por link.
  - Chatbot embutido (responde dúvidas no lugar do usuário).
- **White-label para agências**: sub-contas, branding próprio, faturamento separado.
- **API pública + Webhooks**: integração com CRM, n8n, Zapier.
- **App mobile** (React Native) para edição e analytics.
- **Marketplace de templates** (criadores vendem, plataforma recebe fee).

---

## 4. Stack Técnica

**Princípios:** edge-first, type-safe, monorepo, serverless onde faz sentido.

| Camada | Tecnologia | Porquê |
|---|---|---|
| Frontend | **Next.js 15** (App Router) + React 19 | SSR/SSG pra SEO, RSC pra performance |
| Estilo | **Tailwind CSS v4** + shadcn/ui | Velocidade de UI + consistência |
| Editor | **dnd-kit** + **Craft.js** ou **Puck** | Drag-and-drop maduro |
| Backend | **Next.js API Routes** + **tRPC** | Type-safety ponta a ponta |
| Banco | **PostgreSQL** (Neon ou Supabase) | Relacional, serverless, branching |
| ORM | **Drizzle ORM** | Leve, type-safe, SQL-first |
| Auth | **Better Auth** ou **Clerk** | OAuth, magic link, sessions |
| Storage | **Cloudflare R2** ou **UploadThing** | Imagens, arquivos de produtos |
| Cache/Queue | **Upstash Redis** + **QStash** | Rate limit, jobs assíncronos |
| Pagamentos | **Stripe** (global) + **Mercado Pago/Asaas** (BR) | Cobertura internacional + Pix |
| Email | **Resend** + **React Email** | DX excelente |
| Analytics | **PostHog** (self-host) + eventos custom | Funil, replays, feature flags |
| IA | **Claude Sonnet 4.6** (geração) + **Haiku 4.5** (otimização contínua) | Qualidade + custo |
| Deploy | **Vercel** (frontend) + **Neon** (DB) + **Cloudflare** (edge) | Zero-ops |
| Observabilidade | **Sentry** + **Axiom** (logs) | Erros + trace |
| Monorepo | **Turborepo** + **pnpm** | Cache de build, workspaces |

**Estrutura de pastas (proposta):**
```
apps/
  web/          # Next.js — dashboard + editor
  render/       # Next.js — páginas públicas (edge, cache agressivo)
  api/          # (opcional) worker de jobs
packages/
  db/           # Drizzle schema + migrations
  ui/           # Componentes compartilhados
  ai/           # Wrappers Claude + prompts
  blocks/       # Biblioteca de blocos do editor
  config/       # Configs compartilhadas (tsconfig, eslint)
```

---

## 5. Arquitetura (alto nível)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dashboard   │────▶│    tRPC      │────▶│  PostgreSQL  │
│ (app.domain) │     │   + Auth     │     │   (Neon)     │
└──────────────┘     └──────────────┘     └──────────────┘
                             │                    │
                             ▼                    │
                     ┌──────────────┐             │
                     │   Upstash    │             │
                     │ Redis+QStash │             │
                     └──────────────┘             │
                                                  │
┌──────────────┐     ┌──────────────┐             │
│ Página pública│◀───│  Edge cache   │◀───────────┘
│ (user.domain) │    │  (Cloudflare) │
└──────────────┘     └──────────────┘
        │
        ▼
┌──────────────┐     ┌──────────────┐
│   PostHog    │     │   Stripe/    │
│ (analytics)  │     │   MercadoPago│
└──────────────┘     └──────────────┘
```

**Decisões-chave:**
- **Separar render e dashboard**: páginas públicas têm cache de 60s no edge, zero JS desnecessário, LCP < 1s. Dashboard é SPA-like, pode ser pesado.
- **Multi-tenant por subdomínio + domínio próprio** via Vercel Domains API ou Cloudflare for SaaS.
- **Jobs assíncronos** (envio de email, geração de OG image, processamento de IA) via QStash.

---

## 6. Modelo de Negócio

### Tiers

| Plano | Preço | Páginas | Domínio próprio | Analytics | IA | Checkout | Fee sobre vendas |
|---|---|---|---|---|---|---|---|
| **Free** | R$ 0 | 1 | ❌ | Básico | 3 gerações/mês | ❌ | — |
| **Pro** | R$ 29/mês | 3 | ✅ | Avançado | Ilimitado | ✅ | 2% |
| **Business** | R$ 79/mês | 10 | ✅ | Avançado + A/B | Ilimitado | ✅ | 1% |
| **Agency** | R$ 199/mês | 50 + white-label | ✅ | Tudo + API | Ilimitado | ✅ | 0,5% |

**Preços anuais:** 20% off.

### Fontes de receita
1. **Assinaturas** (principal).
2. **Fee sobre GMV** das vendas via checkout (diferencial que escala com sucesso do cliente).
3. **Marketplace de templates** (30% fee).
4. **Add-ons**: domínios premium, SMS (lembretes), créditos extras de IA.

### CAC/LTV esperado (chute inicial)
- **CAC alvo**: R$ 50 (SEO + afiliados + conteúdo no TikTok/IG).
- **LTV alvo**: R$ 600 (churn 5%/mês, ticket médio R$ 35).
- **Ponto de equilíbrio**: ~200 assinantes pagantes.

---

## 7. Roadmap (52 semanas)

### Fase 1 — Fundação (semanas 1–4)
- [ ] Setup monorepo, CI/CD, ambientes
- [ ] Schema do banco, auth, rotas básicas
- [ ] Editor: 5 blocos essenciais
- [ ] Renderização pública com SSR
- [ ] Landing page institucional

### Fase 2 — MVP público (semanas 5–8)
- [ ] Analytics básico (PostHog)
- [ ] Templates (6 nichos)
- [ ] Domínio próprio (plano Pro)
- [ ] Stripe + Mercado Pago (assinatura da plataforma)
- [ ] OG image dinâmica, SEO completo
- [ ] **Lançamento beta fechado** (100 usuários)

### Fase 3 — Monetização do usuário (semanas 9–16)
- [ ] Checkout nativo (Pix, cartão)
- [ ] Produtos digitais
- [ ] Email capture + automação simples
- [ ] Agendamento
- [ ] **Lançamento público** (Product Hunt, comunidades BR)

### Fase 4 — IA diferencial (semanas 17–28)
- [ ] Geração de página via prompt
- [ ] Sugestões de otimização (IA lê analytics e propõe mudanças)
- [ ] A/B testing automático
- [ ] Chatbot embutido

### Fase 5 — Escala (semanas 29–52)
- [ ] White-label para agências
- [ ] API pública + webhooks
- [ ] Marketplace de templates
- [ ] App mobile
- [ ] Internacionalização (EN, ES)

---

## 8. Métricas de Sucesso

**Produto:**
- LCP < 1s (página pública), TTI < 2s (dashboard)
- 99,9% uptime
- Churn mensal < 5%

**Negócio (12 meses):**
- 10.000 usuários free
- 500 pagantes (MRR ~R$ 20k)
- NPS > 50

**Marketing:**
- 100 páginas indexadas no Google com ranking top-3 pra "link na bio [nicho]"
- 50 templates no marketplace

---

## 9. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Linktree copia a feature de IA | Mover rápido, construir moat em dados/analytics |
| Custo de IA explode | Usar Haiku 4.5 pra otimização contínua; cache agressivo de prompts |
| Gateway BR instável (Pix) | Multi-gateway (Mercado Pago + Asaas como fallback) |
| SEO demora a render resultado | Investir em conteúdo + afiliados desde semana 1 |
| Abuso do plano free (spam, phishing) | Rate limit, verificação de email, review de domínios flagados |

---

## 10. Próximos Passos Imediatos

1. Validar nome + registrar domínio
2. Escolher auth (Better Auth vs. Clerk) e pagamentos BR (Mercado Pago vs. Asaas)
3. Criar repositório monorepo e setup inicial
4. Desenhar schema do banco (users, pages, blocks, analytics_events, subscriptions)
5. Protótipo do editor (1 semana — valida a viabilidade técnica do drag-and-drop)

---

## Referências analisadas

- [Linktree](https://linktr.ee) — líder global, ecossistema maduro
- [Biosites](https://biosites.com) (Squarespace) — 100% grátis, integrações de monetização
- [Entrai](https://site.entr.ai) — BR, IA + catálogo
- [Linkme.bio](https://linkme.bio) — BR, multi-páginas pra agências
