---
id: plan-phase-10-hardening-release
title: Phase 10 — Hoàn thiện, bảo mật & chuẩn bị demo
type: plan
status: living
tags: [plan, hardening, release, security, demo]
related: [plan-00-overview, workflow-solo-dev, testing-strategy, definition-of-done, architecture-deployment-env, PROGRESS]
source: "Thiết kế Tech Lead; cập nhật theo ADR-017"
updated: 2026-11-15
---
# Phase 10 — Hoàn thiện & demo

**Phụ thuộc**: P09. Không thêm tính năng mới. **Tech Lead** tự rà theo checklist; **Agent** chỉ sửa lỗi/đoạn code mà Tech Lead chỉ ra (báo bằng dòng `✅` như thường lệ).

## 1 — Rà soát toàn hệ thống (Tech Lead)
- [ ] P10-1 Chạy tay 5 luồng vàng: (1) SV đăng ký → duyệt → đăng ký học → học → hoàn thành; (2) SV thi → xem lại → làm lại → My results; (3) GV soạn khóa + đề → SV thi → GV xem thống kê; (4) GV tải PDF → SV hỏi AI có nguồn; (5) Admin khóa người dùng ⇒ bị chặn
- [ ] P10-2 Rà **mọi trang**: có `loading/empty/error/forbidden`; thông điệp lỗi tiếng Việt nhất quán ([[error-handling-conventions]])
- [ ] P10-3 Responsive (điện thoại / máy tính bảng / máy tính) cho 19 màn; bàn phím + nhãn trợ năng cơ bản cho form, tabs, accordion, dialog
- [ ] P10-4 Chạy `lint` + `typecheck` cả hai dự án, `./sync-types.sh --check`, `kb_lint.py` ⇒ sạch ([[testing-strategy]])

## 2 — Bảo mật (checklist)
- [ ] P10-5 Mọi route có `authenticate`/`requireRole` đúng ma trận [[concept-roles-permissions]]
- [ ] P10-6 Không endpoint nào trả `passwordHash`, `isCorrect` (đề thi), `filePublicId`, stack trace
- [ ] P10-7 Cookie `HttpOnly/Secure/SameSite`; CORS origin cụ thể; helmet; kiểm `Origin` ở request đổi dữ liệu
- [ ] P10-8 `/internal/*` chặn từ Internet; rag-service chỉ nghe `127.0.0.1`/mạng nội bộ; `INTERNAL_KEY` mạnh
- [ ] P10-9 Upload: giới hạn cỡ + magic bytes; file tạm được dọn
- [ ] P10-10 `npm audit` ở `backend/`, `frontend/`; không có secret trong repo; rate limit (login, register, ask) hoạt động

## 3 — Hiệu năng & dữ liệu
- [ ] P10-11 `EXPLAIN` các truy vấn: danh mục, thống kê, dashboard; thêm index nếu cần
- [ ] P10-12 Sao lưu: `pg_dump` + thư mục `rag-service/data/chroma/` (script + cách khôi phục)

## 4 — Phát hành & demo
- [ ] P10-13 Cấu hình triển khai: HTTPS, biến môi trường thật, `NODE_ENV=production`; backend `npm run build && npm run start`, `npm run prisma:deploy`; frontend `npm run build && npm run start`; rag-service chỉ nghe nội bộ
- [ ] P10-14 Dữ liệu demo (seed demo) + PDF mẫu đã nạp sẵn; tài khoản demo ghi ở nơi riêng (không commit mật khẩu thật)
- [ ] P10-15 Kịch bản demo 10 phút: SV (đăng ký → học → thi → hỏi AI) + GV (soạn → thống kê) + Admin (người dùng, dashboard)
- [ ] P10-16 Cập nhật README, [[00_INDEX]], đóng [[OPEN_QUESTIONS]] đã có câu trả lời; đánh dấu **M4**, tag `v1.0.0`, tổng kết trong [[PROGRESS]]

## 5 — Tùy chọn (chỉ khi thật sự cần, không bắt buộc)
- [ ] OPT-1 Docker hóa để demo trên máy khác ([[adr-016-manual-type-sync]])
- [ ] OPT-2 CI (GitHub Actions) chạy lint/typecheck; E2E Playwright; Lighthouse

## Definition of Done
Toàn bộ mục 1–4 `[x]`; [[FILE_MAPPING]] và [[FILE_MAPPING_ADMIN]] đều `✅ Đã test`.
