# Aptora — Database Schema & Data Models

Aptora utilizes a hybrid database architecture optimized for high-performance transactional data, lightning-fast session caching, and low-latency semantic search queries.

---

## 1. Hybrid Storage Paradigm

- **PostgreSQL (Primary DB):** Manages relational, transactional, and structural data. Establishes relationships for users, profiles, billing, mock tests, and analytics.
- **Redis (Cache & Key-Value):** Handles time-to-live (TTL) constrained operations such as OTP verification, rate-limiting windows, and websocket session state.
- **Qdrant (Vector Database):** Stores high-dimensional dense embeddings for UPSC/State PSC syllabus docs, NCERT collections, and user-uploaded reference materials.

---

## 2. PostgreSQL Schema Reference

```
                             +-------------------+
                             |       users       |
                             +-------------------+
                             | id (PK)           |
                             | name              |
                             | email (Unique)    |
                             | password          |
                             | created_at        |
                             +---------+---------+
                                       |
                   +-------------------+-------------------+
                   | 1:1                                   | 1:N
                   ▼                                       ▼
         +-------------------+                   +-------------------+
         |   user_profiles   |                   |      orders       |
         +-------------------+                   +-------------------+
         | id (PK)           |                   | id (PK)           |
         | user_id (FK)      |                   | user_id (FK)      |
         | phone             |                   | plan_name         |
         | target_exam       |                   | cycle             |
         | target_score      |                   | amount            |
         | study_hours_goal  |                   | txn_id            |
         | weak_subjects     |                   | created_at        |
         | strong_subjects   |                   +-------------------+
         | xp, level, streak |
         +-------------------+
```

### Table Details & SQL DDL

#### `users`
Represents core user accounts.
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `user_profiles`
Maintains user preferences, gamification stats, and performance metrics.
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) DEFAULT '',
    dob VARCHAR(20) DEFAULT '',
    gender VARCHAR(20) DEFAULT '',
    location VARCHAR(150) DEFAULT '',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    education VARCHAR(100) DEFAULT '',
    college VARCHAR(150) DEFAULT '',
    occupation VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    target_exam VARCHAR(100) DEFAULT '',
    secondary_exam VARCHAR(100) DEFAULT '',
    target_score VARCHAR(20) DEFAULT '',
    target_rank VARCHAR(20) DEFAULT '',
    target_date VARCHAR(30) DEFAULT '',
    study_hours_goal FLOAT DEFAULT 4.0,
    weak_subjects JSON DEFAULT '[]',
    strong_subjects JSON DEFAULT '[]',
    favorite_subjects JSON DEFAULT '[]',
    accuracy FLOAT DEFAULT 0.0,
    mock_average FLOAT DEFAULT 0.0,
    questions_solved INTEGER DEFAULT 0,
    study_hours_total FLOAT DEFAULT 0.0,
    completion_pct FLOAT DEFAULT 0.0,
    bookmarks_count INTEGER DEFAULT 0,
    certificates_count INTEGER DEFAULT 0,
    social_links JSON DEFAULT '{}',
    achievements JSON DEFAULT '[]',
    connected_devices JSON DEFAULT '[]',
    notification_settings JSON DEFAULT '{}',
    privacy_settings JSON DEFAULT '{}',
    security_score INTEGER DEFAULT 50,
    plan VARCHAR(30) DEFAULT 'Free',
    plan_renewal VARCHAR(30) DEFAULT '',
    ai_credits INTEGER DEFAULT 50,
    storage_used_mb FLOAT DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Redis Store Structure

Redis is queried using key structures to ensure $O(1)$ operations for key components:

- **OTP Cache (`otp:{email}`):**
  - Type: String
  - Value: `{otp_code}`
  - TTL: 300 seconds (5 minutes)
- **Rate Limit Buckets (`rate:{ip}:{route}`):**
  - Type: String (Integer)
  - Value: Count of current window requests
  - TTL: 60 seconds
- **Session Store (`session:{user_id}`):**
  - Type: Hash
  - Fields: `token`, `last_active`, `ip_address`
  - TTL: 86400 seconds (24 hours)

---

## 4. Qdrant Vector DB Collections

Qdrant handles embeddings generated via `text-embedding-3-small` (1536 dimensions) or local sentence-transformer models (384 dimensions).

### Collection: `exam_knowledge_base`
Stores standard study resources, NCERTs, PYQs, and Syllabus guidelines.
- **Vector Size:** 1536 (Cosine Similarity)
- **Payload Schema:**
  ```json
  {
    "id": "uuid",
    "text": "The basic structure of the constitution was first established in the Kesavananda Bharati case...",
    "source_file": "Laxmikanth_Polity_Ch_11.pdf",
    "page_number": 142,
    "exam_type": "UPSC-CSE",
    "subject": "Polity",
    "subtopic": "Basic Structure Doctrine",
    "language": "en"
  }
  ```

### Collection: `user_notes_vault`
Stores personal student uploads, summaries, and digital flashcard backings.
- **Vector Size:** 1536 (Cosine Similarity)
- **Payload Schema:**
  ```json
  {
    "id": "uuid",
    "user_id": 42,
    "text": "My personal revision notes on Maratha land revenue systems under Shivaji...",
    "source_type": "user_pdf",
    "exam_type": "MPSC",
    "subject": "State History",
    "created_at": "2026-07-22T10:35:12Z"
  }
  ```

### Metadata Indexing and Optimization
To speed up query routing, payload indexes are created on specific fields:
- `user_id` (integer keyword)
- `exam_type` (keyword)
- `subject` (keyword)
