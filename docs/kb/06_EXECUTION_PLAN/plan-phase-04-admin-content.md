---
id: plan-phase-04-admin-content
title: Phase 04 — Admin: quản lý khóa học & soạn bài + upload (UC08, UC09)
type: plan
status: living
tags: [plan, admin, course, lesson, upload]
related: [plan-00-overview, api-admin-courses, api-admin-content, concept-course-structure, concept-file-storage, ui-screens-admin, adr-010-unify-documents-into-ai-documents]
source: "UC08, UC09; UI A02, A03"
updated: 2026-11-15
---
# Phase 04 — Admin: Courses & Content

**Phạm vi**: A02 quản lý khóa học, A03 soạn module/bài học, upload, xem trước. **Phụ thuộc**: P02. **FILE_MAPPING**: AD-03…AD-06, IN-09. **Cỡ**: L.

## A — UI + Mock
- [ ] P04-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`) admin: `AdminCourseRowDto/Dto`, `AdminModuleDto`, `AdminLessonDto`, `UploadResultDto`
- [ ] P04-A2 `admin-course.mock.ts`, `admin-content.mock.ts` (CRUD trong bộ nhớ, sắp xếp lại, upload giả có tiến trình, lỗi 413/415)
- [ ] P04-A3 `AdminShell` hoàn chỉnh: sidebar thống nhất, `InfoBanner`, topbar (vai trò + email), `StaffGuard`
- [ ] P04-A4 A02: `CourseTable` (tìm, lọc trạng thái, phân trang G-11), `CourseFormModal` (G-02), công tắc xuất bản (G-13), `ConfirmDialog` xóa (G-14)
- [ ] P04-A5 A03: `CourseSelect` (G-05), `StructureTree` (thêm/đổi tên/xóa/kéo-thả module & bài — G-03), `LessonForm` (tên, loại, `FileDropzone`, nhập link YouTube, Xuất bản)
- [ ] P04-A6 Giới hạn upload ở FE (100 MB/10 MB) + tiến trình bằng XHR; nút **Xem trước ở client** ⇒ `/admin/lessons/[id]/preview` (tái dùng `LessonViewer`)
## B — Review
- [ ] P04-B1 Khớp A02/A03 · [ ] G-02/03/05/11/13/14 duyệt · [ ] kéo-thả thứ tự mượt, có phương án bàn phím
## C — Wire
- [ ] P04-C1 `admin-course.http.ts`, `admin-content.http.ts`; upload multipart + tiến trình; quyền `403` ⇒ ErrorState
## D — Backend
- [ ] P04-D1 `lib/cloudinary.ts` (upload_stream, destroy best-effort), `middlewares/upload.ts` (multer đĩa tạm, giới hạn theo loại, kiểm magic bytes)
- [ ] P04-D2 `courses` admin: list/create/get/patch/status/delete (ownership, `COURSE_NOT_READY`, `COURSE_HAS_ENROLLMENTS`)
- [ ] P04-D3 `modules`: create/patch/delete/order (transaction đánh lại `position`)
- [ ] P04-D4 `lessons`: create/get/patch/delete/order; `POST /:id/upload` (VIDEO lấy `durationSeconds`; thay file ⇒ xóa file cũ)
- [ ] P04-D5 Cổng `IngestDispatcher` (interface): upload PDF tạo `ai_documents(lesson_id)` `PENDING`; **bản no-op ở phase này**, bản thật ở [[plan-phase-08-ai-chat-and-docs]]
- [ ] P04-D6 `assertCourseOwner` (Admin được); cổng xóa khóa gọi `VectorCleaner` (interface, no-op tới P08)
## E — Test
- [ ] P04-E1 Ownership: GV khác ⇒ 403; Admin ⇒ ok; xuất bản thiếu bài ⇒ 409; xóa khóa có ghi danh ⇒ 409
- [ ] P04-E2 Upload: 413, 415 (đổi đuôi `.pdf` giả), tạm file được dọn; video lưu `durationSeconds`
- [ ] P04-E3 Sắp xếp lại: `orderedIds` thiếu/thừa ⇒ 400; `position` liền mạch
- [ ] P04-E4 Gỡ mock; e2e: GV tạo khóa → module → bài → upload → xuất bản → SV thấy ở danh mục
- [ ] P04-E5 DoD + log

## Rủi ro
Upload lớn làm nghẽn Node ⇒ ghi đĩa + stream, không đệm RAM; timeout reverse proxy cho upload 100 MB.
