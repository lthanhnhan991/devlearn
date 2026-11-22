---
id: api-learning
title: API — Học tập, tiến độ, Khóa học của tôi
type: api
status: stable
tags: [api, learning, progress]
related: [api-contracts, concept-enrollment-progress, plan-phase-03-learning-progress]
source: "UC04; UI C05, C08"
updated: 2026-11-21
---
# API — Learning

## `GET /me/courses` 🎓
Query: `status=in-progress|completed` (mặc định `in-progress`).
```json
{ "data": [ { "course": { "id": "c-1", "title": "Nhập môn Python", "topic": { "id": "tp-1", "name": "Lập trình", "slug": "lap-trinh", "color": "#1D5E8C", "icon": "code" }, "teacher": { "id": "t-1", "fullName": "Nguyễn Văn A" } },
              "progressPercent": 35, "enrolledAt": "2026-11-01T03:00:00.000Z", "completedAt": null, "resumeLessonId": "l-3" } ] }
```
Sắp theo hoạt động gần nhất (tiến độ cập nhật cuối, rồi `enrolledAt`). FE: `progressPercent = 0` ⇒ nhãn nút **Bắt đầu học**.

## `GET /me/learning-summary` 🎓
```json
{ "data": { "inProgressCount": 3, "completedCount": 1, "averageExamScore": 6.33 } }
```
`averageExamScore` = TB điểm cao nhất mỗi bài đã làm; `null` nếu chưa làm.

## `GET /courses/:courseId/learn` 🎓
Cấu trúc cho sidebar + tiến độ. Yêu cầu đã ghi danh, khóa `PUBLISHED`.
```json
{ "data": {
  "course": { "id": "c-1", "title": "Nhập môn Python" },
  "progressPercent": 35,
  "modules": [ { "id": "m-1", "title": "Làm quen Python", "position": 0, "completedCount": 2, "totalCount": 6,
      "lessons": [ { "id": "l-1", "title": "Bài 1", "contentType": "VIDEO", "durationSeconds": 540, "position": 0, "isCompleted": true } ],
      "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "status": "OPEN", "durationMinutes": 15, "passScore": 5, "questionCount": 10 } } ],
  "finalExam": null
} }
```
Lỗi: `401`, `403 NOT_ENROLLED`, `403 COURSE_UNPUBLISHED`, `404`.

## `GET /lessons/:lessonId` 🎓
```json
{ "data": { "id": "l-3", "title": "Vòng lặp for", "contentType": "VIDEO",
            "fileUrl": "https://res.cloudinary.com/…/video.mp4", "durationSeconds": 612,
            "courseId": "c-1", "moduleId": "m-1", "isCompleted": false,
            "prevLessonId": "l-2", "nextLessonId": "l-4", "progressPercent": 35 } }
```
- `fileUrl` có thể là Cloudinary hoặc YouTube; `null` nếu GV chưa tải nội dung.
- `prev/nextLessonId` theo thứ tự phẳng các bài đã xuất bản; `null` ở hai đầu.
- Bài chưa xuất bản / không thuộc khóa đã ghi danh ⇒ `404` hoặc `403 NOT_ENROLLED`.

## `POST /lessons/:lessonId/complete` 🎓 (idempotent)
Không body.
```json
// 200
{ "data": { "lessonId": "l-3", "completedAt": "2026-11-15T08:10:00.000Z", "progressPercent": 41, "courseCompleted": false } }
```
Khi lần đầu đạt 100% ⇒ `courseCompleted: true` và set `enrollments.completed_at`. Gọi lại: trả `completedAt` cũ, không đổi dữ liệu.
