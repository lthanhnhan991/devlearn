---
id: api-admin-courses
title: API — Admin: Quản lý khóa học
type: api
status: stable
tags: [api, admin, course]
related: [adr-018-dynamic-topics, concept-topics, api-admin-topics, api-contracts, concept-course-structure, concept-roles-permissions, plan-phase-04-admin-content]
source: "UC08; UI A02"
updated: 2026-11-21
---
# API — Admin / Courses

Quyền: 🧑‍🏫 TEACHER/ADMIN. TEACHER chỉ thấy/sửa khóa của mình (👤); ADMIN toàn bộ (🌐).

## DTO
```ts
interface AdminCourseRowDto { id: string; title: string; topic: TopicRefDto; topicIsActive: boolean; level: LevelCode; status: 'DRAFT'|'PUBLISHED';
  teacher: PersonRefDto; moduleCount: number; enrollmentCount: number; createdAt: ISODate }
interface AdminCourseDto extends AdminCourseRowDto { description: string }
```

## `GET /admin/courses`
Query: `q` (tên), `status=DRAFT|PUBLISHED`, `page`, `pageSize` (mặc định 20), `sort=newest|title`.
```json
{ "data": [ { "id": "c-1", "title": "Nhập môn Python", "topic": { "id": "tp-1", "name": "Lập trình", "slug": "lap-trinh", "color": "#1D5E8C", "icon": "code" }, "topicIsActive": true, "level": "BEGINNER", "status": "PUBLISHED",
              "teacher": { "id": "t-1", "fullName": "Nguyễn Văn A" }, "moduleCount": 5, "enrollmentCount": 132, "createdAt": "…" } ],
  "meta": { "page": 1, "pageSize": 20, "total": 2, "totalPages": 1 } }
```

## `POST /admin/courses`
```json
{ "title": "Git và GitHub cơ bản", "description": "…", "topicId": "tp-4", "level": "BEGINNER" }
```
`201` ⇒ `AdminCourseDto` (`status: "DRAFT"`, `teacher` = người gọi). ADMIN có thể kèm `teacherId` để giao cho GV khác. Validate: `title` 3–200; `topicId` là uuid của chủ đề **đang hoạt động** (không tồn tại ⇒ `404`; đang ẩn ⇒ `409 TOPIC_INACTIVE`); `level` thuộc enum.

## `GET /admin/courses/:courseId`
`AdminCourseDto`. Lỗi `403 FORBIDDEN` nếu TEACHER không sở hữu; `404`.

## `PATCH /admin/courses/:courseId`
Body: bất kỳ tập con `{ title, description, topicId, level }` ⇒ `200 AdminCourseDto`. `409 TOPIC_INACTIVE` **chỉ khi đổi sang** một chủ đề đang ẩn; khóa đang ở chủ đề ẩn vẫn sửa các trường khác bình thường ([[concept-topics]]).

## `PATCH /admin/courses/:courseId/status`
```json
{ "status": "PUBLISHED" }
```
`200 AdminCourseDto`. Xuất bản cần ≥ 1 bài học đã xuất bản (`409 COURSE_NOT_READY`). Gỡ về `DRAFT` luôn được.

## `DELETE /admin/courses/:courseId`
`204`. Lỗi `409 COURSE_HAS_ENROLLMENTS`. Thứ tự: xóa vector RAG của khóa → xóa file Cloudinary (best-effort) → xóa DB. RAG lỗi ⇒ `502 AI_UNAVAILABLE`, không xóa ([[concept-rag-ingestion]]).
