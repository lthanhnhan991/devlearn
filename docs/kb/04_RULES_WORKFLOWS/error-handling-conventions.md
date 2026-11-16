---
id: error-handling-conventions
title: Quy ước xử lý lỗi (BE ↔ FE)
type: rule
status: stable
tags: [errors, ux, api]
related: [api-contracts, coding-standards-backend, coding-standards-frontend, architecture-frontend, concept-rag-query]
source: "Đồ án UC ngoại lệ; Hình 3-7"
updated: 2026-11-15
---
# Xử lý lỗi

## Backend
- Định dạng duy nhất: `{ "error": { "code", "message", "details"? } }` ([[api-contracts]] §1–2). `message` tiếng Việt, **an toàn để hiển thị**.
- `AppError` cho lỗi nghiệp vụ; `ZodError` ⇒ `400 VALIDATION_ERROR` với `details[{path,message}]`; Prisma `P2002/P2025` ⇒ `409/404`; còn lại ⇒ `500 INTERNAL_ERROR` (log đầy đủ + `requestId`, **không** lộ nội bộ).
- Đăng nhập: thông điệp chung cho sai email/mật khẩu.

## Frontend — bảng ánh xạ
| Mã | Hành vi UI |
|---|---|
| `401 UNAUTHENTICATED` | xóa AuthContext → `/login?next=` (admin: `/admin/login`) |
| `403 NOT_ENROLLED` | chuyển trang chi tiết khóa + toast "Hãy đăng ký khóa học" |
| `403 EXAM_NOT_OPEN` | thông báo "Bài kiểm tra hiện không mở" |
| `403 FORBIDDEN` (admin) | `ErrorState` "Bạn không có quyền với nội dung này" |
| `403 WRONG_PORTAL`, `ACCOUNT_LOCKED` | lỗi inline dưới form đăng nhập |
| `404` | trang/`ErrorState` "Không tìm thấy" |
| `409 *` | toast/inline theo `message` (ví dụ `EMAIL_TAKEN` ở trường email) |
| `400 VALIDATION_ERROR` | gắn `details[].path` vào trường form tương ứng |
| `413/415` | lỗi tại `FileDropzone` |
| `429` | "Bạn thao tác quá nhanh, thử lại sau" (dùng `Retry-After`) |
| `502/504 AI_*` | bong bóng lỗi trong chat + nút **Thử lại** |
| `5xx`, mạng đứt | `ErrorState` + **Thử lại**; giữ nguyên dữ liệu đang nhập |

## Nguyên tắc UX
1. Không bao giờ để trang trắng: luôn có `ErrorState` với hành động.
2. Lỗi khi nộp bài thi: **giữ đáp án trên màn hình**, cho thử nộp lại (không mất bài).
3. Lỗi upload: giữ form, hiển thị lý do (cỡ/loại/đứt mạng).
4. Không hiển thị `error.code` thô cho người dùng; chỉ dùng cho logic.
