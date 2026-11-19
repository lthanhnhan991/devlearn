---
id: plan-phase-03-learning-progress
title: Phase 03 — Học tập & theo dõi tiến độ (UC04)
type: plan
status: living
tags: [plan, learning, progress, f2]
related: [plan-00-overview, workflow-solo-dev, concept-enrollment-progress, api-learning, ui-screens-client, database-erd]
source: "UC04; UI C05, C08"
updated: 2026-11-15
---
# Phase 03 — Learning & Progress

**Phạm vi**: C05 màn học, C08 khóa học của tôi. **Phụ thuộc**: P02. **FILE_MAPPING**: CL-07…CL-09. **Cỡ**: M.

## Việc cần làm
### DTO
- [ ] P03-1 `backend/src/types/dto/learning.ts`: `LearnStructureDto`, `LessonContentDto`, `CompleteResultDto`, `MyCourseDto`, `LearningSummaryDto` ([[api-learning]]) → `./sync-types.sh`
### UI
- [ ] P03-2 Layout `(learn)`; `LearnHeader` (tên khóa, thanh tiến độ, Thoát); `LessonSidebar` ("Module 1 · 2/6 bài", ✓/○, bài hiện tại tô nền; hàng bài kiểm tra — G-08)
- [ ] P03-3 `LessonViewer`: `<video controls>` / iframe YouTube / trình xem PDF (G-16); lỗi tải + **Thử lại**; bài chưa có file ⇒ thông báo
- [ ] P03-4 Bài trước/Bài tiếp theo; nút **Hoàn thành bài học**; C08 (tab Đang học/Đã hoàn thành, `MyCourseRow`, `LearningSummaryCard`)
### Gọi API (http)
- [ ] P03-5 `services/http/learning.http.ts`: `getLearnStructure`, `getLesson`, `completeLesson`, `getMyCourses`, `getLearningSummary`; `403 NOT_ENROLLED` ⇒ về trang chi tiết khóa
### Backend
- [ ] P03-6 `progress`: `computeProgress(userId, courseId)` — **một nguồn duy nhất**; `resumeLessonId`
- [ ] P03-7 `GET /courses/:id/learn`, `GET /lessons/:id` (prev/next theo thứ tự phẳng bài đã xuất bản)
- [ ] P03-8 `POST /lessons/:id/complete` idempotent; set `enrollments.completed_at` đúng một lần ([[concept-enrollment-progress]])
- [ ] P03-9 `GET /me/courses`, `GET /me/learning-summary`
### Cập nhật DB
- [ ] P03-10 `schema.prisma`: thêm `LessonProgress` + `User.lessonProgress`, `Lesson.progress` ([[database-erd]])
- [ ] P03-11 `seed.ts`: tiến độ mẫu (Python 35%, SQL 70%, Next.js 0%)
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p03_progress` rồi `npm run db:seed`

## Checklist test tay (Tech Lead)
- [ ] Học 2 bài ⇒ % đúng; bấm Hoàn thành hai lần không đổi; đạt 100% ⇒ khóa sang "Đã hoàn thành"
- [ ] Bài chưa xuất bản không tính vào %; chưa ghi danh mà vào URL bài học ⇒ bị chặn
- [ ] Khóa học của tôi: nút Tiếp tục/Bắt đầu học đúng; số liệu Tổng quan đúng

## Rủi ro
Tiến độ tính ở nhiều nơi lệch nhau ⇒ **chỉ** `computeProgress` (BE); FE nhận số từ API, không tự tính.
