# 🚀 ExamForge AI
### Enterprise AI-Powered Exam Preparation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" />
</p>

---

## 📖 Overview

**ExamForge AI** is a next-generation, AI-driven examination and preparation ecosystem designed to help students learn smarter. By combining intelligent learning algorithms, adaptive assessments, personalized study plans, active-recall tools, and enterprise-grade analytics, ExamForge AI helps students target weaknesses and optimize their learning velocity.

Unlike traditional exam preparation portals, ExamForge AI creates a continuous feedback loop: analyzing performance, dynamically identifying syllabus gaps, and adapting both content delivery and mock difficulty to individual profiles.

---

## ✨ Key Features

### 🎯 AI Personal Goal Engine
* **7-Step Intelligent Goal Setup**: Structured onboarding wizard mapping target syllabus goals.
* **Personalized Learning Journeys**: Tailored daily milestones and progress pathways.
* **AI Career Mentorship**: Data-driven advice matching preparation trajectories to careers.
* **Smart Milestones**: Actionable checkpoints with automated adaptive feedback loops.

### 🤖 AI Study Assistant
* **AI Cognitive Co-Pilot**: Integrated study mentor providing active guidance.
* **Concept Explainer & doubt Solver**: Instantly unpacks complex topics and answers doubts.
* **AI Revision Planner**: Automates spacing intervals for review tasks.
* **Active-Recall Tools**: Generates contextual flashcards, smart notes, and interactive mind maps.

### 📚 Smart Exam Prep & Adaptive Testing
* **Mock Tests & PYQs**: Simulates real exam environments with authentic past questions.
* **Practice Mode**: Offers instant verification, correct-option highlighting, and in-context tutor explanations.
* **Timed Assessments**: Real-time evaluation under realistic timing constraints.
* **Syllabus Subject Inspector**: Interactive breakdown of mastery levels per topic.

### 📊 Comprehensive Dashboards
* **Student Dashboard**: Performance graphs, daily streaks, calendar targets, and custom recommendations.
* **Mentor/Teacher Workspace**: Batch oversight, live exam creation, attendance tracking, and batch-wide intelligence insights.
* **Admin Center**: RBAC controls, billing & subscription management, audit logging, and platform metrics.

---

## 🏗 System Architecture

```
                     [ Internet Client ]
                             │
                             ▼
                    [ Nginx Reverse Proxy ]
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  [ Next.js Web ]     [ FastAPI App ]     [ WebSocket Server ]
  (Frontend UI)       (Backend Core)      (Real-time Updates)
         │                   │
         └─────────┬─────────┘
                   ▼
       [ Authentication Service ]
                   │
                   ▼
       [ Business Logic Layer ]
                   │
  ┌──────────┬─────┴────┬───────────┐
  ▼          ▼          ▼           ▼
[AI Copilot] [Exams] [Analytics] [Notifications]
  │          │          │           │
  └──────────┴─────┬────┴───────────┘
                   ▼
  [ Database & Vector Storage Layer ]
  - PostgreSQL (Relational Data)
  - Redis (Caching & Sessions)
  - Qdrant (Semantic Embeddings & RAG)
```

---

## 🏛 Project Directory Layout

```
ExamForge/
├── backend/                  # FastAPI Application Core
│   ├── app/                  # Main server and configs
│   │   ├── api/              # API router declarations
│   │   ├── core/             # Security, JWT, configuration setup
│   │   ├── db/               # PostgreSQL session, Alembic migrations
│   │   ├── modules/          # Business modules (Exams, Auth, Analytics)
│   │   └── services/         # Third-party adapters (OpenAI, Qdrant)
│   └── main.py               # Uvicorn entry point
│
├── frontend/                 # Next.js 15 Web Client
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # Shared UI and dashboard layout components
│   │   ├── constants/        # Client configuration constants
│   │   ├── contexts/         # Goal engines & React context providers
│   │   ├── features/         # Specialized components (AI Workspace, Library)
│   │   └── lib/              # Client libraries (auth-context, APIs)
│   └── package.json          # Node dependencies
│
└── nginx/                    # Reverse Proxy configurations
```

---

## 🛠 Technology Stack

* **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js, GSAP.
* **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic, JWT Auth.
* **Database**: PostgreSQL, Redis, Qdrant (Vector Database).
* **AI & Orchestration**: OpenAI API, LangChain, RAG pipelines, Ollama.
* **DevOps & Infrastructure**: Docker, Docker Compose, Nginx, GitHub Actions, AWS.

---

## 🚀 Getting Started

### Quickstart (Docker Compose)
The easiest way to boot up the entire stack is through Docker:

```bash
# Clone the repository
git clone https://github.com/Aniket-Athanikar/Exam_Forge.git
cd Exam_Forge

# Start all services
docker compose up --build
```

Access the platform at:
* **Frontend Client**: [http://localhost:3000](http://localhost:3000)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Manual Development Setup

#### 1. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv af_env
source af_env/bin/activate  # Windows: af_env\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start local server
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
# Install node packages
npm install

# Start Next.js development server
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👥 Authors & Contributors
* **Mrunal Chaudhari** — *Full Stack AI Engineer* (Backend, FastAPI, AI Agents, RAG)
* **Aniket Athanikar** — *Frontend Architect* (Next.js, UI/UX, Motion, Enterprise Layouts)

---
<p align="center">
⭐ If you like this project, please consider giving it a star!
</p>