# ──────────────────────────────────────────────
# ExamForge AI — Makefile (Enterprise Edition)
# ──────────────────────────────────────────────

.PHONY: help dev dev-local prod monitoring docker-down docker-clean test lint lint-fix db-migrate db-upgrade db-downgrade k8s-deploy k8s-undeploy helm-deploy helm-undeploy clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────

dev-local: ## Run development environment in separate shell commands
	@echo "Starting development instances..."
	cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
	cd frontend && npm run dev &

dev: ## Start dev environment (Docker compose + live reload)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# ── Production ──────────────────────────────

prod: ## Start production environment (Docker compose production settings)
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# ── Monitoring ──────────────────────────────

monitoring: ## Start monitoring environment (Prometheus, Grafana, Loki, Promtail)
	docker compose -f docker-compose.monitoring.yml up -d

# ── Docker teardowns ────────────────────────

docker-down: ## Stop all active docker services
	docker compose down

docker-clean: ## Stop services and delete volumes
	docker compose down -v --remove-orphans

# ── Database migrations ─────────────────────

db-migrate: ## Generate Alembic migration (usage: make db-migrate msg="description")
	cd backend && alembic revision --autogenerate -m "$(msg)"

db-upgrade: ## Apply head migrations
	cd backend && alembic upgrade head

db-downgrade: ## Downgrade last database migration
	cd backend && alembic downgrade -1

# ── Quality control ─────────────────────────

test: ## Run backend unit & integration tests
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

lint: ## Run Ruff backend checks and ESLint frontend checks
	cd backend && ruff check app/ && ruff format --check app/
	cd frontend && npm run lint

lint-fix: ## Auto-fix format & lint errors
	cd backend && ruff check --fix app/ && ruff format app/
	cd frontend && npm run lint -- --fix

# ── Kubernetes Deployments ──────────────────

k8s-deploy: ## Apply standard raw Kubernetes manifests
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/network-policy.yaml
	kubectl apply -f k8s/db-statefulset.yaml
	kubectl apply -f k8s/redis-statefulset.yaml
	kubectl apply -f k8s/backend-deployment.yaml
	kubectl apply -f k8s/frontend-deployment.yaml
	kubectl apply -f k8s/ingress.yaml
	kubectl apply -f k8s/hpa.yaml

k8s-undeploy: ## Delete all applied raw Kubernetes manifests
	kubectl delete -f k8s/

# ── Helm Management ─────────────────────────

helm-deploy: ## Deploy / upgrade release using Helm
	helm upgrade --install examforge ./helm -n examforge --create-namespace

helm-undeploy: ## Delete Helm release
	helm uninstall examforge -n examforge

# ── Cleanup ──────────────────────────────────

clean: ## Remove build artifacts, cache dirs, lockfiles
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/.next frontend/out backend/htmlcov
