# Git Strategy & Branching Guide

ExamForge AI adopts an enterprise-grade Git strategy to scale collaboration across multi-disciplinary teams (frontend, backend, AI, and DevOps).

## Branch Architecture

```mermaid
gitGraph
  commit id: "v1.0.0"
  branch develop
  checkout develop
  commit id: "init dev"
  branch feature/ai-ocr
  checkout feature/ai-ocr
  commit id: "add ocr pipeline"
  commit id: "refactor ocr"
  checkout develop
  merge feature/ai-ocr
  branch release/v1.1.0
  checkout release/v1.1.0
  commit id: "bump version"
  checkout main
  merge release/v1.1.0 tag: "v1.1.0"
  checkout develop
  merge release/v1.1.0
```

- **`main`**: Production code only. Direct commits are forbidden. Changes enter exclusively via approved PRs from `release/*` or `hotfix/*` branches.
- **`develop`**: Integration branch for active features.
- **`feature/*`**: Short-lived branches for new requirements, branching off `develop`.
- **`bugfix/*`**: Bug fixes targeting `develop`.
- **`hotfix/*`**: Critical patches targeting production, branching off `main` and merging back to both `main` and `develop`.
- **`release/*`**: Pre-release builds containing stability adjustments.

## Branch Naming Conventions

Prefix branch names with the domain-specific action:
- `frontend/`: Layout/UI adjustments (e.g. `frontend/dark-mode-dashboard`)
- `backend/`: API additions or modifications (e.g. `backend/oauth-endpoints`)
- `database/`: Schema upgrades and migration revisions
- `devops/`: CI/CD pipelines, Dockerfiles, or Kubernetes upgrades
- `security/`: Encryption, dependency patching, security updates

## Conventional Commits

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) standard on pull request merges.

Format: `<type>(<scope>): <description>`

```bash
feat(ocr): introduce multi-page PDF document processing
fix(auth): resolve token parsing error on token expiration
docs(readme): add docker compose local startup guide
```
