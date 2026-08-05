# ExamForge AI — Architecture Overview

ExamForge AI is an enterprise-grade, AI-powered preparation platform tailored for civil services and state-level competitive exams in India (UPSC CSE, MPSC, UPPSC, BPSC, RAS, TNPSC, etc.). This document describes the system architecture, component layout, and the flow of data across the platform.

---

## 1. Executive Goal & Vision
The primary objective of ExamForge AI is to democratize high-quality, personalized mentoring for competitive exams in India. Aspiring civil servants in India, particularly those from rural or underprivileged backgrounds, face challenges in accessing premium coaching institutes. ExamForge AI solves this by providing:
- **Localized Learning:** Dynamic support for regional languages (Hindi, Marathi, Tamil, Telugu, etc.) alongside English.
- **AI Mains Answer Evaluation:** Scoring and detailed feedback on subjective answer sheets based on official UPSC evaluation standards.
- **Adaptive Prelims Engines:** Dynamic difficulty adjustment based on student response patterns.
- **State PSC Customizer:** Tailored state-specific syllabus trees (e.g., Maharashtra geography/history for MPSC).

---

## 2. High-Level System Topology

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                        Client (Browser)                      │
                               │                   Next.js 15 App Router + TailwindCSS        │
                               └──────────────────────────┬──────────────────────────────────┘
                                                          │ HTTPS / REST API / WebSockets
                                                          ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │                    NGINX Reverse Proxy                        │
                               │                  (Load Balancer / TLS Termination)            │
                               └──────────────────────────┬──────────────────────────────────┘
                                                          │
                                                          ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │                   FastAPI Backend (Uvicorn)                   │
                               │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
                               │  │ API v1   │  │ Services │  │ Models   │  │ Schemas    │  │
                               │  │ (Routes) │→ │ (Logic)  │→ │ (ORM)    │  │ (Pydantic) │  │
                               │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
                               └────┬──────────────┬────────────────┬────────────────────────┘
                                    │              │                │
                                    ▼              ▼                ▼
                               ┌──────────┐  ┌──────────┐    ┌──────────┐
                               │PostgreSQL│  │  Redis   │    │  Qdrant  │
                               │ (Primary │  │ (Cache/  │    │ (Vector  │
                               │    DB)   │  │  OTP)    │    │   DB)    │
                               └──────────┘  └──────────┘    └──────────┘
```

---

## 3. Component Breakdown

### A. Frontend Layer (Next.js 15)
- **App Router:** Handles clean, semantic routing for student, tutor, and admin dashboards.
- **AI Study Workspace (`/dashboard/ai`):** High-interaction interface including study timelines, goal setup flows, flashcards, mind maps, and live chatbot support.
- **Resource Inspector:** Interactive tree representation of the exam syllabus, linking topics to study materials, previous year papers (PYQs), and user performance metrics.

### B. Backend API Gateway (FastAPI)
- **FastAPI / Uvicorn:** Core high-performance async framework.
- **Routers (`app/api/`):** Exposes clean REST endpoints and WebSocket hooks.
- **Security Middleware:** CORS protection, rate-limiting handlers, and JWT authorization check.

### C. Services & Orchestration
- **Goal Engine:** 7-step goal setting process mapping out targets, study hours, and weak/strong subjects.
- **AI Agent & RAG Service:** Integrates LangChain/LangGraph to manage vector ingestion, context retrieval, and OpenAI-powered generation and embeddings.
- **OCR Engine:** PyMuPDF / Tesseract integration for processing scanned answer copies, PDF notes, and books uploaded by aspirants.

---

## 4. AI Ingestion & RAG Data Flow

```
                      +-----------------------------+
                      | Aspirant Uploads PDF/Image  |
                      +--------------+--------------+
                                     |
                                     ▼
                      +-----------------------------+
                      | OCR & Text Cleaning Service |
                      +--------------+--------------+
                                     |
                                     ▼
                      +-----------------------------+
                      | Recursive Character Splitter |
                      |     (500 - 1000 chunks)     |
                      +--------------+--------------+
                                     |
                                     ▼
                      +-----------------------------+
                      | Vector Generation Engine    |
                      | (sentence-transformers/LLM) |
                      +--------------+--------------+
                                     |
                                     ▼
                      +-----------------------------+
                      |  Qdrant Vector Database     |
                      |  (Stored with Metadata)     |
                      +-----------------------------+
```

### Retrieval & Query Flow
1. **User Query:** Aspirant asks: *"Explain the criteria for the basic structure doctrine under Article 368."*
2. **Dense Vector Search:** The system generates an embedding of the query and queries the Qdrant database using Cosine Similarity.
3. **Metadata Filtering:** Filters results by target exam (e.g., `exam: UPSC-CSE-Mains`) and topic (e.g., `topic: Polity`).
4. **Context Injection:** Injects the top $K$ chunks as background context into the prompt.
5. **LLM Generation:** The LLM uses the context to generate a structured, factual answer, citing reference papers or Supreme Court judgements.

---

## 5. Regional Language & Localization Pipeline
To support aspirants across all states of India, ExamForge includes a multi-tiered localization wrapper:
- **Language Detection:** Identifies the input language of the user query.
- **Translation Wrapper:** If regional, translates the query into English for vector search across the primary database (which contains standard English syllabus materials).
- **Localized Response Generation:** Generates the final mentoring output back in the regional language using high-fidelity multilingual LLM prompts.

---

## 6. Key Architectural Choices
1. **Separation of Database Concerns:** 
   - **PostgreSQL:** Used for transactional user data, billing records, mock test configurations, and user performance analytics.
   - **Redis:** Used for volatile sessions, rate-limiting counters, and fast OTP validation codes.
   - **Qdrant:** Used for high-dimensional semantic search indexing.
2. **Asynchronous Task Workers:** Long-running tasks like processing 50-page PDFs or generating a full 12-month study plan are offloaded to background workers using FastAPI's native `BackgroundTasks`.
3. **Layered Decoupling:** API endpoints validate schemas (Pydantic), delegate business logic to services, and access data through SQLAlchemy models.
