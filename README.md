🚀 ExamForge AI
Enterprise AI-Powered Exam Preparation Platform

<p align="center">
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-success)
</p>

📖 Overview
ExamForge AI is a next-generation AI-powered examination platform designed to help students prepare smarter using intelligent learning, adaptive assessments, personalized study plans, AI tutors, and enterprise-grade analytics.

Unlike traditional exam portals, ExamForge AI creates an adaptive learning ecosystem where AI continuously analyzes performance, identifies weak topics, generates personalized content, and guides students toward better results.



✨ Key Features
🎯 AI Personal Goal Engine
- 7-Step Intelligent Goal Setup
- Personalized Learning Journey
- AI Career Guidance
- Dynamic Learning Roadmap
- Progress Tracking
- Editable Goal Planning
- Smart Milestones

🤖 AI Learning Assistant
- AI Study Mentor
- AI Question Generator
- AI Doubt Solver
- AI Concept Explainer
- AI Revision Planner
- AI Smart Notes
- AI Flashcards
- AI Mind Maps

📚 Smart Exam Preparation
- Mock Tests
- Previous Year Papers
- Topic-wise Practice
- Difficulty Levels
- Adaptive Tests
- Timed Assessments
- Instant Feedback
- Performance Analytics

📊 Student Dashboard
- Personalized Dashboard
- Daily Progress
- Weekly Reports
- Learning Streak
- Goal Tracking
- AI Recommendations
- Performance Graphs
- Study Calendar

👨‍🏫 AI Dashboard
- Student Analytics
- Batch Management
- Live Tests
- Assignment Management
- Attendance
- Leaderboards
- Reports
- AI Performance Insights

🏢 Admin Dashboard
- User Management
- Role Based Access Control
- Institute Management
- Payment Management
- Subscription Plans
- Analytics
- Notifications
- Audit Logs

🧠 AI Capabilities
- GPT Integration
- Personalized AI Tutor
- AI Roadmaps
- Adaptive Learning
- Smart Recommendations
- AI Performance Prediction
- AI Career Suggestions
- AI Progress Analysis
- AI Goal Planning
- AI Learning Path Optimization


🏗 Enterprise Architecture

                     Internet
                         │
                         ▼
                  Nginx Reverse Proxy
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    Next.js         FastAPI API      WebSocket
    Frontend         Backend          Server
        │                │
        ├────────────────┤
        ▼
    Authentication Service
        │
        ▼
    Business Logic Layer
        │
 ┌──────┼──────────┬───────────┐
 ▼      ▼          ▼           ▼
 AI     Exams    Analytics   Notifications
 Engine Engine    Engine        Engine
         │
         ▼
    PostgreSQL + Redis + Qdrant


🏛 Project Structure
ExamForge/

├── backend/
│   ├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── modules/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── app/
│   ├── components/
│   ├── dashboard/
│   ├── services/
│   └── public/
│
├── nginx/
├── docker-compose.yml
├── README.md
└── .gitignore


🛠 Technology Stack
Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- GSAP
- React Hook Form

Backend
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- OAuth2
- Pydantic
- Uvicorn

Database
- PostgreSQL
- Redis
- Qdrant
- Vector Search

AI
- OpenAI
- LangGraph
- LangChain
- RAG
- Ollama
- Embeddings
- AI Agents

DevOps
- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Linux
- Ubuntu
- AWS
- Vercel

🚀 Getting Started
Clone Repository
bash
git clone https://github.com/Aniket-Athanikar/Exam_Forge.git

cd Exam_Forge
Docker Setup
bash
docker compose up --build

Application:
Frontend
http://localhost:3000

Backend
http://localhost:8000

Swagger
http://localhost:8000/docs


Backend Setup
bash
cd backend
python -m venv af_env
source af_env/bin/activate

Windows bash
af_env\Scripts\activate


Install bash
pip install -r requirements.txt
Run bash
py -m uvicorn app.main:app --reload


Frontend Setup
bash
cd frontend
npm install
npm run dev


🔐 Security
- JWT Authentication
- Refresh Tokens
- Email Verification
- Password Reset
- RBAC
- CORS Protection
- SQL Injection Protection
- XSS Protection
- CSRF Protection
- Rate Limiting


📊 Platform Modules
✅ Authentication
✅ Landing Website
✅ Student Dashboard
✅ AI Dashboard
✅ Admin Dashboard
✅ AI Goal Engine
✅ AI Mentor
✅ AI Mock Tests
✅ AI Analytics
✅ Payments
✅ Notifications
✅ Reports

📈 Roadmap
Phase 1
- Authentication
- Landing Page
- Dashboard

Phase 2
- AI Goal Engine
- AI Mentor
- AI Study Planner

Phase 3
- AI Mock Tests
- Adaptive Learning
- AI Analytics

Phase 4
- Marketplace
- Mobile App
- Enterprise Features

🤝 Contributing
# bash
Fork Repository
Create Feature Branch
git checkout -b feature/amazing-feature

Commit Changes
git commit -m "Add amazing feature"

Push Branch
git push origin feature/amazing-feature
Create Pull Request


📄 License
Licensed under the MIT License.


👨‍💻 Authors
---Mrunal Chaudhari---
• Full Stack AI Engineer
•Backend •AI •FastAPI •Next.js

---Aniket Athanikar---
• Frontend Engineer
•UI|UX •React •Next.js •Enterprise Frontend


🌟 Vision
Our mission is to build India's most intelligent AI-powered examination platform that transforms the way students learn, prepare, and achieve success through adaptive learning, personalized AI guidance, and enterprise-grade technology.


<p align="center">
⭐ If you like this project, please consider giving it a star!
Built with  using Next.js, FastAPI, AI, and modern cloud technologies.❤️
</p>