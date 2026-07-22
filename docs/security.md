# ExamForge AI — Security Architecture & Guidelines

ExamForge AI is designed with an enterprise-grade security posture to protect sensitive student data, prevent unauthorized system access, secure LLM operations, and comply with standard data protection protocols in India (DPDP Act 2023).

---

## 1. Authentication & Session Management

- **JWT Tokens:** Uses secure, signature-validated JSON Web Tokens (using HMAC-SHA256).
  - **Access Tokens:** Short-lived tokens (15-30 minutes expiration) passed via client headers.
  - **Refresh Tokens:** Long-lived tokens (7 days expiration) stored in `HttpOnly, Secure, SameSite=Strict` cookies to mitigate Cross-Site Scripting (XSS) risks.
- **OTP Verification (Redis-Backed):**
  - Registration, password resets, and account deletion operations require a 6-digit OTP code sent via mail.
  - The OTP code is cached in Redis with a strict 5-minute expiration and marked as `is_used` immediately after the first validation attempt to block reuse attacks.

---

## 2. Role-Based Access Control (RBAC)

The system enforces strict route-level and service-level authorization checks based on three main roles:

| Role | Access Permissions |
| :--- | :--- |
| **Student** | Can update profile, manage goals, interact with AI mentor, upload notes, and take mock tests. Cannot access global analytics or edit system templates. |
| **Tutor / Evaluator** | Inherits Student permissions. Can review student submissions, edit mock exam papers, view batch-level reports, and grade Mains papers manually. |
| **Admin** | Full system access. Can modify system settings, run DB migrations, view billing records, delete users, and manage global system prompts. |

FastAPI endpoint validation example:
```python
@router.get("/admin/users", dependencies=[Depends(require_role("Admin"))])
async def list_all_users():
    ...
```

---

## 3. Rate Limiting & Denial of Service Protection

To prevent API abuse and cost overrun from LLM endpoints, ExamForge implements sliding-window rate limiting using Redis:

- **Standard REST Routes:** 100 requests per minute per IP address.
- **AI Chat & Ingestion Routes:** 10 requests per minute per user ID (to prevent resource starvation and protect API wallet).
- **OTP Generation Routes:** Strict limit of 3 requests per 10 minutes per email address to prevent SMTP spamming.

---

## 4. Personally Identifiable Information (PII) & Data Protection

- **Encryption at Rest:** All sensitive database columns (e.g., telephone numbers, OAuth links, billing transaction details) are encrypted at rest using AES-256 keys managed by environmental configurations.
- **File Storage Safety:** Hand-written answers and PDF study guides uploaded by students are stored in access-controlled object storage (e.g., AWS S3 or GCP Cloud Storage) with signed URLs expiring after 15 minutes.
- **DPDP Compliance:** Account Deletion requests are processed automatically. Upon verification, the user profile is hard-deleted or anonymized, removing emails, phone numbers, and bio lines from databases.

---

## 5. LLM Safety & Prompt Injection Prevention

- **System Prompt Sandboxing:** The model context is configured with boundaries preventing the system prompt from being outputted to the user.
- **Input Sanitization:** User messages are scanned for keywords indicating prompt manipulation (e.g., *"Ignore previous instructions"*, *"System prompt dump"*).
- **Output Validation:** AI responses are filtered through content safety layers to detect and block toxic content, political biases, and non-exam-related responses before they are returned to the frontend.
