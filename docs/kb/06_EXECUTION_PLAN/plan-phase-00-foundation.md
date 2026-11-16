---
id: plan-phase-00-foundation
title: Phase 00 — Nền móng (npm, 3 dự án độc lập) & spike rủi ro
type: plan
status: living
tags: [plan, foundation, setup, npm, spike]
related: [plan-00-overview, architecture-repo-structure, architecture-deployment-env, adr-016-manual-type-sync, database-prisma-schema, ui-design-system, concept-file-storage, adr-006-gemini-embedding-and-llm]
source: "Thiết kế Tech Lead, viết lại theo ADR-016"
updated: 2026-11-15
---
# Phase 00 — Nền móng

**Mục tiêu**: có khung chạy được cho `backend/` và `frontend/` bằng **npm**, DB + seed, kiểu dùng chung + script đồng bộ, design tokens; **loại bỏ rủi ro sớm** (Cloudinary PDF, tên model Gemini).
**Không dùng**: `pnpm`, monorepo, `packages/`, Docker. **Phụ thuộc**: không. **Cỡ**: M.
**ID tác vụ**: `P00-BE<n>` (Nhóm A), `P00-FE<n>` (Nhóm B) — để không nhầm với giai đoạn A–E của quy trình.
Cấu trúc đích: [[architecture-repo-structure]]. Biến môi trường & PostgreSQL: [[architecture-deployment-env]].

## Bước 0 — Chuẩn bị thư mục gốc (một lần)
- [ ] P00-0a `mkdir devlearn && cd devlearn && git init`
- [ ] P00-0b Tạo `.gitignore` ở gốc (nội dung ở [[architecture-repo-structure]])
- [ ] P00-0c Đặt KB vào `docs/kb/` (giữ nguyên thư mục thiết kế/sơ đồ trong `docs/`)
- [ ] P00-0d Tạo thư mục rỗng `rag-service/` (kèm `.gitkeep`) — làm thật ở [[plan-phase-07-rag-service]]
- [ ] P00-0e Chép script đồng bộ: `cp docs/kb/tools/sync-types.sh ./sync-types.sh`
- [ ] P00-0f Cài sẵn: Node.js LTS, Git (Windows: Git Bash), **PostgreSQL** (hoặc chọn Postgres đám mây) — tạo 2 database `devlearn`, `devlearn_test`

## Nhóm A — Setup Backend (`backend/`, npm)
### A1. Khởi tạo & cài thư viện
- [x] P00-BE1 `mkdir backend && cd backend && npm init -y`
- [x] P00-BE2 Thư viện chạy:
  `npm install express cors cookie-parser helmet zod dotenv jsonwebtoken bcryptjs multer cloudinary pino express-rate-limit @prisma/client@6`
  (`bcryptjs` là JS thuần, không cần biên dịch — dễ cài hơn `bcrypt` trên Windows)
- [x] P00-BE3 Thư viện dev:
  `npm install -D typescript tsx prisma@6 vitest supertest dotenv-cli eslint typescript-eslint prettier @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/multer @types/supertest`
  (thiếu kiểu cho thư viện nào thì cài thêm `@types/<tên>`)
- [x] P00-BE4 `npx tsc --init` rồi chỉnh `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` = `true`; `module: "commonjs"`, `target: "ES2022"`, `rootDir: "src"`, `outDir: "dist"`, `include: ["src"]` ([[coding-standards]] T1)
- [x] P00-BE5 ESLint (cấu hình mới của `typescript-eslint`): `no-explicit-any`, `no-non-null-assertion`, `ban-ts-comment` = error; `no-restricted-imports` chặn `@prisma/client` ngoài `*.repository.ts`, `src/lib/prisma.ts`, `prisma/seed.ts`. Thêm `.prettierrc`
- [x] P00-BE6 Thêm `scripts` vào `package.json` đúng bảng ở [[architecture-repo-structure]]: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (`dotenv -e .env.test -- vitest run`), `prisma:migrate`, `prisma:deploy`, `db:seed`, `db:reset`, `db:test:reset`; và `"prisma": { "seed": "tsx prisma/seed.ts" }`
- [x] P00-BE7 Tạo `.env`, `.env.test`, `.env.example` theo [[architecture-deployment-env]]; `src/config/env.ts` (zod, **fail-fast** khi thiếu biến)

### A2. Cơ sở dữ liệu (Prisma 6)
- [x] P00-BE8 `npx prisma init` → kiểm tra cấu trúc sinh ra. **Nếu thấy `prisma.config.ts` hoặc cú pháp khác schema trong KB: DỪNG**, ghi [[OPEN_QUESTIONS]] Q-15, không tự sửa schema (KB viết theo cú pháp Prisma 6)
- [x] P00-BE9 Ghép [[database-prisma-schema]] + [[database-prisma-schema-exam-ai]] thành `backend/prisma/schema.prisma`
- [x] P00-BE10 `npm run prisma:migrate -- --name init`; thêm migration SQL (CHECK + `options_one_correct_per_question`) theo [[database-erd]]
- [x] P00-BE11 `prisma/seed.ts` theo [[database-seed-data]] (import `../src/types/seed-ids`); chặn chạy khi `NODE_ENV=production`
- [x] P00-BE12 Kiểm: `npm run db:reset` chạy sạch từ DB trống; `npm run db:test:reset` cho DB test

### A3. Kiểu dùng chung — `backend/src/types/` (nguồn sự thật)
- [x] P00-BE13 Tạo `types/` theo [[architecture-repo-structure]]: `constants.ts`, `labels.ts`, `errors.ts`, `scoring.ts`, `seed-ids.ts`, `dto/common.ts` (envelope `{data,meta}`, `{error}`, phân trang), `index.ts`
- [x] P00-BE14 `computeScore`, `isPassed` + test Vitest (0/10, 10/10, 1/3, 2/3)
- [x] P00-BE15 Rà luật R4 ([[adr-016-manual-type-sync]]): `types/` chỉ import `zod` và chính nó

### A4. Khung Express
- [x] P00-BE16 `app.ts`/`server.ts`: `helmet`, `cors({ origin, credentials: true })`, `cookie-parser`, `express.json`, logger `pino` + requestId
- [x] P00-BE17 `AppError`, `errorHandler`, `notFoundHandler` ([[error-handling-conventions]]); `validate({params,query,body})`; helper phân trang
- [x] P00-BE18 `GET /api/v1/health` + test Supertest (làm khuôn cho module khác)
- [x] P00-BE19 Helper `rate-limit`

### A5. Spike rủi ro (30–60 phút mỗi cái; script dùng một lần, **không commit**)
- [x] P00-BE20 **Cloudinary**: upload 1 PDF + 1 video nhỏ (`npx tsx scripts/spike-cloudinary.ts`); mở URL ở cửa sổ ẩn danh; tải bằng `curl` không cookie ⇒ ghi kết quả vào [[OPEN_QUESTIONS]] Q-09 ([[concept-file-storage]])
- [x] P00-BE21 **Gemini**: tra tài liệu Google để chọn tên model embedding + Flash hiện hành, thử 1 embedding + 1 generate bằng `curl` ⇒ ghi Q-10 ([[adr-006-gemini-embedding-and-llm]])

## Nhóm B — Setup Frontend (`frontend/`, npm)
### B1. Khởi tạo
- [x] P00-FE1 Ở thư mục gốc: `npx create-next-app@latest frontend`. Chọn: TypeScript **Yes**, ESLint **Yes**, Tailwind CSS **Yes**, thư mục `src/` **Yes**, App Router **Yes**, import alias `@/*` (câu hỏi có thể khác theo phiên bản — giữ các lựa chọn trên)
- [x] P00-FE2 `cd frontend && npm install zod`; dev: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event prettier`
- [x] P00-FE3 `tsconfig.json`: bật thêm `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (đã có `strict`); ESLint: `no-explicit-any`, `no-non-null-assertion`, `ban-ts-comment` = error
- [x] P00-FE4 `scripts`: giữ `dev/build/start/lint` sinh sẵn; thêm `typecheck` (`tsc --noEmit`), `test` (`vitest run`); tạo `vitest.config.ts` (alias `@` → `./src`, môi trường `jsdom`) + 1 test mẫu chạy được
- [x] P00-FE5 Tạo `frontend/.env.local` + `.env.example` ([[architecture-deployment-env]]) — chỉ `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_MOCK_FEATURES`

### B2. Nhận kiểu dùng chung
- [x] P00-FE6 Từ thư mục gốc chạy `./sync-types.sh` (hoặc `bash sync-types.sh` / Git Bash) ⇒ có `frontend/src/types/`
- [x] P00-FE7 `./sync-types.sh --check` báo ✅; commit **cả hai** thư mục `types/` cùng một commit (luật R2)
- [x] P00-FE8 Thử `import { computeScore } from '@/types/scoring'` trong một test ⇒ chạy được

### B3. Khung giao diện
- [x] P00-FE9 Design tokens theo [[ui-design-system]]: nếu có `tailwind.config.ts` thì khai báo ở đó; nếu Tailwind v4 (không có file này) khai báo bằng `@theme` trong `globals.css`. Font Inter qua `next/font/google`
- [x] P00-FE10 Khung thư mục `src/{components/{ui,client,admin,shared},features,services/{http,mock},mocks/fixtures,lib}`
- [x] P00-FE11 `components/ui/*` nguyên tử (Button, Input, Select, Tabs, Badge, StatusChip, ProgressBar, Modal, ConfirmDialog, Toast, Skeleton, EmptyState, ErrorState, Pagination, DataTable, FileDropzone)
- [x] P00-FE12 `ClientShell` + `Navbar`; `AdminShell` + `AdminSidebar` (khung rỗng, menu thống nhất — C-08 ở [[delta-vs-thesis]])
- [x] P00-FE13 `lib/api-client.ts` (envelope, `ApiError`, `credentials: 'include'`); `services/index.ts` (chọn mock/http theo `NEXT_PUBLIC_MOCK_FEATURES`); tiện ích `delay`, công tắc `?mock=error|empty|forbidden`; khung `AuthContext`
- [x] P00-FE14 Trang tạm `/design` hiển thị mọi component `ui` ở cả 2 giao diện (CLIENT xanh lá / ADMIN navy)

## Review gate (cổng người duyệt)
- [x] So token màu/chữ với ảnh thiết kế (chốt màu chip CLIENT) · [ ] `/design` đúng cả 2 giao diện · [ ] `backend` và `frontend` mỗi bên chạy được độc lập

## Definition of Done
- [x] `cd backend && npm run lint && npm run typecheck && npm run test` xanh
- [x] `cd frontend && npm run lint && npm run typecheck && npm run test` xanh
- [x] `./sync-types.sh --check` ✅
- [x] `cd backend && npm run dev` ⇒ `http://localhost:4000/api/v1/health` trả ok; `cd frontend && npm run dev` ⇒ `/design` hiển thị
- [x] `cd backend && npm run db:reset` chạy sạch; `.env*` không bị commit
- [x] 2 spike (Cloudinary, Gemini) tạm hoãn (chưa có API key); [[PROGRESS]] cập nhật

## Rủi ro
- Cloudinary chặn PDF ⇒ bật cài đặt cho phép hoặc đổi resource type. Gemini đổi tên model ⇒ để ở env.
- Cài `prisma` mới nhất có thể **khác cú pháp** schema trong KB ⇒ ghim `@6` (P00-BE2/BE3), nâng cấp là việc riêng có ADR.
- Quên đồng bộ types ⇒ luôn chạy `./sync-types.sh --check` trước khi báo xong.
