---
id: FILE_MAPPING_ADMIN
title: FILE_MAPPING — ADMIN (Giảng viên/Quản trị)
type: log
status: living
tags: [mapping, traceability, admin]
related: [FILE_MAPPING, PROGRESS, ui-screens-admin, agent-rules, api-contracts, adr-016-manual-type-sync]
source: "Tổng hợp từ ui-screens-admin + api-admin-*"
updated: 2026-11-15
---
# FILE_MAPPING — ADMIN

Quy ước trạng thái: `⬜ TODO` → `🎨 UI+Wire` → `🛠 BE done` → `✅ Đã test` (chi tiết ở [[FILE_MAPPING]]). Tất cả page ở `W:app/admin/(panel)/…` trừ đăng nhập.

| Tiền tố | Đường dẫn thật |
|---|---|
| `W:` | `frontend/src/` |
| `A:` | `backend/src/` |
| `C:` | nguồn `backend/src/types/` · bản copy `frontend/src/types/` (chỉ sửa ở backend rồi `./sync-types.sh`) |
| `R:` | `rag-service/app/` |

| ID | Tính năng (UC) | Màn | File page (UI) | Component chính | Service FE | API | Module BE | Prisma | Phase | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|
| AD-01 | Đăng nhập quản trị (UC02) | A00 | `W:app/admin/login/page.tsx` | `AdminLoginForm` | `auth.service.ts` | `POST /auth/admin/login` | `A:modules/auth/` | User | P01 | ✅ Tested |
| AD-02 | Dashboard (UC14) | A01 | `…/(panel)/page.tsx` | `StatCard`, `BarChart`, `ActivityTable` | `dashboard.service.ts` | `GET /admin/dashboard` | `A:modules/dashboard/` | Enrollment, Attempt, AiMessage | P09 | ⬜ TODO |
| AD-03 | Quản lý khóa học (UC08) | A02 | `…/courses/page.tsx` | `CourseTable`, `CourseFormModal`, `ConfirmDialog` | `admin-course.service.ts` | `GET/POST /admin/courses`, `GET/PATCH/DELETE /admin/courses/:id`, `PATCH …/status` | `A:modules/courses/` | Course | P04 | ⬜ TODO |
| AD-04 | Soạn module & bài học (UC09) | A03 | `…/lessons/page.tsx` | `StructureTree`, `LessonForm`, `ModuleDialog` | `admin-content.service.ts` | `GET …/structure`, module & lesson CRUD, `PUT …/order` | `A:modules/modules/`, `lessons/` | Module, Lesson | P04 | ⬜ TODO |
| AD-05 | Upload video/PDF bài học (UC09, UC11) | A03 | (cùng AD-04) | `FileDropzone`, `UploadProgress` | `admin-content.service.ts` | `POST /admin/lessons/:id/upload` | `A:modules/lessons/` + `lib/cloudinary` | Lesson, AiDocument | P04 | ⬜ TODO |
| AD-06 | Xem trước bài học ở client (UC09) | A03 | `…/lessons/[lessonId]/preview/page.tsx` | `LessonViewer` (tái dùng) | `admin-content.service.ts` | `GET /admin/lessons/:id` | `A:modules/lessons/` | Lesson | P04 | ⬜ TODO |
| AD-07 | Quản lý bài kiểm tra & câu hỏi (UC10) | A04 | `…/exams/page.tsx` | `ExamList`, `QuestionEditor`, `ExamStatusControl` | `admin-exam.service.ts` | `GET/POST …/courses/:id/exams`, exam CRUD & status, question CRUD | `A:modules/exams/` | Exam, Question, Option | P06 | ⬜ TODO |
| AD-08 | Thống kê bài kiểm tra (UC12) | A07 | `…/exam-stats/page.tsx` | `ExamStatsHeader`, `StudentResultTable` | `admin-stats.service.ts` | `GET /admin/exam-stats/exams/:id` | `A:modules/exam-stats/` | Attempt, Enrollment | P06 | ⬜ TODO |
| AD-09 | Chi tiết bài làm SV (UC12) | A08 | `…/exam-stats/[examId]/students/[studentId]/page.tsx` | `AttemptReview`, `AttemptSelect` | `admin-stats.service.ts` | `GET …/students/:sid/attempts`, `GET …/attempts/:id` | `A:modules/exam-stats/` | Attempt, Answer | P06 | ⬜ TODO |
| AD-10 | Tài liệu AI (UC11, UC15) | A05 | `…/ai-documents/page.tsx` | `AiDocumentTable`, `FileDropzone`, `CourseSelect` | `admin-ai-docs.service.ts` | `GET/POST /admin/ai-documents`, `POST …/reingest`, `DELETE …` | `A:modules/ai-documents/` | AiDocument | P08 | ⬜ TODO |
| AD-11 | Người dùng & phân quyền (UC13) | A06 | `…/users/page.tsx` | `UserTable`, `UserFormModal` | `admin-user.service.ts` | `GET/POST /admin/users`, `PATCH /admin/users/:id` | `A:modules/users/` | User | P09 | ⬜ TODO |
| AD-12 | AdminShell + sidebar + guards | A01–A08 | `…/(panel)/layout.tsx` | `AdminShell`, `AdminSidebar`, `AdminTopbar`, `InfoBanner` | — | `GET /auth/me` | — | — | P01 | ✅ Tested |
| AD-13 | Quản lý chủ đề (thêm/sửa/sắp xếp/bật-tắt; [[adr-018-dynamic-topics]]) | A09 | `…/(panel)/topics/page.tsx` | `TopicTable`, `TopicFormModal`, `ConfirmDialog` | `admin-topic.service.ts` | `GET/POST /admin/topics`, `PATCH /admin/topics/:id`, `PUT /admin/topics/order`, `DELETE /admin/topics/:id` | `A:modules/topics/` | Topic | P04 | 🛠 BE done |

## Ghi chú
- Thống kê (AD-08/09) **owner-only** — test 403 bắt buộc ([[adr-013-exam-stats-owner-only]]).
- AD-05 với PDF tạo `ai_document` tự động ([[adr-010-unify-documents-into-ai-documents]]) — kiểm cùng AD-10.
- Các **gap thiết kế** của từng màn: [[delta-vs-thesis]] §4.
