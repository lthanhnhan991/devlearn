---
id: api-admin-content
title: API — Admin: Module, bài học, upload
type: api
status: stable
tags: [api, admin, module, lesson, upload]
related: [api-contracts, concept-course-structure, concept-file-storage, adr-010-unify-documents-into-ai-documents, plan-phase-04-admin-content]
source: "UC09; UI A03"
updated: 2026-11-15
---
# API — Admin / Content

Quyền: owner (👤) hoặc ADMIN (🌐) của khóa chứa tài nguyên.

## DTO
```ts
interface AdminLessonDto { id: string; moduleId: string; title: string; contentType: ContentType; fileUrl: string | null;
  durationSeconds: number | null; position: number; isPublished: boolean; aiDocument: { id: string; status: DocStatus } | null }
interface AdminModuleDto { id: string; title: string; position: number; lessons: AdminLessonDto[] }
```

## `GET /admin/courses/:courseId/structure`
```json
{ "data": { "course": { "id": "c-1", "title": "Nhập môn Python", "status": "DRAFT" },
            "modules": [ { "id": "m-1", "title": "Làm quen Python", "position": 0,
                           "lessons": [ { "id": "l-1", "moduleId": "m-1", "title": "Bài 1", "contentType": "VIDEO", "fileUrl": null,
                                          "durationSeconds": null, "position": 0, "isPublished": false, "aiDocument": null } ] } ] } }
```

## Module
| Endpoint | Body | Phản hồi |
|---|---|---|
| `POST /admin/courses/:courseId/modules` | `{ "title": "Module 2" }` | `201 AdminModuleDto` (đặt cuối) |
| `PATCH /admin/modules/:moduleId` | `{ "title"? }` | `200 AdminModuleDto` |
| `PUT /admin/courses/:courseId/modules/order` | `{ "orderedIds": ["m-2","m-1"] }` | `200 { data: { orderedIds } }`; phải đủ & đúng tập module của khóa |
| `DELETE /admin/modules/:moduleId` | — | `204`; cascade bài học; `409 EXAM_HAS_ATTEMPTS` |

## Lesson
### `POST /admin/modules/:moduleId/lessons`
```json
{ "title": "Vòng lặp for", "contentType": "VIDEO", "fileUrl": "https://youtu.be/xxxx", "isPublished": false }
```
`fileUrl` tùy chọn (link YouTube/URL ngoài; bỏ trống nếu sẽ upload). `201 AdminLessonDto`. Validate: `title` 1–200.

### `GET /admin/lessons/:lessonId` ⇒ `200 AdminLessonDto` (dùng cho Xem trước ở client)
### `PATCH /admin/lessons/:lessonId`
Tập con `{ title, contentType, fileUrl, isPublished }` ⇒ `200 AdminLessonDto`. Đổi `contentType` khi đã có file ⇒ `400` (phải xóa file trước).
### `PUT /admin/modules/:moduleId/lessons/order` — `{ "orderedIds": [...] }` ⇒ `200`
### `DELETE /admin/lessons/:lessonId` ⇒ `204` (xóa vector `ai_document` nếu có → file Cloudinary → DB)

### `POST /admin/lessons/:lessonId/upload`
`multipart/form-data`, trường `file`. Chấp nhận theo `contentType` của bài: VIDEO ⇒ `video/mp4|webm` ≤ 100 MB; PDF ⇒ `application/pdf` ≤ 10 MB.
```json
// 200
{ "data": { "lesson": { "id": "l-3", "moduleId": "m-1", "title": "…", "contentType": "PDF",
                        "fileUrl": "https://res.cloudinary.com/…/doc.pdf", "durationSeconds": null, "position": 2, "isPublished": false,
                        "aiDocument": { "id": "d-9", "status": "PROCESSING" } },
            "aiDocument": { "id": "d-9", "courseId": "c-1", "courseTitle": "…", "lessonId": "l-3", "fileName": "tai-lieu.pdf",
                            "fileUrl": "…", "status": "PROCESSING", "errorMessage": null, "uploadedAt": "…" } } }
```
- PDF ⇒ tạo/ghi đè `ai_documents(lesson_id)` và kích hoạt nạp ([[adr-010-unify-documents-into-ai-documents]]); VIDEO ⇒ `aiDocument: null`, `durationSeconds` lấy từ Cloudinary.
- Thay file cũ: xóa file cũ (và vector) sau khi file mới lưu xong.
- Lỗi: `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_FILE_TYPE`, `403`, `404`, `502` (Cloudinary).
