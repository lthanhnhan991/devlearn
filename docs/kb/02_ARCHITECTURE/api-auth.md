---
id: api-auth
title: API — Auth (đăng ký, đăng nhập, phiên)
type: api
status: stable
tags: [api, auth]
related: [api-contracts, concept-auth, adr-008-jwt-httponly-cookie, adr-009-separate-admin-login-portal, plan-phase-01-auth]
source: "UC01, UC02; UI C01, A00"
updated: 2026-11-15
---
# API — Auth

Tất cả trả cookie `Set-Cookie: devlearn_token=…; HttpOnly; SameSite=Lax; Path=/` khi đăng nhập/đăng ký thành công.

## `POST /auth/register` 🔓
Rate limit 5/giờ/IP.
```json
// Request
{ "fullName": "Lê Thanh Nhàn", "studentCode": "DH52301350", "email": "na@stu.edu.vn", "password": "Passw0rd!" }
```
```json
// 201
{ "data": { "user": { "id": "u-1", "fullName": "Lê Thanh Nhàn", "email": "na@stu.edu.vn", "role": "STUDENT", "studentCode": "DH52301350" } } }
```
Validate: `fullName` 2–100; `studentCode` 4–20 `[A-Za-z0-9]`; `email` hợp lệ ≤150; `password` ≥ 8, có chữ và số.
Lỗi: `400`, `409 EMAIL_TAKEN`, `409 STUDENT_CODE_TAKEN`, `429`.

## `POST /auth/login` 🔓 (cổng CLIENT)
Rate limit 10/15 phút/IP.
```json
{ "email": "na@stu.edu.vn", "password": "Passw0rd!" }
```
```json
// 200
{ "data": { "user": { "id": "u-1", "fullName": "Lê Thanh Nhàn", "email": "na@stu.edu.vn", "role": "STUDENT", "studentCode": "DH52301350" } } }
```
Lỗi: `400`, `401 INVALID_CREDENTIALS`, `403 ACCOUNT_LOCKED`, `403 WRONG_PORTAL` (TEACHER/ADMIN dùng cổng này), `429`.

## `POST /auth/admin/login` 🔓 (cổng ADMIN)
Request/response giống `/auth/login`; `data.user.role ∈ {TEACHER, ADMIN}`.
Lỗi: như trên; `403 WRONG_PORTAL` khi `role = STUDENT`.

## `POST /auth/logout` 🔒
`204` + xóa cookie (idempotent: không đăng nhập vẫn `204`).

## `GET /auth/me` 🔒
```json
// 200
{ "data": { "user": { "id": "u-1", "fullName": "…", "email": "…", "role": "STUDENT", "studentCode": "DH52301350" } } }
```
Lỗi: `401 UNAUTHENTICATED`. FE gọi khi khởi động để dựng `AuthContext`.

## Ghi chú triển khai
- Email lowercase + trim trước khi lưu/so khớp.
- Phản hồi lỗi đăng nhập **không** phân biệt "email không tồn tại" và "sai mật khẩu".
- Mock FE: dùng tài khoản trong [[database-seed-data]]; mock phải trả đúng `403 WRONG_PORTAL` khi dùng sai cổng.
