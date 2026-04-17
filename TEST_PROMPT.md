# Prompt pra Claude Browser Extension — QA completo do LinkHub

> **Como usar:** abra o LinkHub rodando (`http://localhost:3000`) no Chrome, ative a extensão Claude for Chrome, cole o prompt abaixo e deixe rodar. No final, um arquivo `linkhub-qa-report.md` é baixado na sua pasta Downloads.

---

## Copie e cole o prompt abaixo

```
Você é um QA tester experiente. Sua missão: testar o LinkHub (SaaS de link na bio tipo Linktree) em http://localhost:3000 de ponta a ponta como se fosse um usuário real curioso e exigente.

Contexto: LinkHub é uma plataforma onde criadores montam páginas de "link na bio". Recursos que DEVEM existir:
- Landing page pública com hero, galeria de temas, recursos, CTA
- Signup/login com email+senha
- Onboarding de 6 steps (categoria → tema → plataformas → links → perfil → sucesso)
- Dashboard com lista de páginas + botão Nova página
- Gallery de 50+ modelos (templates) com filtros por categoria, busca, seção "Populares"
- Editor de página com 4 tabs: Temas, Personalizar, Página, Pixels
- Drag-and-drop pra reordenar blocos
- Banco de fotos (Picsum), gradientes (20+), avatares DiceBear
- Capa + avatar
- Preview ao vivo em mockup de celular
- Encurtador de links (/dashboard/links) com QR code
- Analytics por página (/dashboard/pages/[id]/analytics): visitas, cliques, CTR, top links, referrers, device, timeline
- Integrações: Meta Pixel, GA4, GTM, TikTok Pixel
- Publicar modelo da comunidade
- Slug validation, reserved words
- Tema iOS com glass/blur, azul #007AFF como primary

## TESTES QUE VOCÊ DEVE FAZER (nessa ordem)

### 1. Landing page (sem login)
- Abra http://localhost:3000
- Verifique hero: título, subtítulo, input "linkhub.app/", botão "Criar grátis"
- Verifique navbar pill no topo (links Temas, Recursos, Modelos, Entrar, Criar grátis)
- Mockup de celular à direita com ícones SVG (Insta, TikTok, YouTube, Spotify, WhatsApp)
- Role até galeria de temas (6 temas)
- Role até seção "Recursos" (6 células em grid)
- Role até CTA final com social proof (70k+ criadores, 4.9 estrelas, 50+ modelos)
- Footer

### 2. Signup
- Clique "Criar grátis" na navbar
- Preencha: nome "Teste QA", email aleatório (teste-[timestamp]@qa.com), senha "test1234567"
- Deveria redirecionar pra /onboarding

### 3. Onboarding (6 steps)
- Step 1 CATEGORIA: escolha "Criador" → Continuar
- Step 2 TEMA: escolha "Midnight" → Continuar
- Step 3 PLATAFORMAS: selecione 4 (Instagram, TikTok, YouTube, WhatsApp) — note que ícones são SVG com cor da marca quando selecionado
- Step 4 LINKS: preencha nos 4 inputs: user_teste, @user_teste, user_teste, 11999998888 — o prefixo da URL aparece à esquerda
- Step 5 PERFIL: clique no avatar circular → escolha um avatar DiceBear → nome "Teste QA" → bio "Testando o sistema"
- Step 6 SUCESSO: aparece confetti animado, URL da página, 2 CTAs (Personalizar agora / Ir pro dashboard)

### 4. Dashboard
- Vá pro dashboard (se não estiver)
- Verifique nav com "Páginas" + "Links curtos"
- Sua página aparece no grid com thumbnail do tema aplicado + 4 botões (Editar, Analytics, QR, Abrir)

### 5. Editor — Tema Temas
- Clique Editar na sua página
- Verifique header sticky com título + slug + botões (Analytics, Publicar modelo, QR, Ver ao vivo)
- Sidebar direita mostra 4 tabs: Temas, Personalizar, Página, Pixels
- Tab "Temas": clique em "Trocar tema" → modal com 24 presets
- Aplique um tema diferente (ex: "Sunset") → mockup atualiza na hora

### 6. Editor — Tab Personalizar
- Role as seções: Fundo (Sólido/Gradient/Foto) · Cores · Tipografia · Botões · Avatar · Espaçamento · Efeito
- Em Fundo > Foto: clique "Banco de fotos" → modal com 7 categorias (Natureza, Cidade, Abstrato, etc) — pegue uma foto
- Em Cores: clique num color picker, escolha outra cor
- Em Botões: troque pra "Glass" — veja preview
- Em Efeito: escolha "Stars" — veja estrelinhas aparecendo no preview

### 7. Editor — Tab Página
- Upload de capa: clique "Escolher do banco" em Capa → pegue uma foto
- Avatar: "Escolher do banco" → grid com 8 estilos (Ilustrado, Cartoon, Robô, Pixel, etc)
- Preencha descrição
- Salve

### 8. Editor — Tab Pixels
- Verifique 4 campos: Meta Pixel, GA4, GTM, TikTok Pixel
- Tente inserir IDs fake (111111111111111 em cada) — deve aceitar e salvar

### 9. Editor — Blocos (drag-and-drop)
- Na área principal, adicione 2 blocos: Link + Texto
- Preencha um link: label "Meu site", url "https://google.com"
- Teste drag-and-drop: pegue o ícone de alça (⋮⋮) à esquerda de um bloco e arraste pra outra posição
- Teste deletar um bloco (ícone lixeira)

### 10. Publicar modelo
- Clique "Publicar modelo" no header
- Preencha nome "Modelo QA Teste", categoria "Criador", descrição "Criado pelo QA"
- Publique → veja confirmação

### 11. QR code
- Clique no botão QR no header do editor → modal abre
- Verifique QR code visível, botão copiar URL (teste clicar), download PNG, download SVG

### 12. Página pública
- Clique "Ver ao vivo" (abre nova aba)
- Verifique: tema aplicado, capa no topo, avatar com ring, bio, blocos renderizados, rodapé "Feito com LinkHub"
- Abra DevTools > Network → recarregue → veja se fbevents.js, gtag.js carregaram (pixels)

### 13. Encurtador
- Volte pro dashboard → clique "Links curtos" na nav
- Cole https://youtube.com no input URL → Encurtar
- Veja novo link criado com código aleatório
- Clique "+ Opções avançadas" → crie outro link com código custom "meu-teste"
- Teste botão Copiar (verifica feedback visual)
- Teste botão QR (modal abre)
- Abra o link curto em nova aba → deveria redirecionar

### 14. Analytics
- Volte pra página no dashboard → clique no ícone de gráfico (Analytics)
- Verifique 4 stat cards no topo (Visitas, Cliques, CTR, Dias)
- Verifique timeline bar chart (30 dias)
- Verifique 4 bar lists: Links, Referrers, Devices, Países

### 15. Gallery de modelos
- Dashboard → Nova página → /dashboard/pages/new
- Verifique busca, abas (🔥 Populares, Todos, categorias)
- Troca entre algumas abas
- Use a busca pra filtrar
- Selecione um modelo qualquer → formulário de nome/slug
- Tente slug reservado "api" ou "dashboard" — deve bloquear com mensagem clara
- Tente slug que já existe (o seu primeiro) — deve bloquear
- Use um slug válido → cria a página

### 16. Validação de slug
- Na criação de nova página, tente esses slugs proibidos: "api", "login", "admin", "www", "s"
- Verifique mensagem de erro em PT

### 17. Logout / Login de novo
- Clique Sair no header
- Clique Entrar na landing
- Entre com o email criado + senha → deve voltar pro dashboard

## CRITÉRIOS DE AVALIAÇÃO

Para cada teste, avalie:
- ✅ **FUNCIONA**: feature opera como esperado
- ⚠️ **BUG MENOR**: UX ou visual estranho mas funcional
- ❌ **BUG BLOQUEADOR**: não funciona ou quebra o fluxo
- 💡 **SUGESTÃO**: ideia de melhoria

Avalie também:
- Visual/design (paleta azul iOS, glass, tipografia)
- Responsividade (redimensione a janela pra 375px mobile)
- Performance (tempo de carregamento)
- Copy em português (erros, typos)
- Acessibilidade (tab navigation, contraste)
- Feedback visual (loading states, toasts, hovers)
- Consistência (botões, espaçamentos, cores)

## FORMATO DO RELATÓRIO

Gere um relatório em markdown com as seções:

```markdown
# LinkHub — Relatório de QA
Data: [data atual]
Ambiente: localhost:3000
Testado por: Claude Browser Extension

## Resumo executivo
- Total de testes: X
- ✅ Funcionando: X
- ⚠️ Bugs menores: X
- ❌ Bugs bloqueadores: X
- 💡 Sugestões: X

## O que está BOM
- [liste itens destacando o que funciona bem]

## O que está RUIM / BUGS
### ❌ Bloqueadores
- [Bug]: descrição clara, passos pra reproduzir, como resolver tecnicamente

### ⚠️ Menores
- [Bug]: idem

## Sugestões de melhoria
- 💡 [sugestão]: por que melhoraria a experiência

## Testes por área
### Landing page
- Lista cada checagem com status

### Signup/Login
### Onboarding
### Dashboard
### Editor
### Analytics
### Encurtador
### Página pública
### Validações
### Visual/design
### Responsividade

## Priorização (ordem de resolução sugerida)
1. [item mais crítico]
2. [próximo]
...

## Score geral
- UX: X/10
- Visual: X/10
- Funcionalidade: X/10
- Performance: X/10
- **Nota final: X/10**
```

## INSTRUÇÃO FINAL OBRIGATÓRIA

Ao terminar TODOS os testes, gere o conteúdo completo do relatório em markdown e faça o download automático do arquivo como `linkhub-qa-report.md` usando este snippet JavaScript executado no console da página:

```javascript
const content = `<COLE_AQUI_O_RELATORIO_COMPLETO>`;
const blob = new Blob([content], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'linkhub-qa-report.md';
a.click();
URL.revokeObjectURL(url);
```

Substitua `<COLE_AQUI_O_RELATORIO_COMPLETO>` pelo conteúdo do relatório. Execute o snippet via console ou via comando da extensão. Confirme pra mim que o arquivo foi baixado.

Seja minucioso, honesto e crítico. Se algo tá ruim, diga. Se tá bom, explique por quê. Foco em acionabilidade: cada bug deve ter sugestão de correção técnica.
```

---

## Dicas pro teste funcionar bem

1. **Deixe o dev server rodando** (`npm run dev`) em `localhost:3000`
2. **Use Chrome** (a extensão Claude for Chrome só existe pro Chrome por enquanto)
3. **Faça signup com email novo** (cada teste cria usuário novo)
4. **Se a extensão travar em modal**, diga pra ela fechar com ESC e continuar
5. **O relatório baixa sozinho** — se não baixar, peça pra extensão executar o snippet JS manualmente no console (F12)

## Como interpretar o relatório

Depois que o `linkhub-qa-report.md` cair no seu Downloads, me envie o arquivo (cole o conteúdo no chat ou drag-and-drop). Eu analiso os bugs encontrados e consertamos em ordem de prioridade.
