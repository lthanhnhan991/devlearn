---
id: plan-phase-01-auth
title: Phase 01 — Xác thực & phân quyền (UC01, UC02)
type: plan
status: living
tags: [plan, auth, f1]
related: [plan-00-overview, concept-auth, concept-roles-permissions, api-auth, ui-screens-client, ui-screens-admin, adr-008-jwt-httponly-cookie, adr-009-separate-admin-login-portal]
source: "UC01, UC02"
updated: 2026-11-15
---
# Phase 01 — Auth

**Phạm vi**: C01 (đăng nhập/đăng ký), A00 (đăng nhập quản trị), `AuthContext`, guard, middleware `authenticate/requireRole`.
**Phụ thuộc**: P00. **FILE_MAPPING**: CL-01, CL-02, AD-01, AD-12, IN-05. **Cỡ**: S.

## A — UI + Mock
- [x] P01-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `UserDto`, request/response register/login ([[api-auth]])
- [x] P01-A2 Fixtures: tài khoản seed; `auth.mock.ts` (đúng `WRONG_PORTAL`, `ACCOUNT_LOCKED`, `INVALID_CREDENTIALS`, `EMAIL_TAKEN`)
- [x] P01-A3 C01: layout chia đôi, tab Đăng nhập/Đăng ký (G-01 form đăng ký), validate zod, hiển thị lỗi theo mã
- [x] P01-A4 A00: trang đăng nhập quản trị (navy, badge ADMIN, link về trang người học)
- [x] P01-A5 `AuthContext` + `useAuth`; `StudentGuard`, `StaffGuard`, `AdminOnlyGuard`; điều hướng `?next=`
- [x] P01-A6 Navbar: trạng thái chưa đăng nhập (nút Đăng nhập/Đăng ký) và đã đăng nhập (avatar chữ cái đầu + menu G-15)
## B — Review
- [x] P01-B1 Khớp C01/A00 · [x] đủ trạng thái lỗi · [x] G-01, G-15 được duyệt
## C — Wire
- [x] P01-C1 `auth.http.ts`; `GET /auth/me` khi khởi động; xử lý `401` toàn cục ([[error-handling-conventions]])
## D — Backend
- [x] P01-D1 `lib/password.ts` (bcrypt 12), `lib/jwt.ts`; cookie options theo env
- [x] P01-D2 `auth.repository/service/controller/routes`: `register`, `login`, `admin/login`, `logout`, `me`
- [x] P01-D3 Middleware `authenticate` (cookie → Bearer, tra DB trạng thái), `optionalAuthenticate`, `requireRole`
- [x] P01-D4 Rate limit login/register; chuẩn hóa email; unique `studentCode`
## E — Test
- [x] P01-E1 API: đăng ký ok/trùng email/trùng MSSV/validate; login ok/sai mật khẩu/`LOCKED`/`WRONG_PORTAL` cả hai cổng
- [x] P01-E2 **Khóa tài khoản có hiệu lực ngay** dù token còn hạn
- [x] P01-E3 Gỡ `auth` khỏi `NEXT_PUBLIC_MOCK_FEATURES`; e2e: đăng ký → đăng nhập → đăng xuất; GV vào admin, SV bị từ chối
- [x] P01-E4 DoD + cập nhật FILE_MAPPING/PROGRESS

## Rủi ro
Cookie cross-origin (`localhost:3000` ↔ `localhost:4000`): kiểm `SameSite`, `credentials`, CORS origin cụ thể ngay ở P01-C1.
