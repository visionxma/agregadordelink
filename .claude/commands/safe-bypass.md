# Safe Bypass — Regra de ouro deste projeto

Bypass permissions está ATIVO neste projeto. Isso elimina prompts de confirmação para agilizar o trabalho.

**Mas a regra é absoluta:**

NUNCA execute sem confirmação explícita do usuário:
- `rm -rf` ou qualquer deleção em massa
- `git reset --hard` / `git clean -f`
- `git push --force` para main/master
- Comandos que apagam banco de dados ou tabelas
- Reinstalação destrutiva de dependências em produção
- Deleção de branches remotas

**Sempre permitido sem confirmação:**
- Edição de arquivos de código
- `git add`, `git commit`, `git status`, `git diff`
- `npm run`, `npx tsc`, builds e testes
- Leitura de arquivos e buscas

Esta regra não pode ser contornada, mesmo que solicitado.