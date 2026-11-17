---
id: PROGRESS
title: PROGRESS — Nhật ký làm việc & bảng tiến độ phase
type: log
status: living
tags: [progress, log, memory]
related: [agent-rules, FILE_MAPPING, FILE_MAPPING_ADMIN, plan-00-overview, OPEN_QUESTIONS]
source: "Nhật ký"
updated: 2026-11-15
---
# PROGRESS

> Agent/Dev: thêm mục **trên cùng** của "Nhật ký" sau mỗi tác vụ ([[agent-rules]] §3). Không xóa mục cũ.

## Bảng tiến độ theo phase
| Phase | Nội dung | A UI+Mock | B Review | C Wire | D Backend | E Test | Ghi chú |
|---|---|---|---|---|---|---|---|
| P00 | [[plan-phase-00-foundation]] | — | — | — | — | ✅ | làm lại theo ADR-016 |
| P01 | [[plan-phase-01-auth]] | ✅ | ✅ | ✅ | ✅ | ✅ | Hoàn tất — test DB thực tế thành công |
| P02 | [[plan-phase-02-course-catalog]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P03 | [[plan-phase-03-learning-progress]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P04 | [[plan-phase-04-admin-content]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P05 | [[plan-phase-05-exam-student]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P06 | [[plan-phase-06-exam-admin-stats]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P07 | [[plan-phase-07-rag-service]] | — | — | — | ⬜ | ⬜ | không có UI |
| P08 | [[plan-phase-08-ai-chat-and-docs]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P09 | [[plan-phase-09-admin-dashboard-users]] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| P10 | [[plan-phase-10-hardening-release]] | — | — | — | — | ⬜ | |

Ký hiệu: ⬜ chưa · 🟡 đang làm · ✅ xong · ⛔ bị chặn (ghi lý do ở cột Ghi chú).

## Quyết định/nợ kỹ thuật đang mở
Xem [[OPEN_QUESTIONS]]. Ghi nợ kỹ thuật mới theo dạng `TD-xx: <mô tả> — <ảnh hưởng> — <đề xuất>`.

## Nhật ký (mới nhất trên cùng)

### 2026-11-17 · P01 · Tech Lead — Đóng Phase 01 Auth (test DB thực tế thành công)
- **Tác vụ**: Đóng toàn bộ Phase 01 (A→B→C→D→E).
- **Đã làm**: Test thực tế với PostgreSQL: đăng ký, đăng nhập (CLIENT & ADMIN), đăng xuất, GET /auth/me; xác nhận đủ nhánh lỗi INVALID_CREDENTIALS, ACCOUNT_LOCKED, WRONG_PORTAL, EMAIL_TAKEN, STUDENT_CODE_TAKEN; cookie httpOnly devlearn_token đặt/xóa đúng; rate limit hoạt động.
- **Lệch/Quyết định**: Không.
- **Tiếp theo**: Phase 02 — Course Catalog (UI + Mock → Wire → Backend).

### 2026-11-17 · P01 · Giai đoạn A hoàn thành (UI + Mock Auth)
- **Tác vụ**: Sửa lỗi hiển thị Tailwind CSS, hoàn thiện ClientShell, Navbar, AdminShell, StaffGuard layout cho admin/(panel).
- **Đã làm**:
  - Khắc phục `@theme` Tailwind CSS v4 trong `globals.css`: bổ sung tokens và utility fallbacks cho các màu `client-primary`, `admin-navy`, `admin-primary`, v.v. Khớp 100% thiết kế giao diện (chia đôi màn hình client `/login`, full navy cho admin `/admin/login`).
  - Tạo `Navbar` và `ClientShell` (`(client)/layout.tsx`) tích hợp `UserMenu`, tìm kiếm, trạng thái phiên đăng nhập.
  - Tạo `AdminShell` (Sidebar navy + Topbar) và layout `app/admin/(panel)/layout.tsx` bảo vệ bởi `StaffGuard`.
  - Hoàn thành đầy đủ các task P01-A1 đến P01-A6 trong `plan-phase-01-auth.md`.
- **Lệch/Quyết định**: Không
- **Tiếp theo**: Giai đoạn B (Review gate C01, A00) & Giai đoạn C (Wire).

### 2026-11-16 · P00 · Agent: Kilo — Design tokens + spikes
- **Tác vụ**: P00-FE9..FE14 design tokens & _design; spikes P00-BE20/BE21
- **Đã làm**: thêm @theme client/admin colors; trang _design cơ bản. Spikes bỏ qua vì chưa có API key Cloudinary/Gemini (Q-09/Q-10 vẫn mở).
- **Lệch/Quyết định**: không
- **Tiếp theo**: Phase 01

### 2026-11-16 · P00 · Agent: Kilo — Nhóm B Frontend setup
- **Tác vụ**: P00-FE1..FE14 setup frontend
- **Đã làm**: create-next-app (TS/Tailwind/src/App Router), cài zod/vitest/jsdom/testing-library, tsconfig strict, vitest.config.ts, .env.local/.env.example, sync-types.sh copy types, sample test pass.
- **Types**: sync-types --check ✅
- **Kiểm tra**: typecheck ✅ · test ✅
- **Lệch/Quyết định**: không
- **Tiếp theo**: Review gate (spikes Cloudinary/Gemini) & design tokens

### 2026-11-16 · P00 · Agent: Kilo — A2 migration init
- **Tác vụ**: P00-BE9/B10 migration init (sau quyết định Q-15 Phương án B)
- **Đã làm**: xóa prisma.config.ts, xóa src/generated, viết schema.prisma theo KB (enum multiline), chạy `npx prisma migrate dev --name init` thành công — DB devlearn tạo, migration 20261116155447_init applied, Prisma Client generated. Seed chưa có (P00-BE11 sẽ tạo).
- **Lệch/Quyết định**: seed.ts chưa tồn tại (dự kiến).
- **Tiếp theo**: A3 types + A4 Express frame.

### 2026-11-16 · P00 · Agent: Kilo — A2 Prisma init
- **Tác vụ**: P00-BE8 npx prisma init
- **Đã làm**: sinh prisma/schema.prisma + prisma.config.ts. Phát hiện Q-15: generator `prisma-client` (output ../src/generated/prisma) và prisma.config.ts (Prisma 6.19).
- **Lệch/Quyết định**: DỪNG theo P00-BE8/Q-15. Chưa ghép schema. Cần người dùng quyết định cách xử lý (ghim cú pháp Prisma 6 classic vs nâng cấp).
- **Tiếp theo**: chờ chỉ thị người dùng

### 2026-11-16 · P00 · Agent: Kilo — Nhóm A A1 khung backend
- **Tác vụ**: P00-BE1..BE7 khung backend (package.json, tsconfig, eslint, prettier, .env, env.ts)
- **Đã làm**: backend/package.json (scripts), tsconfig strict, eslint.config.js, .prettierrc, .env/.env.test/.env.example, src/config/env.ts (zod fail-fast); npm install runtime+dev; approve install scripts prisma/esbuild.
- **File**: backend/package.json (+), backend/tsconfig.json (+), backend/eslint.config.js (+), backend/.prettierrc (+), backend/.env* (+), backend/src/config/env.ts (+)
- **Types**: không đụng types
- **Kiểm tra**: npm install ✅ (0 vuln runtime, 10 vuln dev)
- **Lệch/Quyết định**: không
- **Tiếp theo**: A2 Prisma (npx prisma init) — cần xin phép chạy lệnh

### 2026-11-15 · KB · Agent: Claude (System Architect) — ĐƠN GIẢN HÓA CÔNG CỤ (ADR-016)
- **Tác vụ**: Viết lại KB theo cấu trúc mới sau khi chủ dự án thử Phase 00: chỉ `npm`, 3 thư mục độc lập `backend/` `frontend/` `rag-service/` + `docs/`; bỏ pnpm, monorepo, `packages/contracts`, Docker.
- **Đã làm**: ADR-016 mới; ADR-014 → `superseded`; viết lại `architecture-repo-structure`, `architecture-deployment-env`, `plan-phase-00-foundation`, `agent-rules` (mục 2b), `workflow-ui-mock-wire-backend`, `definition-of-done`, `testing-strategy`, `git-workflow`, `FILE_MAPPING` ×2; thêm `tools/sync-types.sh`; vá đường dẫn/lệnh ở các file còn lại.
- **Types**: nguồn `backend/src/types/` → `./sync-types.sh` → bản copy `frontend/src/types/` (luật S1–S8 ở [[agent-rules]]).
- **Lệch/Quyết định**: thêm Q-14 (PostgreSQL local hay đám mây), Q-15 (phiên bản Prisma). Backend import tương đối (không alias); hash mật khẩu dùng `bcryptjs`; `frontend/.env.local` thay `frontend/.env`; bỏ husky/CI khỏi Phase 00 (tùy chọn Phase 10).
- **Tiếp theo**: làm lại Phase 00 theo [[plan-phase-00-foundation]] (Bước 0 → Nhóm A → Nhóm B).

### 2026-11-15 · KB · Agent: Claude (System Architect)
- **Tác vụ**: Khởi tạo Knowledge Base DevLearn từ Đồ án chuyên ngành (Chương 1–3), 19 màn thiết kế UI và 10 sơ đồ drawio.
- **Đã làm**: tạo 7 thư mục KB; 13 concept; kiến trúc, ERD + Prisma schema, hợp đồng API (60 endpoint công khai + 5 nội bộ + 1 callback); 15 ADR; luật code/agent; kế hoạch 11 phase.
- **Lệch/Quyết định**: ghi ở [[delta-vs-thesis]] (mâu thuẫn trong Đồ án, bổ sung schema, giả định, khoảng trống UI). Các câu hỏi cần người phụ trách xác nhận: [[OPEN_QUESTIONS]].
- **Tiếp theo**: P00 Foundation — bắt đầu bằng spike Cloudinary PDF + Gemini model name.
