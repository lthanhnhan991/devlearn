---
id: concept-enrollment-progress
title: Ghi danh & Tiến độ học tập
type: concept
status: stable
tags: [enrollment, progress, f2]
related: [concept-course-structure, api-catalog, api-learning, concept-admin-users-dashboard, plan-phase-03-learning-progress]
source: "Đồ án §2.3.1.3, UC04; UI CLIENT 04/05/08"
updated: 2026-11-15
---
# Ghi danh & Tiến độ

## Ghi danh (Enrollment)
- SV bấm **Đăng ký học khóa học** (khóa `PUBLISHED`) → tạo `enrollments(user_id, course_id, enrolled_at)`.
- Đã ghi danh lần nữa → `409 ALREADY_ENROLLED` (FE coi như thành công và làm mới trạng thái).
- Không có hủy ghi danh (ngoài phạm vi).
- Khóa miễn phí; không có luồng thanh toán.

## Tiến độ
```
progressPercent = round( completedPublishedLessons / totalPublishedLessons × 100 )
```
- `completedPublishedLessons` đếm `lesson_progress` của SV trên các bài `is_published = true` của khóa.
- Khóa có 0 bài đã xuất bản → `0`.
- Nút **Hoàn thành bài học** (hoặc xem xong) → `POST /lessons/:id/complete` — **idempotent** (gọi lại không đổi `completed_at`).
- Khi `progressPercent` đạt 100 lần đầu → set `enrollments.completed_at = now()` (một lần, **không xóa** khi GV thêm bài mới sau đó). Phản hồi có `courseCompleted: true`.
- Bài kiểm tra **không** là điều kiện hoàn thành khóa (giả định — xem [[delta-vs-thesis]] mục U-06).

## Điểm tiếp tục học (`resumeLessonId`)
Bài học đã xuất bản **đầu tiên** (theo thứ tự module → bài) mà SV chưa hoàn thành; nếu đã xong hết → bài cuối. FE dùng cho nút **Tiếp tục học** / **Bắt đầu học** (khi `progressPercent = 0`).

## Màn "Khóa học của tôi"
| Tab | Điều kiện |
|---|---|
| Đang học | `completed_at IS NULL` |
| Đã hoàn thành | `completed_at IS NOT NULL` |

Khung **Tổng quan học tập**: `inProgressCount`, `completedCount`, `averageExamScore` (trung bình điểm **cao nhất** của từng bài kiểm tra đã làm; `null` nếu chưa làm bài nào).

## Sidebar màn học
Mỗi module hiển thị `completedCount/totalCount bài` (ví dụ "Module 1 · 2/6 bài"); bài đã xong có ✓, chưa xong ○, bài hiện tại tô nền xanh nhạt. Điều hướng **Bài trước/Bài tiếp theo** theo thứ tự phẳng của các bài đã xuất bản ([[api-learning]] trả `prevLessonId`/`nextLessonId`).

## Ngoại lệ (Đồ án UC04)
- Chưa ghi danh → API `403 NOT_ENROLLED`; FE chuyển về trang chi tiết khóa.
- Lỗi tải video/PDF → hiển thị lỗi + nút **Thử lại** (không chặn điều hướng).

## Số liệu tổng hợp liên quan
`completionRate` (trang chủ & Dashboard) = `enrollments có completed_at` ÷ `tổng enrollments` × 100 — xem [[concept-admin-users-dashboard]].
