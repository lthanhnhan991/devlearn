---
id: api-contracts
title: API Contracts — Quy ước chung, mã lỗi, DTO dùng chung, chỉ mục endpoint
type: api
status: stable
tags: [api, contract, rest, dto, errors]
related: [adr-018-dynamic-topics, concept-topics, api-admin-topics, api-auth, api-catalog, api-learning, api-exam-student, api-ai-chat, api-admin-courses, api-admin-content, api-admin-exams, api-admin-exam-stats, api-admin-ai-docs, api-admin-users-dashboard, api-internal-rag, error-handling-conventions, adr-016-manual-type-sync]
source: "Thiết kế của Tech Lead; nghiệp vụ từ Đồ án §2.3, §3.2"
updated: 2026-11-21
---
# API Contracts (hub)

> **Nguồn sự thật.** Sửa hợp đồng ⇒ sửa file này (hoặc file `api-*` tương ứng) **TRƯỚC**, rồi cập nhật `backend/src/types/` và chạy `./sync-types.sh`, rồi mới code ([[agent-rules]]).

## 1. Quy ước
| Mục | Quy ước |
|---|---|
| Base URL | `{API}/api/v1` (RAG nội bộ: xem [[api-internal-rag]]) |
| Định dạng | JSON `application/json; charset=utf-8`; upload dùng `multipart/form-data` |
| Auth | Cookie `devlearn_token` (httpOnly) hoặc `Authorization: Bearer` ([[concept-auth]]). Ký hiệu: 🔓 công khai · 🔓? tùy chọn · 🔒 đăng nhập · 🎓 STUDENT · 🧑‍🏫 TEACHER/ADMIN · 👑 ADMIN |
| Tên trường | `camelCase`; ID là UUID string; thời gian ISO-8601 UTC (`2026-11-15T08:30:00.000Z`); điểm là `number` (tối đa 2 số lẻ) |
| Thành công | `{ "data": <T>, "meta"?: {…} }`. `201` khi tạo; `202` khi chấp nhận xử lý bất đồng bộ; `204` (không body) khi xóa |
| Lỗi | `{ "error": { "code": "X", "message": "Tiếng Việt cho người dùng", "details"?: [{ "path": "email", "message": "…" }] } }` |
| Phân trang | Query `page` (≥1, mặc định 1), `pageSize` (mặc định 12, tối đa 100). `meta`: `{ page, pageSize, total, totalPages }` |
| Sắp xếp | `sort=` theo từng endpoint; mặc định được ghi rõ |
| Chuỗi rỗng | Trim; trường tùy chọn bỏ trống ⇒ không gửi |
| Idempotency | `PUT`, `DELETE`, `POST …/complete` idempotent |
| Giới hạn tốc độ | Ghi riêng ở từng endpoint; vượt ⇒ `429 RATE_LIMITED` + header `Retry-After` |

## 2. Mã lỗi
| HTTP | `error.code` | Ý nghĩa |
|---|---|---|
| 400 | `VALIDATION_ERROR` | sai định dạng (kèm `details[]`) |
| 401 | `UNAUTHENTICATED` | thiếu/sai/hết hạn token |
| 401 | `INVALID_CREDENTIALS` | sai email/mật khẩu |
| 403 | `FORBIDDEN` | không đủ quyền / không phải chủ khóa |
| 403 | `ACCOUNT_LOCKED` | tài khoản bị khóa |
| 403 | `WRONG_PORTAL` | đăng nhập sai cổng (SV vào admin / GV vào client) |
| 403 | `NOT_ENROLLED` | chưa ghi danh khóa |
| 403 | `EXAM_NOT_OPEN` | bài kiểm tra không ở trạng thái `OPEN` |
| 403 | `COURSE_UNPUBLISHED` | khóa đã gỡ xuất bản |
| 404 | `NOT_FOUND` | không có tài nguyên (cũng dùng khi SV truy cập tài nguyên không thuộc mình, để không lộ sự tồn tại) |
| 409 | `EMAIL_TAKEN`, `STUDENT_CODE_TAKEN` | trùng định danh |
| 409 | `ALREADY_ENROLLED` | đã ghi danh |
| 409 | `COURSE_NOT_READY` | xuất bản thiếu nội dung |
| 409 | `COURSE_HAS_ENROLLMENTS` | không xóa được khóa |
| 409 | `TOPIC_NAME_TAKEN`, `TOPIC_SLUG_TAKEN`, `TOPIC_IN_USE`, `TOPIC_INACTIVE` | ràng buộc chủ đề (trùng tên/slug; đang có khóa dùng; chủ đề đang ẩn) — [[api-admin-topics]] |
| 409 | `EXAM_EMPTY`, `EXAM_NOT_EDITABLE`, `EXAM_HAS_ATTEMPTS`, `EXAM_DUPLICATE` | ràng buộc bài kiểm tra |
| 409 | `NO_READY_DOCUMENTS` | khóa chưa có tài liệu AI sẵn sàng |
| 409 | `DOCUMENT_BUSY` | tài liệu AI đang xử lý, chưa nạp lại được (xóa vẫn được phép) |
| 409 | `CANNOT_MODIFY_SELF` | Admin tự sửa mình |
| 413 | `FILE_TOO_LARGE` | quá 100 MB (video) / 10 MB (PDF) |
| 415 | `UNSUPPORTED_FILE_TYPE` | sai MIME/magic bytes |
| 429 | `RATE_LIMITED` | quá hạn mức |
| 502 | `AI_UNAVAILABLE` | RAG/Gemini lỗi |
| 504 | `AI_TIMEOUT` | RAG quá `RAG_TIMEOUT_MS` |
| 500 | `INTERNAL_ERROR` | lỗi không lường trước (không lộ chi tiết) |

## 3. DTO dùng chung (nguồn: `backend/src/types/dto/*.ts`, viết bằng zod; FE dùng bản copy `frontend/src/types/dto/*.ts`)
```ts
type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
type LevelCode = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type ContentType = 'VIDEO' | 'PDF';
type ISODate = string;

interface UserDto        { id: string; fullName: string; email: string; role: Role; studentCode: string | null }
interface PersonRefDto   { id: string; fullName: string }
interface PageMeta       { page: number; pageSize: number; total: number; totalPages: number }

// Chủ đề động (bảng `topics`) — ADR-018
interface TopicRefDto    { id: string; name: string; slug: string; color: string | null; icon: string | null }
interface TopicDto       extends TopicRefDto { description: string; courseCount: number }   // công khai; courseCount = khóa PUBLISHED

interface CourseCardDto {
  id: string; title: string; topic: TopicRefDto; level: LevelCode;
  teacher: PersonRefDto; lessonCount: number; totalDurationMinutes: number; enrollmentCount: number;
}
interface ExamOutlineDto { id: string; title: string; status: 'OPEN' | 'CLOSED'; durationMinutes: number; passScore: number; questionCount: number }
interface LessonOutlineDto { id: string; title: string; contentType: ContentType; durationSeconds: number | null; position: number }
interface ModuleOutlineDto { id: string; title: string; position: number; lessons: LessonOutlineDto[]; exam: ExamOutlineDto | null }

interface SourceDto { documentId: string; fileName: string; page: number | null; snippet: string }

// Xem lại một lượt làm (dùng cho SV và GV)
interface AttemptSummaryDto { id: string; attemptNo: number; score: number; correctCount: number; totalQuestions: number; passed: boolean; submittedAt: ISODate }
interface ReviewOptionDto   { id: string; position: number; content: string; isCorrect: boolean }
interface ReviewQuestionDto { id: string; position: number; content: string; selectedOptionId: string | null; isCorrect: boolean; options: ReviewOptionDto[] }
interface AttemptReviewDto  { attempt: AttemptSummaryDto; exam: { id: string; title: string; passScore: number; courseTitle: string }; questions: ReviewQuestionDto[] }
```
Nhãn tiếng Việt của enum: `backend/src/types/labels.ts` ([[ui-design-system]]).

## 4. Chỉ mục endpoint (tất cả đều nằm dưới `/api/v1`)
| # | Method · Path | Quyền | File |
|---|---|---|---|
| 1 | `POST /auth/register` | 🔓 | [[api-auth]] |
| 2 | `POST /auth/login` | 🔓 | [[api-auth]] |
| 3 | `POST /auth/admin/login` | 🔓 | [[api-auth]] |
| 4 | `POST /auth/logout` | 🔒 | [[api-auth]] |
| 5 | `GET /auth/me` | 🔒 | [[api-auth]] |
| 6 | `GET /public/stats` | 🔓 | [[api-catalog]] |
| 7 | `GET /topics` | 🔓 | [[api-catalog]] |
| 8 | `GET /courses` | 🔓 | [[api-catalog]] |
| 9 | `GET /courses/:courseId` | 🔓? | [[api-catalog]] |
| 10 | `POST /courses/:courseId/enroll` | 🎓 | [[api-catalog]] |
| 11 | `GET /me/courses` | 🎓 | [[api-learning]] |
| 12 | `GET /me/learning-summary` | 🎓 | [[api-learning]] |
| 13 | `GET /courses/:courseId/learn` | 🎓 | [[api-learning]] |
| 14 | `GET /lessons/:lessonId` | 🎓 | [[api-learning]] |
| 15 | `POST /lessons/:lessonId/complete` | 🎓 | [[api-learning]] |
| 16 | `GET /exams/:examId` | 🎓 | [[api-exam-student]] |
| 17 | `GET /exams/:examId/questions` | 🎓 | [[api-exam-student]] |
| 18 | `POST /exams/:examId/attempts` | 🎓 | [[api-exam-student]] |
| 19 | `GET /me/exam-results` | 🎓 | [[api-exam-student]] |
| 20 | `GET /me/attempts/:attemptId` | 🎓 | [[api-exam-student]] |
| 21 | `GET /ai/courses` | 🎓 | [[api-ai-chat]] |
| 22 | `GET /ai/courses/:courseId/messages` | 🎓 | [[api-ai-chat]] |
| 23 | `POST /ai/courses/:courseId/ask` | 🎓 | [[api-ai-chat]] |
| 6 endpoint | `/admin/courses` (list, create, get, patch, status, delete) | 🧑‍🏫 | [[api-admin-courses]] |
| 5 endpoint | `/admin/topics` (list, create, patch, order, delete) | 🧑‍🏫 (xóa: 👑) | [[api-admin-topics]] |
| 11 endpoint | `/admin/courses/:id/structure`, modules, lessons, upload, order | 🧑‍🏫 | [[api-admin-content]] |
| 10 endpoint | `/admin/courses/:id/exams`, exams, questions, status | 🧑‍🏫 | [[api-admin-exams]] |
| 3 endpoint | `/admin/exam-stats/…` | 🧑‍🏫 (owner) | [[api-admin-exam-stats]] |
| 4 endpoint | `/admin/ai-documents…` | 🧑‍🏫 | [[api-admin-ai-docs]] |
| 3 endpoint | `/admin/users…` | 👑 | [[api-admin-users-dashboard]] |
| 1 endpoint | `GET /admin/dashboard` | 🧑‍🏫 | [[api-admin-users-dashboard]] |
| I1–I5 | RAG nội bộ + callback | key nội bộ | [[api-internal-rag]] |

## 5. Quy tắc bất biến
1. Không trả `passwordHash`, `Option.isCorrect` (khi SV đang làm bài), `filePublicId`.
2. Danh sách luôn là **mảng trong `data`** (kèm `meta` khi có phân trang), không bao giờ trả mảng trần.
3. Trường nullable trả `null`, không bỏ vắng.
4. Thêm trường mới = tương thích ngược; đổi/xóa trường = bump `/api/v2` hoặc thỏa thuận ghi ở [[PROGRESS]].
