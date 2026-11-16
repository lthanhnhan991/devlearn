---
id: plan-phase-09-admin-dashboard-users
title: Phase 09 — Dashboard & Quản lý người dùng (UC13, UC14)
type: plan
status: living
tags: [plan, admin, dashboard, users]
related: [plan-00-overview, concept-admin-users-dashboard, api-admin-users-dashboard, concept-roles-permissions, ui-screens-admin]
source: "UC13, UC14; UI A01, A06"
updated: 2026-11-15
---
# Phase 09 — Dashboard & Users

**Phạm vi**: A01, A06; kiểm lại `public/stats`. **Phụ thuộc**: P06, P08 (dữ liệu để thống kê). **FILE_MAPPING**: AD-02, AD-11. **Cỡ**: S.

## A — UI + Mock
- [ ] P09-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `DashboardDto`, `AdminUserDto`, `CreateUserReq`, `UpdateUserReq`
- [ ] P09-A2 `dashboard.mock.ts` (scope ALL/OWN), `admin-user.mock.ts` (`EMAIL_TAKEN`, `CANNOT_MODIFY_SELF`)
- [ ] P09-A3 A01: 4 `StatCard`, `BarChart` (CSS/SVG thuần — không thêm thư viện), `ActivityTable`
- [ ] P09-A4 A06: `UserTable` (tìm email, select vai trò, Lưu, Khóa/Mở khóa), `UserFormModal` (G-06), phân trang; mục **Người dùng** chỉ hiện với ADMIN (`AdminOnlyGuard`)
## B — Review
- [ ] P09-B1 Khớp A01/A06 · [ ] G-06 duyệt · [ ] chấp nhận dashboard cho GV phạm vi "của tôi" (Q-05)
## C — Wire
- [ ] P09-C1 `dashboard.http.ts`, `admin-user.http.ts`
## D — Backend
- [ ] P09-D1 `users`: list (lọc email/vai trò/trạng thái), create (bcrypt), patch (`role`/`status`/`fullName`); chặn tự sửa mình
- [ ] P09-D2 `dashboard`: tổng hợp bằng `COUNT/GROUP BY` (không tải bản ghi về Node); `recentActivities` hợp nhất `completed_at` + `submitted_at` ([[concept-admin-users-dashboard]]); scope theo vai trò
- [ ] P09-D3 Rà `GET /public/stats` dùng cùng định nghĩa `completionRate`
## E — Test
- [ ] P09-E1 Chỉ ADMIN vào `/admin/users` (GV ⇒ 403); khóa user ⇒ đăng nhập/yêu cầu kế tiếp bị chặn ngay
- [ ] P09-E2 Số liệu dashboard đúng với seed; GV chỉ thấy khóa của mình
- [ ] P09-E3 Gỡ mock; e2e: Admin tạo GV → GV đăng nhập → Admin khóa GV → GV bị chặn
- [ ] P09-E4 DoD + log

## Rủi ro
Truy vấn tổng hợp chậm ở dữ liệu lớn ⇒ đo `EXPLAIN`; cache 30–60 s nếu cần.
