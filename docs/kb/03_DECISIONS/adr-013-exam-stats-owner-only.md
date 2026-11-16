---
id: adr-013-exam-stats-owner-only
title: ADR-013 — Thống kê bài kiểm tra chỉ dành cho chủ khóa
type: decision
status: accepted
tags: [adr, authorization, statistics]
related: [concept-exam-statistics, concept-roles-permissions, api-admin-exam-stats]
source: "Đồ án §2.2.5.2; UI A07"
updated: 2026-11-15
---
# ADR-013 — Thống kê = owner-only (kể cả Admin)

## Bối cảnh
Đồ án: API thống kê "chỉ trả dữ liệu khi người gọi là Giảng viên phụ trách khóa học". UI A07: "Quản trị viên xem số liệu tổng hợp ở Dashboard". Nhưng Admin "kế thừa" quyền Giảng viên.

## Quyết định
Với `/admin/exam-stats/*`: so khớp `course.teacher_id === caller.id`, **không có ngoại lệ Admin** (Admin chỉ xem được nếu chính họ là chủ khóa). Admin xem số liệu tổng hợp ở Dashboard.

## Hệ quả
- Service dùng `assertCourseOwnerStrict` (khác `assertCourseOwner` cho phép Admin).
- Test bắt buộc: teacher khác ⇒ 403; admin không phải chủ ⇒ 403 ([[testing-strategy]]).
- Nếu nhà trường muốn Admin xem được: đổi một hàm, không đổi hợp đồng (ghi ở [[OPEN_QUESTIONS]] Q-03).
