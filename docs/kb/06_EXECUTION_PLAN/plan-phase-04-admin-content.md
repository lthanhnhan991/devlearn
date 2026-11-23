---
id: plan-phase-04-admin-content
title: Phase 04 — Admin: quản lý khóa học, chủ đề & soạn bài + upload (UC08, UC09)
type: plan
status: living
tags: [plan, admin, course, lesson, upload]
related: [api-admin-topics, concept-topics, adr-018-dynamic-topics, plan-00-overview, workflow-solo-dev, api-admin-courses, api-admin-content, concept-course-structure, concept-file-storage, ui-screens-admin, adr-010-unify-documents-into-ai-documents, database-erd]
source: "UC08, UC09; UI A02, A03"
updated: 2026-11-21
---
# Phase 04 — Admin: Courses & Content

**Phạm vi**: A02 quản lý khóa học, **A09 quản lý chủ đề** ([[adr-018-dynamic-topics]]), A03 soạn module/bài học, upload, xem trước, AdminShell đầy đủ. **Phụ thuộc**: P02. **FILE_MAPPING**: AD-03…AD-06, AD-12, AD-13 (chủ đề), IN-09. **Cỡ**: L.

## Việc đầu tiên (nếu chưa làm)
- [ ] P04-0 **Spike Cloudinary** (Q-09): upload 1 PDF + 1 video nhỏ; mở URL ở cửa sổ ẩn danh; tải bằng `curl` không cookie ⇒ ghi kết quả vào [[OPEN_QUESTIONS]] ([[concept-file-storage]])

## Việc cần làm
### DTO
- [x] P04-1 `backend/src/types/dto/admin-course.ts`, `admin-content.ts`: `AdminCourseRowDto/Dto`, `AdminModuleDto`, `AdminLessonDto`, `UploadResultDto`; `AdminCourseRowDto` có `topic: TopicRefDto` + `topicIsActive`, tạo/sửa khóa nhận `topicId`; `backend/src/types/dto/admin-topic.ts`: `AdminTopicDto`, `CreateTopicReq`, `UpdateTopicReq` ([[api-admin-courses]], [[api-admin-content]], [[api-admin-topics]]) → `./sync-types.sh`
### UI
- [x] P04-2 `AdminShell` hoàn chỉnh: sidebar thống nhất (C-08, có mục **Chủ đề**), `InfoBanner`, Topbar (vai trò + email), `StaffGuard`
- [x] P04-3 A02: `CourseTable` (tìm, lọc trạng thái, phân trang), `CourseFormModal` (G-02; ô Chủ đề = select từ `GET /admin/topics?isActive=true`), công tắc xuất bản (G-13), `ConfirmDialog` xóa (G-14)
- [x] P04-4 A03: `CourseSelect` (G-05), `StructureTree` (thêm/đổi tên/xóa/sắp xếp module & bài — G-03), `LessonForm` (tên, loại, dropzone, link YouTube, Xuất bản)
- [x] P04-5 `FileDropzone` kiểm cỡ/loại ở client (100 MB / 10 MB) + tiến trình bằng XHR; nút **Xem trước ở client** ⇒ `/admin/lessons/[id]/preview` (tái dùng `LessonViewer`)
### Gọi API (http)
- [x] P04-6 `services/http/admin-course.http.ts`, `admin-content.http.ts` (upload multipart có tiến trình); `403` ⇒ `ErrorState`
### Backend
- [x] P04-7 `lib/cloudinary.ts` (upload_stream, destroy best-effort); `middlewares/upload.ts` (multer ghi đĩa tạm, giới hạn theo loại, kiểm magic bytes)
- [x] P04-8 `modules/courses` (admin): list/create/get/patch/status/delete (ownership, `COURSE_NOT_READY`, `COURSE_HAS_ENROLLMENTS`)
- [x] P04-9 `modules/modules`: create/patch/delete/order (transaction đánh lại `position`); `modules/lessons`: create/get/patch/delete/order
- [x] P04-10 `POST /admin/lessons/:id/upload` (VIDEO lấy `durationSeconds`; thay file ⇒ xóa file cũ; PDF ⇒ tạo `ai_documents(lesson_id)` `PENDING` qua `IngestDispatcher` **no-op** — bản thật ở P08)
- [x] P04-11 `assertCourseOwner` (Admin được); xóa khóa gọi `VectorCleaner` (interface, no-op tới P08)
### Cập nhật DB
- [x] P04-12 `schema.prisma`: thêm enum `DocStatus`, model `AiDocument` + `User.aiDocuments`, `Course.aiDocuments`, `Lesson.aiDocument` ([[database-erd]]) (đã có sẵn trong schema.prisma)
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p04_ai_documents`

### Quản trị chủ đề (A09) — [[adr-018-dynamic-topics]]
- [x] P04-13 **UI** A09 `/admin/topics`: `TopicTable` (kéo-thả/↑↓ sắp xếp, công tắc `is_active`), `TopicFormModal` (slug chỉ khi tạo, màu preset + hex, icon), `ConfirmDialog` xóa (chỉ ADMIN; vô hiệu khi `courseCount > 0`) — G-17
- [x] P04-14 **Gọi API** `services/http/admin-topic.http.ts`: `listAdminTopics`, `createTopic`, `updateTopic`, `reorderTopics`, `deleteTopic`
- [x] P04-15 **Backend** `modules/topics` (admin): list/create/patch/order/delete; `slugify` (bỏ dấu, `đ→d`); kiểm trùng `name` (không phân biệt hoa thường) và `slug`; `reorder` trong transaction; delete **ADMIN-only** + `TOPIC_IN_USE` ([[api-admin-topics]])
- [x] P04-16 **Backend** `modules/courses` (admin): `topicId` thay `topic` khi tạo/sửa; chặn gán/đổi sang chủ đề ẩn (`TOPIC_INACTIVE`); mapper trả `topic` + `topicIsActive`
- [x] P04-17 **DB**: không đổi schema (bảng `topics` đã có từ P02b); không cần migration mới

## Checklist test tay (Tech Lead)
- [ ] GV tạo khóa → module → bài → upload video/PDF → xuất bản ⇒ SV thấy ở danh mục; xuất bản khóa không có bài đã xuất bản ⇒ 409
- [ ] GV khác sửa khóa không phải của mình ⇒ 403; Admin sửa được mọi khóa
- [ ] File quá cỡ/sai loại bị từ chối; sắp xếp lại module/bài giữ đúng thứ tự; xóa khóa có ghi danh ⇒ 409
- [ ] Xem trước ở client hoạt động mà không cần ghi danh
- [ ] **Chủ đề**: GV thêm chủ đề mới ⇒ có trong select của form khóa; sửa tên/màu hiển thị đúng; sắp xếp lại ⇒ thứ tự tile/bộ lọc Client đổi theo
- [ ] Tắt chủ đề ⇒ biến mất khỏi tile/bộ lọc Client nhưng khóa thuộc chủ đề vẫn hiện; không gán được cho khóa mới (409)
- [ ] GV không xóa được chủ đề (403); Admin xóa chủ đề chưa dùng ok, đang dùng ⇒ 409; slug không đổi được sau khi tạo; trùng tên/slug ⇒ 409 hiển thị inline

## Rủi ro
Upload lớn làm nghẽn Node ⇒ ghi đĩa + stream, không đệm RAM. PDF không tải được ở RAG ⇒ xem kết quả spike P04-0.
