# Aptora — Error Handling & Resilience Guide

This document describes the platform's error handling strategies, retry policies, and failover mechanisms designed to maintain service availability for UPSC/State PSC aspirants.

---

## 1. FastAPI Exception Handler Middleware

The backend uses custom global exception handlers to intercept errors and map them to clean, standardized JSON responses.

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "validation_error",
            "message": "Input validation failed",
            "details": exc.errors()
        }
    )
```

Standardized response format:
```json
{
  "error": "short_error_code",
  "message": "Human-readable message explaining what went wrong",
  "code": 400
}
```

---

## 2. LLM Call Retry Policies

To handle network fluctuations or API rate-limiting issues when invoking cloud model APIs (OpenAI / Gemini / Anthropic):
- **Exponential Backoff:** The RAG and Evaluation services use exponential backoff (`tenacity` library in Python) to retry failed LLM calls.
- **Failover Models:** If the primary high-tier model (e.g., GPT-4o / Gemini Pro) experiences service outages, the system automatically falls back to secondary, cost-effective models (e.g., GPT-3.5 / Gemini Flash) to maintain basic conversational capabilities.

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def generate_completion_with_retry(prompt: str):
    # LLM invocation logic
    ...
```

---

## 3. Database Failover & Connection Resilience

### A. Multi-Port Fallover (PostgreSQL)
If PostgreSQL is deployed in a cluster, the backend connection utility attempts to connect to the primary host/port first, falling back to read-replicas or Docker-mapped ports if the primary fails to respond within a timeout window:
```python
# db/session.py fallback attempt logic
try:
    engine = create_engine(PRIMARY_DATABASE_URL)
    connection = engine.connect()
except OperationalError:
    logger.warning("Primary database connection failed. Falling back to replica.")
    engine = create_engine(FALLBACK_DATABASE_URL)
```

### B. Redis Outage Failover
If the Redis caching layer becomes unavailable, the system degrades gracefully:
- **OTP Fallback:** The API client intercepts Redis errors and routes OTP storage to the primary PostgreSQL `otps` table.
- **Rate Limiting Fallback:** The system bypasses strict IP rate-limiting or switches to an in-memory `dict`-based cache as a temporary safeguard.

---

## 4. Frontend Resilience & Error Boundaries

- **React Error Boundaries:** Main features (like the AI Workspace and Mock Test Engine) are wrapped in React `ErrorBoundary` components to prevent a single component crash from breaking the entire application.
- **Toast Notifications:** Displays non-intrusive notification alerts (using `react-hot-toast` or local alert banners) for minor API issues.
- **Offline Mode Detection:** Notifies the user if their internet connection drops, prompting them to review local study materials while offline.
