# Aptora — Developer Setup Guide

## Prerequisites

- **Python** 3.11+
- **Node.js** 20+
- **Docker** & Docker Compose (optional, for containerized setup)
- **PostgreSQL** 15+ (if running locally without Docker)
- **Redis** 7+ (optional)

## Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url> && cd Examp_Forge

# Copy environment template
cp .env.example backend/.env

# Build and launch all services
docker-compose up --build

# Access:
# Frontend → http://localhost:3002
# Backend API → http://localhost:8000/docs
# NGINX LB → http://localhost:8080
```

## Local Development Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your local values

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Using Make (convenience commands)

```bash
make dev          # Start both backend + frontend
make dev-backend  # Start backend only
make dev-frontend # Start frontend only
make docker-up    # Docker compose up
make docker-down  # Docker compose down
make test         # Run all tests
make lint         # Lint both backend + frontend
make db-migrate   # Generate new Alembic migration
```

## Environment Variables

See `.env.example` at project root for all required environment variables.

## Project Structure

See `docs/architecture.md` for the full architecture overview.
