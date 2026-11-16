---
id: adr-008-jwt-httponly-cookie
title: ADR-008 — JWT lưu ở cookie httpOnly
type: decision
status: accepted
tags: [adr, auth, jwt, security]
related: [concept-auth, api-auth, architecture-frontend]
source: "Đồ án §2.2.1 (JWT); chi tiết vận chuyển là quyết định mới"
updated: 2026-11-15
---
# ADR-008 — JWT trong cookie httpOnly (+ Bearer dự phòng)

## Bối cảnh
Đồ án quy định JWT chứa vai trò, không nói cách lưu/chuyển. FE và API là hai origin khác cổng.

## Quyết định
- Backend đặt cookie `devlearn_token` (`HttpOnly; SameSite=Lax; Secure` ở prod). FE gọi `fetch(..., { credentials: 'include' })`; CORS `credentials: true` với origin cụ thể.
- Middleware nhận cookie **hoặc** `Authorization: Bearer` (phục vụ Postman/Swagger/test).
- `authenticate` **luôn tra DB** để thấy `LOCKED` ngay.

## Phương án
| Phương án | Lý do loại |
|---|---|
| Token trong `localStorage` | XSS đọc được token |
| Access + refresh token | Phức tạp, vượt phạm vi |

## Hệ quả
- (+) Chống XSS đánh cắp token; Next middleware có thể đọc cookie để chặn route (tùy chọn).
- (−) Cần CSRF cân nhắc: `SameSite=Lax` + API chỉ nhận JSON (+ kiểm `Origin` ở middleware cho request đổi dữ liệu) ⇒ chấp nhận được cho phạm vi.
- Prod: FE và API phải cùng *site* (cùng domain đăng ký, vd `app.x.edu.vn` / `api.x.edu.vn`).
