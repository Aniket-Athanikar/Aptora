# Frontend–backend gap report

This report is based on an audit of `frontend/src` against the routes registered in `backend/app/api/v1`.  Items below currently contain mock, local-only, or hard-coded business data and have no matching production API contract.  They must render an empty/unavailable state until the listed API is implemented.

| Page / feature | Component or source | Current mock/local data | Required backend API | Suggested request / response | Priority |
| --- | --- | --- | --- | --- | --- |
| AI workspace tree | `features/ai-workspace/workspaceContext.tsx` | UPSC/JEE/NEET workspaces, subjects and books | Subject CRUD | `POST/PUT/DELETE /workspace/{id}/subjects`; `{id,name,description,display_order,icon,color}` | High |
| AI workspace resources | `workspaceContext.tsx` | Sample resources and metadata | Resource metadata/chapter API | `GET /documents/{id}/metadata`; resource metadata and chapters | High |
| AI workspace conversations | `workspaceContext.tsx`, `ConversationSidebar.tsx` | Default chats and local storage | Conversation list/persistence | `GET/POST /knowledge/conversations`; conversation summaries/messages | High |
| AI workspace actions | `workspaceContext.tsx` | Local create/update/delete workspace and subject mutations | Subject CRUD and workspace list API | Authenticated workspace collection and subject mutation responses | High |
| Knowledge engine | `features/knowledge-engine/data.ts`, `reducer.ts`, `context.tsx` | Sample books, OCR, questions, folders, tags | Resource content/chunks and generated-artifact persistence | Resource/chunk list plus saved summary, flashcard and question APIs | High |
| Knowledge downloads | `components/downloads/DownloadCenter.tsx` | Generated mock PDFs | Artifact download API | `GET /documents/{id}/download` and generated-artifact download URLs | Medium |
| Camera/clipboard upload | `components/upload/UploadCenter.tsx` | Empty mock files | Image/document ingestion API | Multipart image upload response matching document upload | Medium |
| Progress dashboard | `features/progress/store/progressStore.ts`, dashboard progress pages | Fake totals, heatmap, streak and analytics | Study session/progress API | `GET/POST /workspace/{id}/progress`; sessions, totals, daily activity | High |
| Planner | `features/planner/*`, dashboard planner | Generated schedule/tasks | Planner task CRUD | `GET/POST/PUT/DELETE /workspace/{id}/tasks`; task state/due date | High |
| Calendar | `features/calendar/store/calendarStore.ts` | Seeded events and local storage | Calendar event CRUD | `GET/POST/PUT/DELETE /workspace/{id}/events`; `{id,title,date,type}` | Medium |
| Notifications | `features/notifications/store/notificationStore.ts` | Default notifications/local state | Notification API | `GET /notifications`, `PATCH /notifications/{id}` | Medium |
| Achievements | `features/achievements/achievementEngine.ts` | Default badges/local state | Achievement API | `GET /achievements`; earned/progress data | Low |
| AI coach | `features/ai-coach/*`, dashboard coach pages | Local chat, memory and score | Coach conversation/score API | `GET/POST /coach/sessions`; messages and evaluation | High |
| Dashboard activity | dashboard cards, `RealtimeHub.tsx` | Random/live demo notices and static recommendations | Dashboard/activity API | `GET /workspace/{id}/activity`; timestamped event feed | Medium |
| Dashboard recommendations | `recommendations.tsx` | Client-derived recommendation cards | Recommendation API | `GET /workspace/{id}/recommendations` | Medium |
| Dashboard analytics | `app/dashboard/analytics/page.tsx` | Static charts/metrics | Analytics API | `GET /workspace/{id}/analytics` | High |
| Profile extras | `app/profile/page.tsx` | Default profile, social graph, connected accounts and local settings | Profile fields not accepted by `ProfileUpdatePayload` | Expanded profile settings response/mutation schema | Medium |
| Exams | `app/exams/*`, `services/exam.service.ts` | Demo exam/attempt model; routes do not exist | Exam CRUD/attempt API | `GET/POST /exams`, attempts and results contracts | High |
| Feedback / bug report | `app/feedback`, `app/report-bug` | Local form behavior | Feedback API | `POST /api/feedback` and bug-report schema | Low |
| Landing marketing claims | landing sections, testimonials, pricing, exams | Static editorial/demo content | CMS/content API, if dynamic content is required | Public content collections | Low |
| Blog/careers/FAQ/features | `app/blog`, `app/careers`, `app/faqs`, `app/features` | Static editorial content | CMS/content API, if dynamic content is required | Public content collections | Low |
| React lab | `app/react-lab/*` | Demonstration-only content | None; remove from production navigation or mark unavailable | N/A | Low |

## Existing endpoints that should be used, not duplicated

- Workspace: `/workspace`, `/workspace/{id}/subjects`, `/workspace/{id}/documents`, `/workspace/{id}/statistics`, `/workspace/{id}/recent`, `/workspace/{id}/library/search`.
- Documents: `/documents/upload`, `/documents/{id}`, `/documents/{id}/status`, `/documents/{id}` deletion.
- AI: `/knowledge/chat`, `/knowledge/chat/{session_id}/history`, `/summary`, `/flashcards`, `/questions`, `/mcq/generate`, `/predictions`, `/concept/map`, `/workspace/{id}/study-plan`.
- Onboarding: `/profile/`, `/timeline/`, `/lifestyle/`, `/study-slots/`, `/learning-modes/`, `/gap-analysis/`.

## Required frontend policy until gaps are closed

For every row in the table, remove sample values and render `No data available.` or `Feature not yet connected.`  Do not write browser-local business records as a substitute for a missing backend API.
