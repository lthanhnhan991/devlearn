---
id: plan-phase-10-hardening-release
title: Phase 10 — Hardening, E2E & chuẩn bị demo
type: plan
status: living
tags: [plan, hardening, e2e, release, security]
related: [plan-00-overview, testing-strategy, definition-of-done, architecture-deployment-env, coding-standards, PROGRESS]
source: "Thiết kế Tech Lead"
updated: 2026-11-15
---
# Phase 10 — Hardening & Release

**Phụ thuộc**: P09. **Cỡ**: M. Không thêm tính năng mới.

## 1 — E2E & chất lượng
- [ ] P10-1 Playwright 5 luồng vàng ([[testing-strategy]]) chạy xanh trên máy sạch (clone repo, làm theo README, `cd backend && npm run db:seed`)
- [ ] P10-2 Smoke thật Gemini (1 lần) + ghi kết quả; các lần chạy test/E2E còn lại dùng RAG giả
- [ ] P10-3 Quét `any`/`@ts-ignore`/hex/inline style bằng script/ESLint ⇒ 0 vi phạm
- [ ] P10-4 Coverage BE ≥ 80% service; contract test mọi fixture xanh

## 2 — Bảo mật (checklist)
- [ ] P10-5 Mọi route có `authenticate`/`requireRole` đúng ma trận [[concept-roles-permissions]] (bảng test tự động duyệt toàn bộ route)
- [ ] P10-6 Không endpoint nào trả `passwordHash`, `isCorrect` (đề thi), `filePublicId`, stack trace
- [ ] P10-7 Cookie `HttpOnly/Secure/SameSite`; CORS origin cụ thể; helmet; kiểm `Origin` ở request đổi dữ liệu
- [ ] P10-8 `/internal/*` bị chặn từ Internet (reverse proxy); rag-service chỉ nghe `127.0.0.1`/mạng nội bộ; `INTERNAL_KEY` mạnh
- [ ] P10-9 Upload: giới hạn + magic bytes; file tạm được dọn; không thực thi nội dung
- [ ] P10-10 `npm audit`/`pip-audit`, cập nhật phụ thuộc có lỗ hổng; không secret trong repo (`gitleaks`)
- [ ] P10-11 Rate limit hoạt động (login, register, ask)

## 3 — Hiệu năng & dữ liệu
- [ ] P10-12 `EXPLAIN` các truy vấn: danh mục, thống kê, dashboard; bổ sung index nếu cần
- [ ] P10-13 Ảnh/video/PDF lazy-load; Lighthouse trang chủ & danh mục ≥ 80 (Performance/Accessibility)
- [ ] P10-14 Sao lưu: `pg_dump` + volume `rag_data` (script + hướng dẫn khôi phục)

## 4 — Trải nghiệm
- [ ] P10-15 Rà **mọi trang**: loading/empty/error/forbidden đủ (bảng kiểm theo [[FILE_MAPPING]] + [[FILE_MAPPING_ADMIN]])
- [ ] P10-16 Responsive (360/768/1280) cho 19 màn; bàn phím + nhãn trợ năng cho form, tabs, accordion, dialog
- [ ] P10-17 Thông điệp lỗi tiếng Việt nhất quán ([[error-handling-conventions]])

## 5 — Phát hành & demo
- [ ] P10-18 Cấu hình triển khai: HTTPS, biến môi trường thật, `NODE_ENV=production`; backend `npm run build && npm run start`, `npm run prisma:deploy`; frontend `npm run build && npm run start`; rag-service chỉ nghe nội bộ
- [ ] P10-19 Dữ liệu demo (seed demo) + PDF mẫu đã nạp sẵn; tài khoản demo ghi trong tài liệu nội bộ (không commit mật khẩu thật)
- [ ] P10-20 Kịch bản demo 10 phút: SV (đăng ký → học → thi → hỏi AI) + GV (soạn → thống kê) + Admin (người dùng, dashboard)
- [ ] P10-21 Cập nhật README, [[00_INDEX]], đóng [[OPEN_QUESTIONS]] đã có câu trả lời; `python docs/kb/tools/kb_lint.py` xanh
- [ ] P10-22 Đánh dấu **M4**; tag `v1.0.0`; tổng kết trong [[PROGRESS]]
- [ ] P10-23 *(Tùy chọn)* Docker hóa để demo trên máy khác — chỉ khi hệ thống đã ổn định; không làm nếu không cần ([[adr-016-manual-type-sync]])
- [ ] P10-24 *(Tùy chọn)* CI bằng GitHub Actions chạy bộ lệnh ở [[definition-of-done]]

## Definition of Done
Toàn bộ `[x]`; không còn mục `⛔`; FILE_MAPPING hai bảng đều `✅ Tested`.
