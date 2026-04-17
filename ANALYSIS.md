# LinkHub — Análise end-to-end

Análise feita olhando o código construído (não execução real). Foco em bugs, gaps e ideias de melhoria em ordem de prioridade.

---

## 🟢 O que está bom

### Arquitetura
- **Next.js 15 + Drizzle + Better Auth + Supabase**: stack moderna, type-safe de ponta a ponta
- **Schema bem estruturado**: `user`, `page`, `block`, `event`, `short_link`, `template_stat`, `user_template` com índices apropriados
- **Server actions** com validação Zod em toda entrada de dados
- **Slug validation centralizada** (`lib/slug.ts`) com 38 palavras reservadas + format regex

### UX/UI
- **24 temas** visualmente distintos + **50 modelos** com categorização
- **Editor 4 tabs** bem organizado (Temas/Personalizar/Página/Pixels)
- **Preview ao vivo em mockup de celular** — diferencial sobre concorrentes
- **Drag-and-drop** acessível (teclado + mouse via dnd-kit)
- **iOS glass design** consistente: `glass`, `glass-strong`, `glass-nav`, ambient-bg com orbs
- **Banco de mídia**: 70 fotos Picsum + 128 avatares DiceBear + 20 gradientes + QR em PNG/SVG
- **Onboarding 6 steps** com progresso visual + confetti no final

### Features
- **Encurtador + QR** funcional com tracking de clicks
- **Analytics** por página (views, clicks, CTR, top links, referrers, device, timeline)
- **4 pixels** (Meta, GA4, GTM, TikTok) com injeção automática via next/script
- **Publicar modelo** da comunidade com contador de uso
- **Popularidade dos templates** rankeada por uso real

---

## 🔴 Bugs e problemas reais

### ❌ BLOQUEADOR — Pixels não disparam eventos de clique
**Problema:** Meta Pixel e GA4 só recebem `PageView` automático. Quando o usuário clica num link da bio, o `trackClick` só envia pro `/api/track` interno — não dispara `fbq('track', 'Lead')` nem `gtag('event', 'click')`. Resultado: o usuário configura o Pixel esperando ver conversão e não vê nada.

**Como resolver:** em `themed-page.tsx` dentro de `trackClick()`, adicionar:
```ts
if (window.fbq) window.fbq('track', 'Lead', { content_name: label });
if (window.gtag) window.gtag('event', 'click', { link_label: label });
if (window.ttq) window.ttq.track('ClickButton', { content_name: label });
```

### ⚠️ Bloco de vídeo sem UI de edição
**Problema:** Schema suporta `BlockType = "video"` com provider youtube/vimeo, mas o `AddBlockBar` só oferece link/text/image/divider. Impossível adicionar vídeo pela UI.

**Como resolver:** adicionar opção "Vídeo" em `add-block-bar.tsx` + seção de edição em `block-list.tsx` com campos provider (select) + videoId.

### ⚠️ Image block sem campo href
**Problema:** `BlockData.image` tem `href?` no tipo, mas o editor não expõe input pra configurar. Imagem nunca é clicável.

**Como resolver:** adicionar input "URL ao clicar (opcional)" no bloco de imagem.

### ⚠️ Alinhamento de texto não editável
**Problema:** Text block tem `align?: "left" | "center" | "right"` no tipo, default center. Editor não permite mudar.

**Como resolver:** 3 botões de alinhamento no bloco text.

### ⚠️ 12 fontes carregadas na landing
**Problema:** `allFontVariables` injeta as 12 fontes no `<html>` em toda página — incluindo landing pública e dashboard. Peso desnecessário.

**Como resolver:** `next/font` com `variable` já só baixa quando a variável CSS é usada, mas o preload pode inflar. Considerar mover fontes não-Inter pra layout específico (apenas em `/[slug]` e `/editor`).

### ⚠️ Sem upload de arquivo — só URLs
**Problema:** Avatar, capa e imagem de bloco só aceitam URL. Usuário leigo não sabe onde hospedar a foto.

**Como resolver:** integrar Supabase Storage. Botão "Fazer upload" → sobe pro bucket → retorna URL assinada. Bucket público `linkhub-uploads` com policy por `user_id`.

### ⚠️ Sem email de verificação / forgot password
**Problema:** Signup entra direto sem confirmar email. Se esquecer senha, não há recuperação.

**Como resolver:** configurar Resend no Better Auth (`emailAndPassword: { requireEmailVerification: true, sendResetPassword: async (user) => ... }`). Criar rotas `/verify` e `/reset-password`.

### ⚠️ Sem configurações de conta
**Problema:** Usuário não pode mudar email/senha/nome nem deletar a conta.

**Como resolver:** criar `/dashboard/account` com formulários de editar perfil + delete com confirmação.

### ⚠️ Pixels e cliques duplicados em dev
**Problema:** `useEffect` em ThemedPage dispara `view` ao montar. No React strict mode (dev), dobra. Cada recarregamento local conta duplo.

**Como resolver:** usar ref pra garantir que só dispara 1x:
```ts
const viewed = useRef(false);
useEffect(() => {
  if (viewed.current) return;
  viewed.current = true;
  fetch("/api/track", ...);
}, [pageId]);
```

### ⚠️ Sem rate limiting no /api/track
**Problema:** Alguém malicioso pode fazer POST em loop pra inflar stats de um concorrente ou derrubar o banco.

**Como resolver:** Upstash Redis + rate limit por IP (10 req/s, burst 50). Já está no README como dependência sugerida.

### ⚠️ Redirect `/s/[code]` inexistente vai pra `/not-found`
**Problema:** Em `src/app/s/[code]/route.ts`, quando link não existe, redireciona pra `/not-found` — mas essa rota não existe. Vai cair no 404 genérico.

**Como resolver:** criar página `app/not-found.tsx` estilizada, OU redirecionar pra homepage com param de erro.

---

## 🟡 UX / Design — melhorias de alto impacto

### 💡 Preview do estilo de botão antes de aplicar
No customizer, opções "Glass", "Brutal", "Underline" são só texto. Usuário não sabe o visual. Mostrar mini preview do botão em cada opção.

### 💡 "Slug disponível ✓" em tempo real
Hoje só vê o erro ao submeter. Adicionar debounced check via `/api/slug-check?slug=xxx` com feedback verde/vermelho no input.

### 💡 Toast system
Tudo é feedback inline (texto "Salvo ✓"). Actions destrutivas (deletar página/bloco) deveriam ter toast com desfazer (5s).

### 💡 Share button nativo
No QR modal, além de copiar, adicionar botões "Compartilhar no WhatsApp / X / Instagram Stories" usando `navigator.share()` + deeplinks.

### 💡 OG image dinâmica
`/[slug]` tem `ogImageUrl` no schema mas ninguém preenche. Gerar via `@vercel/og` ou `satori`: composição com avatar + título + tema.

### 💡 Dashboard com stats agregados
Topo do dashboard deveria mostrar "Últimos 7 dias: X visitas, Y cliques" somado de todas as páginas. Motiva o usuário a voltar.

### 💡 Onboarding auto-salva se skipar
Hoje clicar "Pular" abandona tudo. Deveria criar uma página em branco com o que foi preenchido até ali.

### 💡 Scroll to top no troca de tab no editor
Ao trocar tab na sidebar (Temas→Personalizar), o scroll fica onde estava. Pode passar a seção.

### 💡 Keyboard shortcuts
- `Cmd+K`: busca global (páginas + templates + settings)
- `Cmd+S`: salvar no editor
- `Cmd+Enter`: publicar/despublicar página

---

## 📦 Features que faltam pra ser competitivo

### 🚀 Prioridade alta

1. **Upload de imagem** (Supabase Storage) — bloqueia adoção de usuários não-técnicos
2. **Domínio próprio** (subdomain + custom domain via Vercel Domains API) — está promovido na landing, não existe
3. **Planos pagos + Stripe** — monetização zero hoje
4. **Email notifications** — página criada, primeiro clique, resumo semanal
5. **Dark mode toggle** — CSS vars já prontas

### 🚀 Prioridade média

6. **Mais tipos de bloco**: YouTube embed, Spotify player, formulário de email (newsletter capture), contador regressivo, post do Instagram
7. **Link com ícone social** auto-detectado pela URL (se URL contém instagram.com, mostra ícone Insta sem digitar)
8. **Agendamento de publicação** (publica em data X)
9. **A/B test de título/ordem** — o diferencial "IA que otimiza" do README
10. **Checkout nativo (Pix)** — diferencial do README
11. **Multi-idioma** (EN, ES) na landing e templates

### 🚀 Prioridade baixa

12. **Webhook público** quando alguém clica num link
13. **API pública** com OAuth
14. **White-label pra agências** (subcontas)
15. **Marketplace de templates pago**

---

## 🔒 Segurança / Tech debt

### 🔐 Considerações

- **Session security**: Better Auth OK, cookies HttpOnly/Secure via Next
- **SQL injection**: Drizzle parametriza tudo ✓
- **XSS**: React escapa por padrão; cuidado com `dangerouslySetInnerHTML` (não usado ✓)
- **CSRF**: Server actions têm proteção nativa do Next ✓
- **Bucket de imagens**: quando adicionar Supabase Storage, limitar tamanho (2MB) + tipos (jpg/png/webp) + virus scan se possível

### 🧹 Tech debt

- **Remover** `moveBlock` action que não é mais usada (drag-and-drop substituiu)
- **Remover** import `slugify` de actions.ts se não usado direto
- **`void Check; void Sparkles;`** em `template-wizard.tsx` — hack feio pra evitar unused lint. Limpar imports.
- **`.next/trace EPERM` em Windows** — pode ser contornado com `NEXT_TELEMETRY_DISABLED=1`

---

## 🏆 Ordem sugerida de trabalho (próximas 2 semanas)

### Semana 1 — Lacunas críticas
1. **[2h]** Pixels disparando eventos de click (bloqueador real)
2. **[3h]** Upload de imagem via Supabase Storage
3. **[2h]** Email verificação + reset de senha
4. **[2h]** Bloco de vídeo (YouTube/Vimeo) na UI
5. **[2h]** Configurações de conta (editar/deletar)
6. **[1h]** Rate limiting no /api/track
7. **[1h]** Página 404 customizada

### Semana 2 — Polimento + monetização
8. **[4h]** OG image dinâmica via @vercel/og
9. **[6h]** Billing com Stripe (Free/Pro/Business tiers) + gates
10. **[2h]** Custom domains via Vercel Domains API
11. **[3h]** Dark mode toggle
12. **[3h]** Dashboard com stats agregados
13. **[2h]** Bloco de newsletter capture (Resend)

---

## 📊 Score por área (subjetivo)

| Área | Nota | Comentário |
|---|---|---|
| **Visual/Design** | 9/10 | iOS glass consistente, paleta bem definida, tipografia premium |
| **UX editor** | 8/10 | 4 tabs + preview ao vivo + drag-drop. Falta upload e preview de estilo de botão |
| **Templates** | 9/10 | 50 com categorias + publicação comunitária + popularidade |
| **Analytics** | 7/10 | Funcional, mas sem export, sem filtros por período customizado |
| **Encurtador** | 8/10 | Completo com QR. Falta pausar link / expiração |
| **Funcionalidade SaaS** | 4/10 | Falta billing, uploads, verificação, domínios |
| **Segurança** | 7/10 | Boa base, falta rate limiting e email flow |
| **Performance** | 7/10 | 12 fontes pesam. Imagens sem next/Image. CDN picsum lento às vezes |
| **Acessibilidade** | 6/10 | Focus states OK, alguns alts vazios, contraste bom |

**Nota geral do MVP: 7.5/10** — pronto pra beta fechado, falta billing + uploads pra produção pública.
