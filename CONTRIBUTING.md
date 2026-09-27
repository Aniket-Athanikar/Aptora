# Contributing to Aptora

Thank you for contributing to Aptora! To maintain quality and velocity, we follow strict Git workflows, branch strategies, and code formatting rules.

## Git Branch Strategy

Always create branches using the following prefix conventions:

- `feature/*` -> New features (e.g. `feature/ai-library`, `feature/book-processing`)
- `bugfix/*` -> Bug fixes targeting development/QA (e.g. `bugfix/auth`)
- `hotfix/*` -> Critical bug fixes targeting production (e.g. `hotfix/payment`)
- `release/*` -> Release prep branches (e.g. `release/v1.4.0`)
- `experiment/*` -> R&D or proof of concepts
- `ai/*` -> Specialized AI/OCR changes
- `frontend/*` -> Frontend styling/component changes
- `backend/*` -> Backend core logic/API changes
- `devops/*` -> Pipeline, Docker, Helm, or monitoring config changes
- `database/*` -> Database migrations and seeds
- `security/*` -> Security hardening or vulnerability patching
- `docs/*` -> Documentation updates

## Naming Convention

- Use lowercase separated by hyphens (kebab-case): `feature/user-dashboard`, `bugfix/fix-jwt-expiration`.

## Commit Message Guidelines

We follow **Conventional Commits**:
`<type>(<scope>): <description>`

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Refactoring production code
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc.
- `ci`: CI pipeline configurations

### Example
`feat(auth): add OAuth2 Google login flow`

## Pull Request Guidelines

1. Fork/branch from `develop`.
2. Keep PRs focused. Do not combine backend database migrations with frontend styling.
3. Ensure local tests run and pass (`make test`).
4. Ensure code formatting is clean (`make lint`).
5. Open PR targeting the `develop` branch (or `main` for hotfixes).
