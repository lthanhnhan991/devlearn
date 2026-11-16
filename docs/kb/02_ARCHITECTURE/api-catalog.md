---
id: api-catalog
title: API — Danh mục khóa học công khai & Ghi danh
type: api
status: stable
tags: [api, catalog, enroll]
related: [api-contracts, concept-course-structure, concept-enrollment-progress, plan-phase-02-course-catalog]
source: "UC03, UC04; UI C02, C03, C04"
updated: 2026-11-15
---
# API — Catalog & Enroll

## `GET /public/stats` 🔓
Cache server 60 s.
```json
{ "data": { "courseCount": 6, "studentCount": 1240, "teacherCount": 12, "completionRate": 61.5 } }
```
`completionRate`: % (1 chữ số thập phân) — [[concept-admin-users-dashboard]].

## `GET /courses` 🔓
Chỉ khóa `PUBLISHED`.
| Query | Mô tả |
|---|---|
| `q` | tìm trong `title` (không phân biệt hoa thường, bỏ dấu nếu có `unaccent`; nếu không, `ILIKE`) |
| `topic` | lặp được: `topic=PROGRAMMING&topic=WEB` |
| `level` | lặp được |
| `sort` | `newest` (mặc định) · `popular` (theo `enrollmentCount` giảm dần) |
| `page`, `pageSize` | mặc định 1 / 12 |
```json
// 200
{ "data": [ { "id": "c-1", "title": "Nhập môn Python", "topic": "PROGRAMMING", "level": "BEGINNER",
              "teacher": { "id": "t-1", "fullName": "Nguyễn Văn A" }, "lessonCount": 24, "totalDurationMinutes": 480, "enrollmentCount": 132 } ],
  "meta": { "page": 1, "pageSize": 12, "total": 6, "totalPages": 1 } }
```

## `GET /courses/:courseId` 🔓? 
Khóa phải `PUBLISHED` (nếu không `404`). Nếu có phiên SV ⇒ điền `enrollment`.
```json
// 200
{ "data": {
  "id": "c-1", "title": "Nhập môn Python", "description": "…", "topic": "PROGRAMMING", "level": "BEGINNER",
  "teacher": { "id": "t-1", "fullName": "Nguyễn Văn A" },
  "lessonCount": 24, "moduleCount": 5, "examCount": 3, "totalDurationMinutes": 480, "enrollmentCount": 132,
  "modules": [ { "id": "m-1", "title": "Làm quen Python", "position": 0,
      "lessons": [ { "id": "l-1", "title": "Cài đặt môi trường", "contentType": "VIDEO", "durationSeconds": 540, "position": 0 } ],
      "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "status": "OPEN", "durationMinutes": 15, "passScore": 5, "questionCount": 10 } } ],
  "finalExam": null,
  "enrollment": { "enrolledAt": "2026-11-01T03:00:00.000Z", "progressPercent": 35, "completedAt": null, "resumeLessonId": "l-3" }
} }
```
- `enrollment = null` nếu khách/chưa ghi danh/không phải SV.
- Chỉ liệt kê bài `is_published = true`; **không** trả `fileUrl` (nội dung chỉ qua [[api-learning]]).
- `examCount` đếm bài `OPEN|CLOSED` (kể cả cuối khóa).

## `POST /courses/:courseId/enroll` 🎓
Không body.
```json
// 201
{ "data": { "courseId": "c-1", "enrolledAt": "2026-11-15T08:00:00.000Z", "progressPercent": 0, "resumeLessonId": "l-1" } }
```
Lỗi: `401`, `403 WRONG_PORTAL`/`FORBIDDEN` (không phải SV), `404`, `409 ALREADY_ENROLLED`.
