---
id: concept-course-structure
title: Cấu trúc khóa học (Course → Module → Lesson)
type: concept
status: stable
tags: [course, module, lesson, f2]
related: [concept-topics, adr-018-dynamic-topics, concept-enrollment-progress, concept-file-storage, api-catalog, api-admin-courses, api-admin-content, database-prisma-schema]
source: "Đồ án §2.3.1.2, UC08, UC09; UI CLIENT 03/04, ADMIN 02/03"
updated: 2026-11-21
---
# Cấu trúc khóa học

```
Course (DRAFT|PUBLISHED, thuộc 1 teacher)
 ├─ Module 1..N  (position)
 │    ├─ Lesson 1..N (VIDEO|PDF, position, is_published)
 │    └─ Exam (0..1)  ← "Kiểm tra Module"
 └─ Exam cuối khóa (0..1, exams.module_id = NULL)
```

## Thuộc tính khóa học
| Trường | Quy tắc |
|---|---|
| `title` | 3–200 ký tự |
| `description` | text, hiển thị ở tab **Tổng quan** |
| `topic_id` | FK **bắt buộc** tới bảng `topics` (chủ đề động — [[concept-topics]]); 1 khóa thuộc đúng 1 chủ đề |
| `level` | `BEGINNER` (Nhập môn), `INTERMEDIATE` (Trung cấp), `ADVANCED` (Nâng cao) |
| `status` | `DRAFT` (Bản nháp) / `PUBLISHED` (Đã xuất bản) |
| `teacher_id` | người tạo = chủ sở hữu |

Nhãn tiếng Việt của các **mã** (`level`, `status`…) nằm ở `backend/src/types/labels.ts` (FE dùng bản copy `@/types/labels`) — **không hardcode trong component** ([[coding-standards-frontend]]). **Chủ đề không còn là mã**: tên/màu/thứ tự lấy từ dữ liệu `topics` qua API.

## Dữ liệu dẫn xuất hiển thị trên thẻ khóa học
- `lessonCount` = số bài học **đã xuất bản**.
- `totalDurationMinutes` = `ceil(sum(lessons.duration_seconds)/60)`; UI đổi sang giờ (`[n] giờ`).
- `enrollmentCount` = số bản ghi `enrollments`.
- UI không có ảnh bìa: màu thẻ lấy theo `topic.color` (không có ⇒ token mặc định; xem [[ui-design-system]]); nhãn chủ đề = `topic.name`.

## Quy tắc xuất bản
1. Tạo mới → `DRAFT`. Chỉ `PUBLISHED` mới xuất hiện ở CLIENT.
2. Xuất bản yêu cầu ≥ 1 module có ≥ 1 bài học `is_published = true` (`409 COURSE_NOT_READY`).
3. Chuyển lại `DRAFT` được phép; SV đã ghi danh **vẫn giữ ghi danh** nhưng khóa biến mất khỏi danh mục và không học tiếp được (`403 COURSE_UNPUBLISHED`).
4. Bài học `is_published = false` không hiện với SV và **không tính** vào tiến độ.

## Xóa
- Xóa **khóa**: chỉ khi chưa có ghi danh, nếu không `409 COURSE_HAS_ENROLLMENTS`. Khi xóa: (1) yêu cầu RAG xóa vector của khóa, (2) xóa file Cloudinary (best-effort), (3) xóa DB (cascade).
- Xóa **module**: cascade bài học; bị chặn nếu module có bài kiểm tra đã có lượt làm (`409 EXAM_HAS_ATTEMPTS`).
- Xóa **bài học**: xóa `lesson_progress`; nếu là PDF có `ai_document` → xóa vector trước ([[concept-rag-ingestion]]).

## Sắp xếp
`position` là số nguyên 0-based, **liền mạch** trong phạm vi cha. Sắp xếp lại bằng endpoint `PUT .../order` nhận mảng id đã sắp ([[api-admin-content]]); server ghi lại `position` trong một transaction. Không đặt unique trên `position` (tránh lỗi khi hoán đổi).

## Nội dung bài học
- `VIDEO`: `file_url` là URL Cloudinary **hoặc** link YouTube (không công khai) — FE nhận biết qua hostname để chọn `<video>` hay `<iframe>`.
- `PDF`: `file_url` Cloudinary; FE nhúng bằng trình xem PDF. Upload PDF **tự tạo `ai_document` và kích hoạt nạp** ([[adr-010-unify-documents-into-ai-documents]]).
- Chi tiết upload: [[concept-file-storage]].

## Xem trước (GV)
Nút **Xem trước ở client** mở `/admin/lessons/[id]/preview` (tái dùng component học tập, gọi `GET /admin/lessons/:id`) — không cần ghi danh, không ghi tiến độ.
