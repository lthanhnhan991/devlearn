---
id: plan-phase-01-auth
title: Phase 01 — Xác thực & phân quyền (UC01, UC02) — ĐÃ HOÀN THÀNH
type: plan
status: living
tags: [plan, auth, f1, done]
related: [plan-00-overview, concept-auth, concept-roles-permissions, api-auth, ui-screens-client, ui-screens-admin, adr-008-jwt-httponly-cookie, adr-009-separate-admin-login-portal]
source: "UC01, UC02"
updated: 2026-11-15
---
# Phase 01 — Auth

**Phạm vi**: C01 (đăng nhập/đăng ký), A00 (đăng nhập quản trị), `AuthContext`, guard, middleware `authenticate/requireRole`.
**Phụ thuộc**: P00. **FILE_MAPPING**: CL-01, CL-02, AD-01, AD-12, IN-05. **Cỡ**: S.
**Trạng thái: Đã hoàn thành thực tế (Tech Lead xác nhận)** — test với PostgreSQL thành công (2026-11-17).
<!--  -->
## Việc đã làm (thứ tự: DTO → UI → gọi API → Backend → DB → Tech Lead test)
- [x] P01-1 **DTO** (`backend/src/types/dto/auth.ts` → `./sync-types.sh`): `UserDto`, request/response register/login ([[api-auth]])
- [x] P01-2 **UI**: C01 (layout chia đôi, tab Đăng nhập/Đăng ký — G-01, validate zod, hiển thị lỗi theo mã), A00 (navy, badge ADMIN), `ClientShell` + Navbar 2 trạng thái (avatar + menu — G-15), `AdminShell` + `StaffGuard`
- [x] P01-3 **Gọi API**: `services/http/auth.http.ts`; `AuthContext` + `useAuth`; `StudentGuard`, `StaffGuard`, `AdminOnlyGuard`; `GET /auth/me` khi khởi động; xử lý `401` toàn cục (`?next=`) ([[error-handling-conventions]])
- [x] P01-4 **Backend**: `modules/auth` (`register`, `login`, `admin/login`, `logout`, `me`); `lib/password.ts` (bcrypt 12), `lib/jwt.ts`; middleware `authenticate` (cookie → Bearer, tra trạng thái DB), `optionalAuthenticate`, `requireRole`; rate limit login/register; chuẩn hóa email; unique `studentCode`
- [x] P01-5 **DB**: enum `Role`, `UserStatus` + bảng `users` đã migrate
- [x] P01-6 **Tech Lead test**: đăng ký (ok / trùng email / trùng MSSV / validate); đăng nhập hai cổng (ok / sai mật khẩu / `ACCOUNT_LOCKED` / `WRONG_PORTAL`); đăng xuất; `GET /auth/me`; khóa tài khoản có hiệu lực ngay dù cookie còn hạn

## Rủi ro
Cookie cross-origin (`localhost:3000` ↔ `localhost:4000`): kiểm `SameSite`, `credentials`, CORS origin cụ thể ngay ở P01-C1.
