# Infraestrutura de CI/CD — EPI Controle (site institucional)

Variante **leve** da esteira, adequada ao `epi-controle-site` — um site
institucional Node estático (`server.js` + páginas HTML + `i18n_system.js`).
Espelha os princípios da infra do monorepo `epi-controle`, sem as partes de
Flutter/Backend Python/PostgreSQL, que não se aplicam aqui.

---

## 1. Workflows

| Workflow | Arquivo | Papel |
|----------|---------|-------|
| CI | `ci.yml` | valida a sintaxe de todo `.js` (`node --check`) e o carregamento do `server.js` |
| CodeQL | `codeql.yml` | SAST de JavaScript (PR/push/semanal) |
| Security | `security.yml` | Dependency Review (tolerante) + Secret Scan (gitleaks) |

Config auxiliar: `dependabot.yml` (npm + github-actions), `release.yml`
(release notes agrupadas), `CODEOWNERS`, `PULL_REQUEST_TEMPLATE.md`,
`ISSUE_TEMPLATE/`.

---

## 2. Fluxo

```
        Pull Request / Push
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
   CI        CodeQL      Security
 node --check  SAST js   dep-review + gitleaks
    │
    ▼
  checks verdes → Branch Protection → merge
    ▼
  Deploy (Render — render.yaml)
```

## 3. Toolchain

- **Node.js** 18 (`actions/setup-node@v4`) — mesma engine do `package.json`.

## 4. Secrets / variáveis

Os jobs de CI/segurança **não exigem secrets** (o `GITHUB_TOKEN` padrão basta
para gitleaks e dependency-review). O deploy é gerido pelo Render via
`render.yaml`.

## 5. Branch Protection recomendada (`main`)

- ✅ Require a pull request before merging (1+ aprovação)
- ✅ Require review from Code Owners
- ✅ Require status checks: `Validar site estático` (ci.yml), `Analyze (javascript)` (codeql.yml)
- ✅ Require conversation resolution

> `dependency-review` roda com `continue-on-error` até o admin habilitar o
> Dependency graph em Settings → Code security and analysis.

## 6. Rodando localmente

```bash
npm run lint     # node --check em todos os .js
npm start        # sobe o servidor local (server.js)
```

## 7. Deploy

O site é publicado no Render conforme `render.yaml`. Merge na `main` com checks
verdes → o Render faz o deploy do serviço. Rollback: redeploy do commit anterior
no painel do Render, ou `git revert` do PR problemático.

## 8. Como adicionar um workflow

1. Crie `.github/workflows/<nome>.yml` restringindo `on:`/`paths:`.
2. Reutilize a versão de Node existente.
3. Inclua `concurrency:` para cancelar runs antigos.
4. Registre o job na Branch Protection se for gate obrigatório.
