---
id: FILE_MAPPING
title: FILE_MAPPING — Tính năng → UI → API → Backend (CLIENT + hạ tầng)
type: log
status: living
tags: [mapping, traceability, client]
related: [workflow-solo-dev, FILE_MAPPING_ADMIN, PROGRESS, agent-rules, ui-screens-client, api-contracts, plan-00-overview, adr-016-manual-type-sync]
source: "Tổng hợp từ ui-screens-client + api-*"
updated: 2026-11-15
---
# FILE_MAPPING (CLIENT + hạ tầng)

Phần ADMIN: [[FILE_MAPPING_ADMIN]]. **Agent cập nhật cột Trạng thái khi xong từng giai đoạn** ([[agent-rules]]).

**Trạng thái** ([[workflow-solo-dev]]): `⬜ TODO` → `🎨 UI+Wire` → `🛠 BE done` → `✅ Đã test`. (`🚧` = làm dở)

## Quy ước đường dẫn (cấu trúc 3 dự án — [[architecture-repo-structure]])
| Tiền tố | Nghĩa | Đường dẫn thật |
|---|---|---|
| `W:` | Frontend (Next.js) | `frontend/src/` |
| `A:` | Backend (Express + Prisma) | `backend/src/` |
| `C:` | Kiểu dùng chung (DTO, Zod, `computeScore`, `seed-ids`…) | **nguồn:** `backend/src/types/` · **bản copy:** `frontend/src/types/` |
| `R:` | RAG service (Python) | `rag-service/app/` |

**Luật `C:`** ([[adr-016-manual-type-sync]]): chỉ sửa ở `backend/src/types/`, rồi `./sync-types.sh`, commit cả hai thư mục cùng lúc. Không sửa `frontend/src/types/`.

Mỗi tính năng `x` có: gọi API ở `W:services/http/x.http.ts` (`W:services/index.ts` chỉ re-export từ `http/`); hook `W:features/x/`; DTO nguồn `backend/src/types/dto/x.ts` (+ bản copy `frontend/src/types/dto/x.ts`). **Không có mock, không fixtures.**

## Mẫu hàng (sao chép khi thêm tính năng)
| ID | Tính năng (UC) | Màn | File page (UI) | Component chính | Service FE | API | Module BE | Prisma | Phase | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|
| CL-00 | *tên tính năng (UCxx)* | *Cxx* | `W:app/…/page.tsx` | `…` | `W:services/http/x.http.ts` | `METHOD /path` | `A:modules/x/` | `Model` | Pxx | ⬜ TODO |

## CLIENT (sinh viên)
| ID | Tính năng (UC) | Màn | File page (UI) | Component chính | Service FE | API | Module BE | Prisma | Phase | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|
| CL-01 | Đăng nhập SV (UC02) | C01 | `W:app/(auth)/login/page.tsx` | `LoginForm`, `AuthSplitLayout` | `auth.service.ts` | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | `A:modules/auth/` | User | P01 | ✅ Tested |
| CL-02 | Đăng ký SV (UC01) | C01 (tab) | `W:app/(auth)/login/page.tsx?tab=register` | `RegisterForm` | `auth.service.ts` | `POST /auth/register` | `A:modules/auth/` | User | P01 | ✅ Tested |
| CL-03 | Trang chủ (UC03) | C02 | `W:app/(client)/page.tsx` | `Navbar`, `Hero`, `StatStrip`, `TopicTile`, `CourseCard` | `catalog.service.ts` | `GET /public/stats`, `GET /courses?sort=popular` | `A:modules/public/`, `courses/` | Course, Enrollment, User | P02 | ✅ Tested |
| CL-04 | Danh mục + lọc/tìm (UC03) | C03 | `W:app/(client)/courses/page.tsx` | `CourseFilterSidebar`, `CourseCard`, `Pagination` | `catalog.service.ts` | `GET /courses` | `A:modules/courses/` | Course | P02 | ✅ Tested |
| CL-05 | Chi tiết khóa (UC03) | C04a/b | `W:app/(client)/courses/[courseId]/page.tsx` | `CourseInfoCard`, `EnrollPanel`, `ModuleAccordion`, `Tabs` | `catalog.service.ts` | `GET /courses/:id` | `A:modules/courses/` | Course, Module, Lesson, Exam | P02 | ✅ Tested |
| CL-06 | Đăng ký học (UC04) | C04a | (cùng CL-05) | `EnrollPanel` | `catalog.service.ts` | `POST /courses/:id/enroll` | `A:modules/enrollments/` | Enrollment | P02 | ✅ Tested |
| CL-07 | Màn học: cấu trúc + bài (UC04) | C05 | `W:app/(learn)/learn/[courseId]/lessons/[lessonId]/page.tsx` | `LearnHeader`, `LessonSidebar`, `LessonViewer` | `learning.service.ts` | `GET /courses/:id/learn`, `GET /lessons/:id` | `A:modules/lessons/`, `progress/` | Lesson, LessonProgress | P03 | ⬜ TODO |
| CL-08 | Hoàn thành bài, tiến độ (UC04) | C05 | (cùng CL-07) | `CompleteButton`, `ProgressBar` | `learning.service.ts` | `POST /lessons/:id/complete` | `A:modules/progress/` | LessonProgress, Enrollment | P03 | ⬜ TODO |
| CL-09 | Khóa học của tôi (UC04) | C08 | `W:app/(client)/my-courses/page.tsx` | `MyCourseRow`, `LearningSummaryCard`, `Tabs` | `learning.service.ts` | `GET /me/courses`, `GET /me/learning-summary` | `A:modules/progress/` | Enrollment, Attempt | P03 | ⬜ TODO |
| CL-10 | Làm bài kiểm tra (UC05, UC16) | C06 | `W:app/(learn)/exams/[examId]/page.tsx` | `ExamHeader`, `ExamTimer`, `QuestionNavigator`, `OptionRadio` | `exam.service.ts` | `GET /exams/:id`, `GET /exams/:id/questions`, `POST /exams/:id/attempts` | `A:modules/exams/`, `attempts/` | Exam, Question, Option, Attempt, Answer | P05 | ⬜ TODO |
| CL-11 | Kết quả + xem lại (UC06) | C09 | `W:app/(client)/my-results/page.tsx`, `…/[attemptId]/page.tsx` | `ResultsTable`, `AttemptReview` | `exam.service.ts` | `GET /me/exam-results`, `GET /me/attempts/:id` | `A:modules/attempts/` | Attempt, Answer | P05 | ⬜ TODO |
| CL-12 | Trợ lý AI (UC07) | C07 | `W:app/(client)/ai/page.tsx` | `ChatPanel`, `MessageBubble`, `SourceLine` | `ai-chat.service.ts` | `GET /ai/courses`, `GET …/messages`, `POST …/ask` | `A:modules/ai-chat/` | AiMessage, AiDocument | P08 | ⬜ TODO |
| CL-13 | Chủ đề động: tile + bộ lọc theo `topics` (UC03; [[adr-018-dynamic-topics]]) | C02, C03 | `W:app/(client)/page.tsx`, `W:app/(client)/courses/page.tsx` (điều chỉnh) | `TopicTile`, `CourseFilterSidebar`, `CourseCard` (màu `topic.color`) | `catalog.service.ts` | `GET /topics`, `GET /courses?topic=<slug>` | `A:modules/topics/`, `courses/` | Topic, Course | P02b (P02-T) | ⬜ TODO |

## Hạ tầng & dịch vụ chung
| ID | Hạng mục | File chính | Phase | Trạng thái |
|---|---|---|---|---|
| IN-01 | Khung repo 3 dự án, npm scripts, lint/tsc, `.env*`, `.gitignore` | `.gitignore`, `backend/package.json`, `frontend/package.json`, `*/.env.example` | P00 | ⬜ TODO |
| IN-02 | Kiểu dùng chung (schema, labels, seed-ids, computeScore) + script đồng bộ | `C:*` (`backend/src/types/*` → `frontend/src/types/*`), `sync-types.sh` | P00 | ⬜ TODO |
| IN-03 | Prisma schema + migration + seed | `backend/prisma/*` | P00 | ⬜ TODO |
| IN-04 | Design tokens + `ui/` nguyên tử + shells | `W:components/ui`, `tailwind.config.ts` | P00 | ⬜ TODO |
| IN-05 | `apiClient`, `AuthContext`, guards; `services/index.ts` (barrel, **chỉ trỏ vào `http/`**) | `W:lib/*`, `W:services/index.ts` | P00–P01 | ✅ Đã test |
| IN-06 | Express skeleton: env, error handler, validate, authenticate | `A:middlewares/*`, `A:config/env.ts` | P00 | ⬜ TODO |
| IN-07 | RAG service: ingest / query / delete / health | `R:*` | P07 | ⬜ TODO |
| IN-08 | `rag-client`, callback `/internal`, job quét treo | `A:lib/rag-client.ts`, `A:modules/internal/`, `A:jobs/*` | P08 | ⬜ TODO |
| IN-09 | Cloudinary upload/destroy + multer | `A:lib/cloudinary.ts`, `A:middlewares/upload.ts` | P04 | ⬜ TODO |
