# ──────────────────────────────────────────────
# ExamForge AI — Makefile
# ──────────────────────────────────────────────

.PHONY: help dev dev-backend dev-frontend docker-up docker-down test lint db-migrate clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────

dev-backend: ## Start backend dev server
	cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

dev: ## Start both backend and frontend (requires two terminals)
	@echo "Run 'make dev-backend' and 'make dev-frontend' in separate terminals"

# ── Docker ───────────────────────────────────

docker-up: ## Build and start all Docker services
	docker-compose up --build

docker-down: ## Stop all Docker services
	docker-compose down

docker-clean: ## Stop services and remove volumes
	docker-compose down -v --remove-orphans

# ── Database ─────────────────────────────────

db-migrate: ## Generate new Alembic migration (usage: make db-migrate msg="description")
	cd backend && alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Apply all pending migrations
	cd backend && alembic upgrade head

db-downgrade: ## Rollback last migration
	cd backend && alembic downgrade -1

# ── Testing ──────────────────────────────────

test: ## Run all tests
	cd backend && pytest tests/ -v --tb=short

test-coverage: ## Run tests with coverage report
	cd backend && pytest tests/ -v --cov=app --cov-report=html

# ── Linting ──────────────────────────────────

lint: ## Lint both backend and frontend
	cd backend && ruff check app/
	cd frontend && npm run lint

lint-fix: ## Auto-fix lint issues
	cd backend && ruff check --fix app/
	cd frontend && npm run lint -- --fix

# ── Cleanup ──────────────────────────────────

clean: ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/.next frontend/out backend/htmlcov
