# 🚀 Aptora — AI Exam Preparation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.20-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.139.0-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Qdrant-Vector_DB-DC2626?style=for-the-badge&logo=qdrant" alt="Qdrant" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" />
</p>

---

## 📖 Overview

**Aptora** is an AI-powered exam preparation platform designed to help students organize their preparation, study with contextual AI assistance, work with learning resources, practice through mock examinations, and track their progress.

The platform combines a modern **Next.js frontend**, **FastAPI backend**, **PostgreSQL**, **Redis**, **Qdrant Vector Database**, and **LLM-powered retrieval workflows** to provide an integrated learning environment.

Aptora focuses on turning a student's study material and preparation goals into a structured learning experience through:

* 🤖 AI-powered study assistance
* 📚 Personal learning resources
* 🔎 Retrieval-Augmented Generation (RAG)
* 📝 AI-generated study notes
* 🎯 Mock examination workflows
* 📊 Study progress and performance tracking
* 📅 Personalized study planning
* 🔐 Secure authentication and account management
* 📄 Automated PDF invoice generation
* 📧 Email delivery with PDF attachments

---

# 🎨 Aptora UI Showcase

## 1. 🌐 Landing Page & Platform Overview

The Aptora landing page introduces the platform, its learning capabilities, AI workflows, resources, pricing, FAQs, and primary calls to action.

### Landing Page Screens

<table>
  <tr>
    <td width="50%">
      <img src="frontend/public/1.png" alt="Aptora Landing Page 1" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/2.png" alt="Aptora Landing Page 2" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/3.png" alt="Aptora Landing Page 3" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/4.png" alt="Aptora Landing Page 4" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/5.png" alt="Aptora Landing Page 5" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/6.png" alt="Aptora Landing Page 6" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/7.png" alt="Aptora Landing Page 7" width="100%" />
    </td>
    <td></td>
  </tr>
</table>

---

## 2. 🤖 AI Study Flow & Conversational Learning

Aptora provides a conversational AI study workflow designed to guide students through multiple stages of contextual learning.

The following screens demonstrate the AI study journey from the initial interaction through the different stages of the learning workflow.

### AI Study Flow — 7 Stages

<table>
  <tr>
    <td width="50%">
      <img src="frontend/public/stage-1.png" alt="Aptora AI Study Flow Stage 1" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/stage-2.png" alt="Aptora AI Study Flow Stage 2" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/stage-3.png" alt="Aptora AI Study Flow Stage 3" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/stage-4.png" alt="Aptora AI Study Flow Stage 4" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/stage-5.png" alt="Aptora AI Study Flow Stage 5" width="100%" />
    </td>
    <td width="50%">
      <img src="frontend/public/stage-6.png" alt="Aptora AI Study Flow Stage 6" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="frontend/public/stage-7.png" alt="Aptora AI Study Flow Stage 7" width="100%" />
    </td>
    <td></td>
  </tr>
</table>

---

## 3. 📊 Student Dashboard & Interactive Study Engine

The dashboard provides students with an overview of their preparation and current study activity.

**Features include:**

* Study goals and progress
* Streak tracking
* Recommended study activities
* Recent activity
* Interactive study sessions
* Pomodoro-style study workflows

<p align="center">
  <img src="frontend/public/student-study.png" alt="Aptora Student Dashboard" width="850" />
</p>

---

## 4. 🎯 Custom Mock Exams & Practice

Aptora supports structured practice and mock examination workflows.

**Features include:**

* Timed examination sessions
* Question and option evaluation
* Answer explanations
* Subject-wise practice
* Performance tracking

<p align="center">
  <img src="frontend/public/blog-mock-tests.png" alt="Aptora Mock Examination Platform" width="850" />
</p>

---

## 5. 📚 Digital Syllabus & Resource Library

Students can organize learning resources and reference material inside the platform.

**Features include:**

* Learning resource management
* Book and document organization
* Previous Year Question (PYQ) resources
* Syllabus-oriented preparation
* Resource indexing for AI-assisted workflows

<p align="center">
  <img src="frontend/public/blog-upsc-books.png" alt="Aptora Digital Resource Library" width="850" />
</p>

---

# 🏗 System Architecture

```mermaid
graph TD

    subgraph Clients["🌐 Client Layer"]
        Browser["Next.js 15 Web App<br/>(React 19 / TypeScript)"]
        Mobile["Responsive Web UI"]
    end

    subgraph Gateway["🛡️ Gateway & Reverse Proxy"]
        Nginx["Nginx Reverse Proxy"]
    end

    subgraph Backend["⚡ Backend Application"]
        FastAPI["FastAPI<br/>(Uvicorn / Python 3.11+)"]
        AuthService["Authentication & JWT"]
        BillingService["Billing & PDF Service"]
        EmailService["SMTP Email Service"]
        ChatExport["Chat Export"]
    end

    subgraph AI["🧠 AI & Retrieval Layer"]
        OpenAI["OpenAI API"]
        TokenManager["Token Budget Manager"]
        QdrantService["Qdrant Service"]
    end

    subgraph Storage["💾 Data & Cache Layer"]
        Postgres[(PostgreSQL)]
        Redis[(Redis)]
        Qdrant[(Qdrant Vector DB)]
    end

    subgraph Observability["📊 Observability"]
        Prometheus["Prometheus"]
        Grafana["Grafana"]
        Loki["Loki"]
        Promtail["Promtail"]
    end

    Browser --> Nginx
    Mobile --> Nginx

    Nginx --> FastAPI

    FastAPI --> AuthService
    FastAPI --> BillingService
    FastAPI --> ChatExport
    FastAPI --> TokenManager
    FastAPI --> QdrantService

    BillingService --> EmailService
    BillingService --> Postgres

    TokenManager --> OpenAI

    QdrantService --> Qdrant

    FastAPI --> Postgres
    FastAPI --> Redis

    Prometheus --> FastAPI
    Prometheus --> Nginx

    Grafana --> Prometheus
    Promtail --> Loki
    Grafana --> Loki
```

---

# 🗄 Entity-Relationship Diagram

```mermaid
erDiagram

    USERS ||--o| USER_PROFILES : has
    USERS ||--o| USER_ONBOARDING_PROFILES : configures
    USERS ||--o{ ORDERS : places
    USERS ||--o{ RESOURCES : owns
    USERS ||--o{ WORKSPACE_SUBJECTS : enrolls
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ ACHIEVEMENTS : earns

    USERS {
        int id PK
        string email UK
        string hashed_password
        boolean is_active
        boolean is_superuser
        datetime created_at
    }

    USER_PROFILES {
        int id PK
        int user_id FK
        string full_name
        string plan
        string plan_renewal
        string avatar_url
        int target_year
        string preferred_exam
    }

    USER_ONBOARDING_PROFILES {
        int id PK
        int user_id FK
        string target_exam
        string daily_hours
        string preparation_state
        jsonb primary_weakness
    }

    ORDERS {
        int id PK
        int user_id FK
        string plan_name
        string cycle
        string amount
        string txn_id UK
        datetime created_at
    }

    RESOURCES {
        int id PK
        int user_id FK
        string title
        string resource_type
        string file_path
        datetime created_at
    }

    RESOURCE_CONTENTS {
        int id PK
        int resource_id FK
        text raw_text
        jsonb metadata
    }

    RESOURCES ||--o| RESOURCE_CONTENTS : contains

    WORKSPACE_SUBJECTS {
        int id PK
        int user_id FK
        string subject_name
        int progress_percentage
        string status
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        string message
        boolean read
        datetime created_at
    }
```

---

# 🧩 Software Class Diagram

```mermaid
classDiagram

    class FastAPIApp {
        +lifespan(app)
        +include_router()
    }

    class TokenBudgetManager {
        -encoder: Any
        +get_encoder()
        +count_tokens(text: str) int
        +count_messages_tokens(messages: list) int
        +slice_context_to_budget(chunks: list, max_tokens: int) list
        +slice_history_to_budget(history: list, max_tokens: int) list
    }

    class QdrantService {
        +client: QdrantClient
        +create_collection()
        +upsert_documents(documents: list)
        +search_similar(query: str, limit: int) list
    }

    class PDFService {
        +generate_invoice_pdf(email: str, plan: str, cycle: str, amount: str, txn_id: str) bytes
    }

    class EmailService {
        +send_real_email(recipient: str, subject: str, html: str) bool
        +send_email_with_pdf_attachment(recipient: str, subject: str, html: str, pdf_bytes: bytes, filename: str) bool
    }

    class LLMService {
        +generate(prompt: str) str
        +generate_json(prompt: str, schema: dict) dict
        +stream_response(prompt: str) Generator
    }

    class AuthService {
        +authenticate_user(email, password) User
        +create_access_token(data) str
        +get_current_user(token) User
    }

    FastAPIApp --> TokenBudgetManager
    FastAPIApp --> QdrantService
    FastAPIApp --> PDFService
    FastAPIApp --> EmailService
    FastAPIApp --> AuthService

    TokenBudgetManager --> LLMService
    PDFService --> EmailService
```

---

# 🛠 Technology Stack

| Domain               | Technology               | Purpose                                  |
| :------------------- | :----------------------- | :--------------------------------------- |
| **Frontend**         | **Next.js 15.5.20**      | Application framework and routing        |
| **UI Library**       | **React 19.1.0**         | Component-based UI                       |
| **Styling**          | **CSS / Tailwind CSS**   | Responsive interface and design system   |
| **Animation**        | **Framer Motion**        | UI interactions and animations           |
| **Backend**          | **FastAPI 0.139.0**      | High-performance Python REST API         |
| **Language**         | **Python 3.11+**         | Backend and AI services                  |
| **Database**         | **PostgreSQL 15**        | Persistent relational data               |
| **Cache**            | **Redis 7**              | Caching, OTP throttling, and task state  |
| **Vector Database**  | **Qdrant**               | Embedding storage and semantic retrieval |
| **AI Integration**   | **OpenAI API**           | LLM generation and embeddings            |
| **Token Management** | **tiktoken**             | Token counting and context management    |
| **PDF Generation**   | **ReportLab**            | Invoice PDF generation                   |
| **Email**            | **smtplib + MIME**       | Transactional email and attachments      |
| **Containerization** | **Docker Compose**       | Multi-service development and deployment |
| **Reverse Proxy**    | **Nginx**                | Request routing and service proxying     |
| **Monitoring**       | **Prometheus + Grafana** | Metrics and system monitoring            |
| **Logging**          | **Loki + Promtail**      | Centralized log collection               |

---

# 📂 Project Directory Structure

```text
Aptora/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── orchestrator/
│   │   │   └── services/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── 1.png
│   │   ├── 2.png
│   │   ├── 3.png
│   │   ├── 4.png
│   │   ├── 5.png
│   │   ├── 6.png
│   │   ├── 7.png
│   │   ├── stage-1.png
│   │   ├── stage-2.png
│   │   ├── stage-3.png
│   │   ├── stage-4.png
│   │   ├── stage-5.png
│   │   ├── stage-6.png
│   │   ├── stage-7.png
│   │   └── other UI assets
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── features/
│   │   └── middleware.ts
│   │
│   ├── next.config.ts
│   └── package.json
│
├── nginx/
│   └── nginx.conf
│
├── monitoring/
│   ├── prometheus.yml
│   ├── promtail-config.yml
│   └── loki-config.yml
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.monitoring.yml
├── Taskfile.yml
├── LICENSE
└── README.md
```

---

# ⚡ Quickstart

## Option 1 — Docker Compose

Docker Compose is the recommended way to run the complete Aptora stack.

### Clone the repository

```bash
git clone https://github.com/Aniket-Athanikar/Aptora.git
cd Aptora
```

### Start the application

```bash
docker compose up --build -d
```

### Access the services

| Service              | URL                               |
| :------------------- | :-------------------------------- |
| **Aptora Web App**   | `http://localhost:80`             |
| **FastAPI Swagger**  | `http://localhost:8000/docs`      |
| **Qdrant Dashboard** | `http://localhost:6433/dashboard` |

---

# 🧰 Taskfile Commands

Aptora includes a `Taskfile.yml` for common development operations.

```bash
# Start development environment
task dev

# Start monitoring services
task monitoring

# View container status
task status

# View application logs
task logs

# Run backend tests
task test

# Validate frontend build
task test-frontend

# Stop services
task down
```

---

# 💻 Manual Development Setup

## Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

---

# ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory.

```env
PROJECT_NAME=Aptora
ENV=development

SECRET_KEY=your_secret_key

# PostgreSQL
DB_HOST=localhost
DB_PORT=5433
DB_NAME=aptora_db
DB_USER=aptora_user
DB_PASSWORD=your_database_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6479

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6433
QDRANT_COLLECTION=aptora_documents

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# SMTP
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

> **Security:** Never commit `.env`, API keys, passwords, SMTP credentials, tokens, or other secrets to the repository. Use `.env.example` for safe configuration templates.

---

# 🧪 Testing

## Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

## Frontend Build

```bash
cd frontend
npm run build
```

---

# 🔐 Security

Aptora uses environment-based configuration for sensitive credentials.

The following should **never** be committed to Git:

* API keys
* Database passwords
* JWT secrets
* SMTP passwords
* Access tokens
* Private credentials
* Production environment files

Use `.gitignore` and `.env.example` to separate configuration from source code.

---

# 👥 Engineering & Author Credits

### Aniket Athanikar

**Backend & AI Engineering**

Responsible for the backend architecture and AI engineering, including:

* FastAPI backend
* REST API development
* Authentication and authorization
* JWT-based security
* PostgreSQL integration
* Redis integration
* Qdrant vector database integration
* RAG workflows
* Document processing
* AI/LLM integration
* Token management
* PDF generation
* Email services
* Backend Docker configuration

### Mrunal Chaudhari

**Frontend Engineering & UI/UX**

Responsible for the frontend application and user experience, including:

* Next.js application
* React components
* UI/UX implementation
* Responsive layouts
* Landing page
* Authentication screens
* Dashboard interface
* Learning workflows
* Frontend state and interactions
* Design system and visual implementation

---

# 📜 License

This project is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

<p align="center">
  ⭐ <strong>If you find Aptora useful, consider starring the repository.</strong>
</p>

<p align="center">
  <strong>Aptora — Learn smarter. Prepare better.</strong>
</p>
