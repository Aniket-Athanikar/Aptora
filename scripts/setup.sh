#!/usr/bin/env bash
# ──────────────────────────────────────────────
# ExamForge AI — Local Development Setup Script
# ──────────────────────────────────────────────
set -euo pipefail

echo "🚀 ExamForge AI — Setting up local development environment..."

# ── Backend Setup ────────────────────────────
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "  Activating virtual environment..."
source venv/bin/activate

echo "  Installing dependencies..."
pip install -q -r requirements.txt
pip install -q -r requirements-dev.txt

if [ ! -f ".env" ]; then
    echo "  Copying .env.example → .env"
    cp .env.example .env
    echo "  ⚠️  Please edit backend/.env with your actual configuration values."
fi

cd ..

# ── Frontend Setup ───────────────────────────
echo ""
echo "📦 Setting up Frontend..."
cd frontend

echo "  Installing Node.js dependencies..."
npm install --silent

cd ..

# ── Done ─────────────────────────────────────
echo ""
echo "✅ Setup complete!"
echo ""
echo "Start developing:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker: docker-compose up --build"
