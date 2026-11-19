---
id: coding-standards-backend
title: Luật code Backend (Express, Prisma, zod)
type: rule
status: stable
tags: [rules, backend, express, prisma]
related: [coding-standards, architecture-backend-layers, error-handling-conventions, api-contracts, testing-strategy]
source: "Đồ án §2.2.5.2"
updated: 2026-11-15
---
# Luật Backend

## Phân lớp (bắt buộc)
- Route → Controller → Service → Repository ([[architecture-backend-layers]]).
- **Chỉ `*.repository.ts` import Prisma** (ESLint `no-restricted-imports` cho `@prisma/client` và `lib/prisma` ở mọi nơi khác).
- Controller **không** chứa nghiệp vụ, **không** `try/catch` thủ công (Express 5 bắt lỗi async; nếu dùng Express 4 thì bọc `asyncHandler`).
- Service không biết `req/res`; nhận tham số thuần + `actor: { id, role }`.
- Import **tương đối** (không alias). `src/types/` **tự đủ** (chỉ `zod` + chính nó) vì được copy sang frontend ([[adr-016-manual-type-sync]]); mọi kiểu **chỉ dùng ở backend** (Express request, Prisma) đặt ở `src/lib/` hoặc cạnh module, **không** đặt trong `src/types/`.
- Băm mật khẩu bằng `bcryptjs` (thuật toán bcrypt, cost 12).

## Validate & DTO
- Mọi route dùng `validate({ params, query, body })` với zod schema từ `backend/src/types/dto/` (request) — thiếu validate = lỗi.
- Response đi qua **mapper** trả đúng DTO ([[api-contracts]]); cấm trả thẳng entity Prisma. `Decimal` ⇒ `number` (2 số lẻ); `Date` ⇒ ISO string.
- Chuẩn hóa: `email.trim().toLowerCase()`; chuỗi `trim()`.

## Lỗi
- Nghiệp vụ ném `AppError(code, httpStatus, message, details?)` với `code` thuộc danh sách ở [[api-contracts]]. **Cấm** `throw new Error('...')` cho lỗi nghiệp vụ.
- `errorHandler` là nơi duy nhất ghi `res.status().json({error})`. Lỗi không lường trước ⇒ `500 INTERNAL_ERROR`, log đầy đủ, **không** lộ stack/SQL ra client.
- Prisma `P2002` (unique) ⇒ ánh xạ sang `409` tương ứng ở service/repo; `P2025` ⇒ `404`.

## Phân quyền
- `authenticate` → `requireRole` ở route; **kiểm sở hữu ở service** bằng `assertCourseOwner` (Admin được) hoặc `assertCourseOwnerStrict` (exam-stats) — [[adr-013-exam-stats-owner-only]].
- SV truy cập tài nguyên không thuộc mình ⇒ `404` (không lộ sự tồn tại).

## Cơ sở dữ liệu
- Tên cột `snake_case` (`@map`); migration bằng `prisma migrate dev`, **không sửa tay** migration đã merge; ràng buộc CHECK thêm bằng migration SQL.
- Truy vấn danh sách luôn **phân trang** (`take` ≤ 100) + `orderBy` tường minh; tránh N+1 (dùng `include/select`/`groupBy`).
- Transaction cho thao tác nhiều bước ([[concept-exam-scoring-attempts]]); repository nhận `tx` tùy chọn.
- `select` tường minh khi có cột nhạy cảm (`passwordHash`, `isCorrect` đề thi).

## Dịch vụ ngoài
- RAG: chỉ qua `lib/rag-client.ts` (timeout, `X-Internal-Key`, ánh xạ lỗi). Cloudinary: chỉ qua `lib/cloudinary.ts`.
- `async/await`, không API đồng bộ chặn (`fs.readFileSync`…). Upload dùng stream/đĩa tạm, xóa file tạm trong `finally`.

## Cấu hình & log
- `config/env.ts` (zod) là nơi duy nhất đọc `process.env`.
- `pino` JSON log, có `requestId`; không log body chứa mật khẩu/câu hỏi AI ở mức INFO.

## Rate limit
`/auth/*` (đăng nhập 10/15 phút/IP, đăng ký 5/giờ/IP); `/ai/…/ask` 10/phút/người dùng. Lưu trong bộ nhớ (đủ phạm vi); ghi chú nếu chạy nhiều instance.

## Test
Agent không viết test và không chạy test; Tech Lead tự kiểm tra bằng checklist test tay ở [[testing-strategy]] (Postman/`curl` + giao diện). Chỉ viết test khi logic cực kỳ phức tạp và được Tech Lead đồng ý.
