---
id: plan-phase-09-admin-dashboard-users
title: Phase 09 — Dashboard & Quản lý người dùng (UC13, UC14)
type: plan
status: living
tags: [plan, admin, dashboard, users]
related: [plan-00-overview, workflow-solo-dev, concept-admin-users-dashboard, api-admin-users-dashboard, concept-roles-permissions, ui-screens-admin]
source: "UC13, UC14; UI A01, A06"
updated: 2026-11-15
---
# Phase 09 — Dashboard & Users

**Phạm vi**: A01, A06; rà `public/stats`. **Phụ thuộc**: P06, P08 (có dữ liệu để thống kê). **FILE_MAPPING**: AD-02, AD-11. **Cỡ**: S. Không thêm model DB.

## Việc cần làm
### DTO
- [ ] P09-1 `backend/src/types/dto/dashboard.ts`, `admin-user.ts`: `DashboardDto`, `AdminUserDto`, `CreateUserReq`, `UpdateUserReq` ([[api-admin-users-dashboard]]) → `./sync-types.sh`
### UI
- [ ] P09-2 A01: 4 `StatCard`, `BarChart` (CSS/SVG thuần — không thêm thư viện), `ActivityTable`
- [ ] P09-3 A06: `UserTable` (tìm email, select vai trò, Lưu, Khóa/Mở khóa), `UserFormModal` (G-06), phân trang; mục **Người dùng** chỉ hiện với ADMIN (`AdminOnlyGuard`)
### Gọi API (http)
- [ ] P09-4 `services/http/dashboard.http.ts`, `admin-user.http.ts`
### Backend
- [ ] P09-5 `modules/users`: list (lọc email/vai trò/trạng thái), create (bcrypt), patch (`role`/`status`/`fullName`); chặn tự sửa mình (`CANNOT_MODIFY_SELF`)
- [ ] P09-6 `modules/dashboard`: tổng hợp bằng `COUNT/GROUP BY` (không tải bản ghi về Node); `recentActivities` hợp nhất `completed_at` + `submitted_at`; phạm vi theo vai trò (ADMIN: tất cả; TEACHER: khóa của mình) ([[concept-admin-users-dashboard]])
- [ ] P09-7 Rà `GET /public/stats` dùng cùng định nghĩa `completionRate`
### Cập nhật DB
- [ ] P09-8 Không đổi schema; bổ sung `seed.ts` thêm vài người dùng (SV/GV/Admin, 1 tài khoản `LOCKED`)
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run db:seed`

## Checklist test tay (Tech Lead)
- [ ] GV vào `/admin/users` ⇒ 403/không thấy mục; Admin tạo GV → GV đăng nhập được → Admin khóa GV ⇒ GV bị chặn **ngay**
- [ ] Admin không tự khóa / tự hạ vai trò được
- [ ] Dashboard: số liệu khớp seed; GV chỉ thấy khóa của mình; "Hoạt động gần đây" đúng thứ tự

## Rủi ro
Truy vấn tổng hợp chậm ở dữ liệu lớn ⇒ xem `EXPLAIN`; cache 30–60 s nếu cần.
