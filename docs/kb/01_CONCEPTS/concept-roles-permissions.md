---
id: concept-roles-permissions
title: Vai trò & Ma trận phân quyền (RBAC)
type: concept
status: stable
tags: [rbac, authorization, ownership]
related: [concept-topics, concept-auth, adr-009-separate-admin-login-portal, adr-013-exam-stats-owner-only, architecture-backend-layers]
source: "Đồ án §1.3.2, §2.2.5.2, §2.3.3; UI ADMIN 01/06/07"
updated: 2026-11-21
---
# Vai trò & Phân quyền

Ba vai trò lưu ở `users.role`: `STUDENT`, `TEACHER`, `ADMIN`. Vai trò nằm trong JWT nhưng **backend luôn đọc lại `users.status` từ DB** mỗi request ([[concept-auth]]).

## Ma trận quyền
Ký hiệu: ✅ được · ❌ cấm · 👤 chỉ chủ sở hữu (`courses.teacher_id = caller.id`) · 🌐 toàn hệ thống

| Năng lực | Guest | STUDENT | TEACHER | ADMIN |
|---|---|---|---|---|
| Xem trang chủ, danh mục, chi tiết khóa (tên module/bài) | ✅ | ✅ | — | — |
| Đăng ký học, học bài, làm kiểm tra, hỏi AI, xem kết quả của mình | ❌ | ✅ | ❌ | ❌ |
| Tạo khóa học | ❌ | ❌ | ✅ | ✅ |
| Quản lý chủ đề (xem cả chủ đề ẩn, thêm, sửa, sắp xếp, bật/tắt) — dữ liệu dùng chung, không có chủ sở hữu | ❌ | ❌ | ✅ | ✅ |
| Xóa chủ đề chưa có khóa nào dùng | ❌ | ❌ | ❌ | ✅ |
| Sửa/xóa/xuất bản khóa, module, bài học | ❌ | ❌ | 👤 | 🌐 |
| Quản lý bài kiểm tra & câu hỏi | ❌ | ❌ | 👤 | 🌐 |
| Quản lý tài liệu AI (tải, nạp lại, xóa) | ❌ | ❌ | 👤 | 🌐 |
| **Thống kê bài kiểm tra** (danh sách SV, chi tiết bài làm) | ❌ | ❌ | 👤 | 👤 (chỉ khi chính Admin là chủ khóa) |
| Dashboard | ❌ | ❌ | 👤 (số liệu khóa của mình) | 🌐 |
| Quản lý người dùng (UC13) | ❌ | ❌ | ❌ | ✅ |

> "—" = người dùng nhân viên không dùng khu CLIENT; client guard chuyển họ về `/admin` ([[adr-009-separate-admin-login-portal]]).

## Quy tắc then chốt
1. **Ownership**: GV chỉ sửa khóa do mình tạo; Admin kế thừa → sửa mọi khóa (🌐).
2. **Thống kê bài kiểm tra = owner-only** kể cả Admin — theo Đồ án §2.2.5.2 và ghi chú UI "Chỉ giảng viên phụ trách khóa học xem được. Quản trị viên xem số liệu tổng hợp ở Dashboard". Xem [[adr-013-exam-stats-owner-only]].
3. **Sinh viên chỉ thấy dữ liệu của chính mình** (kết quả, lịch sử AI). Mọi query lọc theo `student_id = caller.id`.
4. SV chỉ thấy khóa `PUBLISHED`, bài học `is_published = true`, bài kiểm tra `OPEN|CLOSED` (không thấy `DRAFT`).
5. Truy cập nội dung bài học / đề thi / AI yêu cầu **đã ghi danh** khóa (`403 NOT_ENROLLED`).
6. Admin **không được tự khóa / tự hạ vai trò chính mình** (tránh mất quyền quản trị).

## Cài đặt (backend)
Middleware theo thứ tự: `authenticate` → `requireRole(...roles)` → `loadCourseAndAssertOwner` (khi cần) → controller. Xem [[architecture-backend-layers]].

```ts
// Ví dụ khai báo route
router.get('/exam-stats/exams/:examId', authenticate, requireRole('TEACHER','ADMIN'),
  validate(schemas.examStats), controller.getExamStats); // service tự assertOwner(course.teacherId)
```

## Hiển thị UI theo vai trò
- Sidebar Admin: mục **Người dùng** chỉ render khi `role === 'ADMIN'`; còn lại cả hai vai trò thấy cùng menu. Chi tiết: [[ui-screens-admin]].
- Header admin hiển thị `Vai trò: <Role>` + email.
