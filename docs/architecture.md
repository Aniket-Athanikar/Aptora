# ExamForge AI — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                   Next.js 15 App Router + TailwindCSS        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
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

## Backend Layer Architecture

```
API Layer (api/v1/)
    ↓ Request validation via Pydantic schemas
Service Layer (services/)
    ↓ Business logic, orchestration
Data Layer (models/ + db/)
    ↓ SQLAlchemy ORM + DB sessions
Infrastructure (core/)
    → Config, Security, Dependencies, Logging
```

## Directory Layout

See the project root `README.md` for the full folder structure tree.

## Key Design Decisions

1. **API Versioning**: All routes prefixed with `/api/v1/` to support future breaking changes
2. **Multi-Port DB Failover**: PostgreSQL connection attempts primary port first, falls back to Docker mapped port
3. **Redis-First OTP Caching**: OTP codes stored in Redis for fast lookup, fallback to PostgreSQL
4. **SMTP with Dev Interception**: Email sending via SMTP with silent frontend OTP interception in dev mode
5. **Layered Architecture**: Routers → Services → Models separation for testability
