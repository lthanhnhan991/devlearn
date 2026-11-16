---
id: concept-admin-users-dashboard
title: Quản lý người dùng & Dashboard (F5, UC13, UC14)
type: concept
status: stable
tags: [admin, users, dashboard, f5]
related: [concept-roles-permissions, concept-auth, api-admin-users-dashboard, concept-enrollment-progress, plan-phase-09-admin-dashboard-users]
source: "Đồ án UC13, UC14, §1.3.2; UI ADMIN 01, ADMIN 06, CLIENT 02"
updated: 2026-11-15
---
# Người dùng & Dashboard

## Quản lý người dùng (UC13) — chỉ `ADMIN`
- Bảng: Họ tên · Email · Vai trò (select) · Trạng thái (chip) · thao tác **Lưu · Khóa/Mở khóa**; ô tìm theo email.
- **Thêm người dùng**: `fullName`, `email`, `password` tạm, `role`, `studentCode` (nếu STUDENT).
- **Đổi vai trò** (STUDENT/TEACHER/ADMIN) và **Khóa/Mở khóa** (`status`).
- Không có xóa người dùng (bảo toàn lịch sử kết quả).
- Chặn: Admin tự khóa hoặc tự hạ vai trò (`409 CANNOT_MODIFY_SELF`); hạ vai trò Teacher đang là chủ khóa ⇒ cho phép nhưng khóa vẫn thuộc `teacher_id` đó (chỉ Admin sửa được).
- Khóa tài khoản có hiệu lực ngay ([[concept-auth]]).

## Dashboard (UC14)
Phạm vi dữ liệu: **ADMIN = toàn hệ thống; TEACHER = chỉ khóa của mình** (quyết định ở [[delta-vs-thesis]] U-04).

| Thẻ | Định nghĩa |
|---|---|
| Sinh viên | số `users` role STUDENT (Teacher: số SV đã ghi danh khóa của mình) |
| Khóa học | số khóa (Teacher: khóa của mình) |
| Tỷ lệ hoàn thành | `enrollments.completed_at NOT NULL` ÷ tổng `enrollments` × 100 |
| Lượt hỏi AI | số `ai_messages` |

- **Biểu đồ** "Tỷ lệ hoàn thành theo khóa học": mỗi khóa 1 cột = `completedEnrollments ÷ enrollments × 100`.
- **Hoạt động gần đây** (10 dòng): hợp nhất hai nguồn, sắp theo thời gian giảm dần — `enrollments.completed_at` ⇒ "Hoàn thành khóa [tên]" và `attempts.submitted_at` ⇒ "Nộp bài kiểm tra [tên]". **Không có bảng nhật ký riêng.**

## Số liệu công khai trang chủ (CLIENT·02)
`GET /public/stats` ⇒ `{ courseCount (PUBLISHED), studentCount, teacherCount, completionRate }`. Cache phía server 60 giây.

## Lưu ý hiệu năng
Các truy vấn tổng hợp dùng `COUNT/GROUP BY` có index (`enrollments(course_id)`, `attempts(exam_id)`); không tải toàn bộ bản ghi về Node để đếm.
