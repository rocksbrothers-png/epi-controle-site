# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento adota [SemVer](https://semver.org/lang/pt-BR/).
Os commits seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## [Unreleased]

### Added
- Variante leve de CI/CD: CodeQL (JavaScript) e workflow de Segurança
  (Dependency Review tolerante + Secret Scan via gitleaks).
- Dependabot (npm + github-actions), CODEOWNERS, templates de PR/Issue,
  agrupamento automático de Release Notes e documentação em `docs/ci-cd`.

### Changed
- `ci.yml`: adicionados `concurrency` (cancela runs antigos) e
  `workflow_dispatch` (execução manual).
