---
id: concept-auth
title: Xác thực (Auth) — đăng ký, đăng nhập, phiên
type: concept
status: stable
tags: [auth, jwt, cookie, f1]
related: [api-auth, concept-roles-permissions, adr-008-jwt-httponly-cookie, adr-009-separate-admin-login-portal, plan-phase-01-auth]
source: "Đồ án §2.3.1.1, UC01, UC02; UI CLIENT 01, ADMIN 00"
updated: 2026-11-15
---
# Xác thực (Auth)

## Luồng
| Luồng | Mô tả | Endpoint |
|---|---|---|
| Đăng ký (UC01) | SV tự tạo tài khoản `STUDENT`; **tự đăng nhập** sau khi tạo | `POST /auth/register` |
| Đăng nhập CLIENT | Chỉ chấp nhận `STUDENT`. TEACHER/ADMIN → `403 WRONG_PORTAL` | `POST /auth/login` |
| Đăng nhập ADMIN | Chỉ `TEACHER`/`ADMIN`. STUDENT → `403 WRONG_PORTAL` | `POST /auth/admin/login` |
| Đăng xuất | Xóa cookie | `POST /auth/logout` |
| Lấy phiên hiện tại | Dùng cho Context/guard | `GET /auth/me` |

Tài khoản `TEACHER`/`ADMIN` **do Admin tạo** ở màn Người dùng ([[concept-admin-users-dashboard]]). Không có đăng ký công khai cho nhân viên.

## Các bước đăng nhập (Đồ án §2.3.1.1)
1. Nhận `email` + `password` → chuẩn hóa `email` (trim, lowercase).
2. Tìm user; so khớp `bcrypt.compare`. Sai → `401 INVALID_CREDENTIALS` (thông điệp chung, **không** tiết lộ email có tồn tại).
3. `status = LOCKED` → `403 ACCOUNT_LOCKED`.
4. Kiểm tra cổng (portal) ↔ vai trò → `403 WRONG_PORTAL`.
5. Ký JWT `{ sub, role }`, đặt cookie httpOnly ([[adr-008-jwt-httponly-cookie]]).
6. Trả `{ user }`; FE điều hướng: STUDENT → `/` (hoặc `?next=`), TEACHER/ADMIN → `/admin`.

## JWT & cookie
| Thuộc tính | Giá trị |
|---|---|
| Payload | `{ sub: userId, role, iat, exp }` |
| Hết hạn | `JWT_EXPIRES_IN` (mặc định `7d`) |
| Cookie | `devlearn_token`; `HttpOnly; SameSite=Lax; Path=/; Secure` (prod) |
| Thuật toán | HS256, secret `JWT_SECRET` (≥ 32 ký tự) |
| Fallback test | Middleware cũng nhận `Authorization: Bearer <token>` (Postman/Swagger/test) |

## Middleware `authenticate`
1. Lấy token (cookie → header). Không có → `401 UNAUTHENTICATED`.
2. Verify chữ ký + hạn. Lỗi → `401`.
3. **Query DB** `users` theo `sub` (PK) → nếu không tồn tại hoặc `LOCKED` → `401/403`. (Khóa tài khoản có hiệu lực **ngay**, không chờ token hết hạn.)
4. Gắn `req.user = { id, role }`.

## Mật khẩu
- Tối thiểu 8 ký tự, có chữ và số. Băm `bcrypt` cost 12. Không bao giờ trả `password_hash`.
- Đăng ký yêu cầu: `fullName`, `studentCode` (4–20 ký tự, duy nhất), `email`, `password`, `confirmPassword` (chỉ FE kiểm). Xem giả định ở [[delta-vs-thesis]] (mục U-02).

## Phía FE
- `AuthContext` giữ `{ user, status: 'loading'|'authenticated'|'anonymous' }`, nạp bằng `GET /auth/me` khi app khởi động.
- `401` ở bất kỳ API nào → xóa context, chuyển `/login?next=<đường dẫn hiện tại>` (admin: `/admin/login`).
- Guard route: `StudentGuard` (CLIENT), `StaffGuard` (ADMIN), `AdminOnlyGuard` (trang Người dùng). Xem [[architecture-frontend]].

## Bảo vệ lạm dụng
- Rate limit đăng nhập: 10 lần/15 phút/IP (`429 RATE_LIMITED`). Đăng ký: 5 lần/giờ/IP.
- CORS chỉ cho origin FE (`CORS_ORIGINS`), `credentials: true`.
