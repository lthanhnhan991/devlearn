---
id: plan-phase-04-admin-content
title: Phase 04 — Admin: quản lý khóa học & soạn bài + upload (UC08, UC09)
type: plan
status: living
tags: [plan, admin, course, lesson, upload]
related: [plan-00-overview, workflow-solo-dev, api-admin-courses, api-admin-content, concept-course-structure, concept-file-storage, ui-screens-admin, adr-010-unify-documents-into-ai-documents, database-erd]
source: "UC08, UC09; UI A02, A03"
updated: 2026-11-15
---
# Phase 04 — Admin: Courses & Content

**Phạm vi**: A02 quản lý khóa học, A03 soạn module/bài học, upload, xem trước, AdminShell đầy đủ. **Phụ thuộc**: P02. **FILE_MAPPING**: AD-03…AD-06, AD-12, IN-09. **Cỡ**: L.

## Việc đầu tiên (nếu chưa làm)
- [ ] P04-0 **Spike Cloudinary** (Q-09): upload 1 PDF + 1 video nhỏ; mở URL ở cửa sổ ẩn danh; tải bằng `curl` không cookie ⇒ ghi kết quả vào [[OPEN_QUESTIONS]] ([[concept-file-storage]])

## Việc cần làm
### DTO
- [ ] P04-1 `backend/src/types/dto/admin-course.ts`, `admin-content.ts`: `AdminCourseRowDto/Dto`, `AdminModuleDto`, `AdminLessonDto`, `UploadResultDto` ([[api-admin-courses]], [[api-admin-content]]) → `./sync-types.sh`
### UI
- [ ] P04-2 `AdminShell` hoàn chỉnh: sidebar thống nhất (C-08), `InfoBanner`, Topbar (vai trò + email), `StaffGuard`
- [ ] P04-3 A02: `CourseTable` (tìm, lọc trạng thái, phân trang), `CourseFormModal` (G-02), công tắc xuất bản (G-13), `ConfirmDialog` xóa (G-14)
- [ ] P04-4 A03: `CourseSelect` (G-05), `StructureTree` (thêm/đổi tên/xóa/sắp xếp module & bài — G-03), `LessonForm` (tên, loại, dropzone, link YouTube, Xuất bản)
- [ ] P04-5 `FileDropzone` kiểm cỡ/loại ở client (100 MB / 10 MB) + tiến trình bằng XHR; nút **Xem trước ở client** ⇒ `/admin/lessons/[id]/preview` (tái dùng `LessonViewer`)
### Gọi API (http)
- [ ] P04-6 `services/http/admin-course.http.ts`, `admin-content.http.ts` (upload multipart có tiến trình); `403` ⇒ `ErrorState`
### Backend
- [ ] P04-7 `lib/cloudinary.ts` (upload_stream, destroy best-effort); `middlewares/upload.ts` (multer ghi đĩa tạm, giới hạn theo loại, kiểm magic bytes)
- [ ] P04-8 `modules/courses` (admin): list/create/get/patch/status/delete (ownership, `COURSE_NOT_READY`, `COURSE_HAS_ENROLLMENTS`)
- [ ] P04-9 `modules/modules`: create/patch/delete/order (transaction đánh lại `position`); `modules/lessons`: create/get/patch/delete/order
- [ ] P04-10 `POST /admin/lessons/:id/upload` (VIDEO lấy `durationSeconds`; thay file ⇒ xóa file cũ; PDF ⇒ tạo `ai_documents(lesson_id)` `PENDING` qua `IngestDispatcher` **no-op** — bản thật ở P08)
- [ ] P04-11 `assertCourseOwner` (Admin được); xóa khóa gọi `VectorCleaner` (interface, no-op tới P08)
### Cập nhật DB
- [ ] P04-12 `schema.prisma`: thêm enum `DocStatus`, model `AiDocument` + `User.aiDocuments`, `Course.aiDocuments`, `Lesson.aiDocument` ([[database-erd]])
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p04_ai_documents`

## Checklist test tay (Tech Lead)
- [ ] GV tạo khóa → module → bài → upload video/PDF → xuất bản ⇒ SV thấy ở danh mục; xuất bản khóa không có bài đã xuất bản ⇒ 409
- [ ] GV khác sửa khóa không phải của mình ⇒ 403; Admin sửa được mọi khóa
- [ ] File quá cỡ/sai loại bị từ chối; sắp xếp lại module/bài giữ đúng thứ tự; xóa khóa có ghi danh ⇒ 409
- [ ] Xem trước ở client hoạt động mà không cần ghi danh

## Rủi ro
Upload lớn làm nghẽn Node ⇒ ghi đĩa + stream, không đệm RAM. PDF không tải được ở RAG ⇒ xem kết quả spike P04-0.
