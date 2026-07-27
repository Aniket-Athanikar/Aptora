# ExamForge AI — Project Phases & Roadmap

This document outlines the phased implementation plan for ExamForge AI, designed to scale from a single-user prototype to a nationwide enterprise-grade learning platform supporting lakhs of aspirants preparing for UPSC and State PSC (Public Service Commissions) exams in India.

---

## Phase 1: Core Platform & Foundation (Current Phase)
*Objective: Build the transactional, core learning infrastructure, user management, and mock test interfaces.*

- **User Accounts & Preferences:**
  - Secure JWT auth with email and Redis-backed OTP confirmation.
  - Multi-step onboarding to capture target exam, study hours/day, secondary targets, strengths/weaknesses, and active learning goals.
- **Syllabus & Material Management:**
  - Standardized UPSC and State PSC syllabus trees (GS Papers 1-4, Optional subjects, State Specific modules).
  - Basic resource upload (PDFs/images) linked to the study workspaces.
- **Interactive UI Workspaces:**
  - Unified Dashboard showing streaks, goal trees, and preparation countdowns.
  - Basic study log and manual timetable scheduler.

---

## Phase 2: AI-Powered Study Companion (Next Phase)
*Objective: Integrate semantic understanding, RAG pipelines, and conversational AI tutoring.*

- **RAG & Knowledge Bases:**
  - Standardized reference texts (NCERTs, standard books like Laxmikanth, spectrum) ingested into Qdrant Vector database.
  - Dynamic context retrieval during chat sessions.
- **Interactive Chat Interface:**
  - Multi-turn AI Chat Workflow helping students brainstorm, clarify doubts, and generate instant summary cards.
  - Topic-linked concept maps and knowledge graph updates showing user mastery.
- **Automated Study Planner:**
  - AI generated study roadmap taking target exam dates and daily hours as inputs.
  - Daily micro-tasks dynamically updated based on test performances.

---

## Phase 3: Subjective Mains Evaluation & Testing
*Objective: Introduce high-stakes testing, adaptive mock assessments, and subjective evaluation engines.*

- **AI Mains Answer Evaluation (GS & Optionals):**
  - Multi-modal scan uploads of handwritten answer sheets.
  - Layout-aware OCR to isolate questions and student written text.
  - LLM grading pipeline evaluating on parameters: *Structure & Introduction, Value Addition (Diagrams/Maps), Content Accuracy, Answer Flow, and Conclusion*.
- **Adaptive Prelims Mock Engine:**
  - Dynamic question bank delivering questions based on student's current proficiency.
  - Detailed performance analysis mapping accuracy to specific sub-topics.
- **Tutor / Mentor Dashboards:**
  - Interactive dashboards for human evaluators/teachers to review AI-generated evaluations and guide students at scale.

---

## Phase 4: State PSC Customization & Regional Scaling
*Objective: Adapt the platform to cover all states in India and expand regional language reach.*

- **State PSC Adaptors:**
  - Dynamic loading of state-specific modules (e.g., MPSC Maharashtra Geography, UPPSC UP History, BPSC Bihar Economy).
  - Localized vector stores containing state official publications, gazettes, and past year question papers.
- **Multilingual Support:**
  - Language wrappers translating queries from Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, and Gujarati.
  - System prompts optimized to generate responses in native scripts while referencing global English materials where appropriate.
- **Mobile Expansion:**
  - Native Android/iOS applications via React Native/Flutter to ensure offline capabilities and push-notification reminders for students in areas with low internet connectivity.
