# Deployment Guide

ExamForge AI is designed for containerized deployments across diverse environments (development, staging, production).

## Local Development (Docker Compose)

To start the complete development workspace with hot-reloading:

```bash
# Clone the repository
git clone https://github.com/Aniket-Athanikar/Exam_Forge.git
cd Exam_Forge

# Start services using the Makefile wrapper
make dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000) and the backend API on [http://localhost:8000](http://localhost:8000).

## Kubernetes Deployments

All Kubernetes resource manifests are stored inside `k8s/` or modularized inside `helm/`.

### Prerequisites
- Configured connection to K8s cluster (ensure `kubectl get nodes` functions)
- Ingress controller (e.g. Nginx ingress controller)

### 1. Manual Manifest Deployment
To deploy using raw manifests:

```bash
# Deploy all configurations, DBs, and application servers
make k8s-deploy
```

### 2. Helm Deployment
To install or upgrade using Helm:

```bash
# Build values and deploy
make helm-deploy
```

To configure staging vs production settings, edit the overrides in `helm/values.yaml` or provide a separate environment values file:

```bash
helm upgrade --install examforge ./helm -f helm/values-production.yaml -n examforge
```

## Rollbacks & Disaster Recovery

### Kubernetes Deployment Rollback
If a deployment fails health checks or exhibits production bugs:

```bash
# Rollback backend deployment to previous revision
kubectl rollout undo deployment/backend -n examforge

# Rollback frontend deployment
kubectl rollout undo deployment/frontend -n examforge
```

### Database Restoration
To restore PostgreSQL from an automated backup volume:

```bash
# Example restore command
cat backup.sql | kubectl exec -i postgres-0 -n examforge -- psql -U examforge_admin -d examforgedb
```
