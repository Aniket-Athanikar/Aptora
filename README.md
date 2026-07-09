# ExamForge AI — Premium AI-Powered Exam Preparation Platform

An enterprise-grade, high-fidelity SaaS application built with a FastAPI backend and a Next.js 15 App Router frontend. ExamForge AI is engineered to help students crack competitive exams (SSC, UPSC, GATE, Banking, etc.) using customized study guides, AI-generated questions, and adaptive performance tracking.

---

## 🌟 Key Features

### 1. Authentication & Security
- **Dual OTP Validation:** Custom signup/login flows utilizing OTP code verification with CSRF protection and dynamic password strength metrics.
- **Light-Theme HTML Email Verification:** Generates beautiful light-themed welcome emails containing centered grid-box OTP codes and geometric pulsing node graphs ( Three.js geometry style ).
- **Silent Dev Interception:** In development mode, the frontend automatically intercepts, pulls, and auto-populates verification codes into inputs without cluttering the UI.

### 2. Premium User Profile Dashboard
- **Linear & Stripe Style Glassmorphism:** Clean, light-themed premium OS dashboard (`/profile`) supporting aurora gradients, soft shadows, and micro-interactions.
- **KPI Gamification Stats:** Animated count-up displays tracking levels, XP, coins, streak calendar, and mock test scores.
- **Interactive SVG Performance Charts:** Native SVG progression graphs showing weekly studies, solved questions, and overall completions.
- **AI Coach Recommendations:** Time-based greetings and motivational summaries based on strong and weak subjects.
- **Connected Devices & Sessions:** Live session management, device tracking, and security strength scoring.

### 3. Dynamic Database Failover
- **Multi-Port Fallback Connection:** Built-in connection loop checking PostgreSQL ports (scans host `5432` first, fails over to Docker mapped `5433` if native instance blocks auth).
- **Clear Console Logging:** Suppresses verbose connection warning tracebacks, logging only clean status updates.

### 4. Smart UI Gender-Specific Avatars
- **Client-Side Profile Mapping:** Injects Next.js optimized gender-inferred stock avatars dynamically into desktop and mobile layouts based on user registration names.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphic components
- **Animations:** Framer Motion + Motion One
- **Visuals:** Three.js / React Three Fiber (floating particles hero canvas)
- **Icons & Controls:** Lucide React, React Hook Form + Zod validation

### Backend
- **Framework:** FastAPI (Asynchronous) + Uvicorn
- **Object Relational Mapper:** SQLAlchemy (PostgreSQL storage layer)
- **Cache:** Redis integration
- **Search Engine:** Qdrant Vector DB (semantic search)
- **Email Delivery:** SMTP Transport layer

---

## 🚀 Getting Started

### Method 1: Running with Docker Compose (Recommended)

1. Clone or navigate to the project directory.
2. Build and launch all services (PostgreSQL, Redis, Qdrant, Backend, and Frontend):
   ```bash
   docker-compose up --build
   ```
3. Access the services:
   - **Frontend App:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Method 2: Running Locally

#### 1. Setup Backend
1. Navigate to `/backend`.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

#### 2. Setup Frontend
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
