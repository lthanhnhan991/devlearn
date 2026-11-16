---
id: plan-phase-03-learning-progress
title: Phase 03 — Học tập & theo dõi tiến độ (UC04)
type: plan
status: living
tags: [plan, learning, progress, f2]
related: [plan-00-overview, concept-enrollment-progress, api-learning, ui-screens-client]
source: "UC04; UI C05, C08"
updated: 2026-11-15
---
# Phase 03 — Learning & Progress

**Phạm vi**: C05 màn học, C08 khóa học của tôi. **Phụ thuộc**: P02. **FILE_MAPPING**: CL-07…CL-09. **Cỡ**: M.

## A — UI + Mock
- [ ] P03-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `LearnStructureDto`, `LessonContentDto`, `CompleteResultDto`, `MyCourseDto`, `LearningSummaryDto`
- [ ] P03-A2 `learning.mock.ts`: tiến độ có trạng thái (hoàn thành bài ⇒ % đổi, 100% ⇒ `courseCompleted`); lỗi `NOT_ENROLLED`; bài chưa có file
- [ ] P03-A3 Layout `(learn)`; `LearnHeader` (tên khóa, thanh tiến độ, Thoát); `LessonSidebar` ("Module 1 · 2/6 bài", ✓/○, bài hiện tại tô nền)
- [ ] P03-A4 `LessonViewer`: `<video controls>` / iframe YouTube / viewer PDF (G-16); lỗi tải + Thử lại
- [ ] P03-A5 Điều hướng Bài trước/Bài tiếp theo; nút **Hoàn thành bài học**; hàng bài kiểm tra trong sidebar (G-08)
- [ ] P03-A6 C08: tab Đang học/Đã hoàn thành, `MyCourseRow` (Tiếp tục/Bắt đầu học), `LearningSummaryCard`
## B — Review
- [ ] P03-B1 Khớp C05/C08 · [ ] % cập nhật tức thì sau hoàn thành · [ ] responsive sidebar (drawer mobile)
## C — Wire
- [ ] P03-C1 `learning.http.ts`; `403 NOT_ENROLLED` ⇒ về chi tiết khóa; tối ưu cập nhật lạc quan cho nút hoàn thành (rollback nếu lỗi)
## D — Backend
- [ ] P03-D1 `progress` service: `computeProgress(userId, courseId)` (một nguồn duy nhất), `resumeLessonId`
- [ ] P03-D2 `GET /courses/:id/learn`, `GET /lessons/:id` (prev/next theo thứ tự phẳng bài đã xuất bản)
- [ ] P03-D3 `POST /lessons/:id/complete` idempotent; set `enrollments.completed_at` một lần ([[concept-enrollment-progress]])
- [ ] P03-D4 `GET /me/courses`, `GET /me/learning-summary`
## E — Test
- [ ] P03-E1 Tiến độ: bài chưa xuất bản không tính; thêm bài sau khi xong **không** xóa `completed_at`; idempotent
- [ ] P03-E2 `NOT_ENROLLED`/`COURSE_UNPUBLISHED`/bài thuộc khóa khác ⇒ 403/404
- [ ] P03-E3 Gỡ `learning` khỏi mock; e2e: học 2 bài → % đúng; về Khóa học của tôi thấy tiến độ
- [ ] P03-E4 DoD + log (đạt cột mốc **M1**)

## Rủi ro
Tiến độ tính ở nhiều nơi lệch nhau ⇒ **chỉ** `computeProgress` (BE) và FE nhận số từ API, không tự tính.
