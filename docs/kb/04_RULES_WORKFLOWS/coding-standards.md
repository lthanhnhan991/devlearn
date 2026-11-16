---
id: coding-standards
title: Luật code chung (TypeScript strict, không any, Tailwind…)
type: rule
status: stable
tags: [rules, typescript, standards]
related: [adr-016-manual-type-sync, coding-standards-frontend, coding-standards-backend, coding-standards-rag-python, agent-rules, definition-of-done, git-workflow]
source: "Yêu cầu dự án + Đồ án §2.2.2 (mục 8)"
updated: 2026-11-15
---
# Luật code chung

> Vi phạm điều **CẤM** = PR bị từ chối / Agent phải sửa trước khi báo xong.

## TypeScript (frontend + backend + `src/types/`)
| # | Luật |
|---|---|
| T1 | `tsconfig`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`, `"exactOptionalPropertyTypes": true` |
| T2 | **CẤM `any`** (tường minh lẫn ngầm). ESLint: `@typescript-eslint/no-explicit-any: error`, `no-unsafe-*: error`. Dữ liệu không rõ kiểu ⇒ `unknown` + zod `parse` |
| T3 | **CẤM** `// @ts-ignore`, `// @ts-nocheck`, non-null assertion `!`, ép kiểu `as X` để "qua mặt" (chỉ `as const`, hoặc `as` sau khi đã thu hẹp kiểu có chú thích lý do) |
| T4 | Kiểu API lấy từ `src/types/` (FE: `@/types/...`; BE: `../types/...`) bằng `z.infer` — **không** tự khai báo lại interface DTO. **Chỉ sửa ở `backend/src/types/`**, rồi `./sync-types.sh`; cấm sửa `frontend/src/types/` ([[adr-016-manual-type-sync]]) |
| T5 | Hàm export có kiểu trả về tường minh; ưu tiên `readonly`/`as const` cho hằng |
| T6 | Dùng `unknown` trong `catch`; thu hẹp bằng `instanceof` |
| T7 | Không `enum` TS — dùng union literal/`z.enum` (đồng bộ với Prisma enum qua `src/types/`) |
| T8 | Cú pháp `import/export`; **frontend** dùng alias `@/…`; **backend** dùng import **tương đối** (không alias — `tsc` không đổi alias khi build, `node dist/…` sẽ lỗi); backend build ra CommonJS; cấm import vòng |
| T9 | Chỉ dùng **`npm`** (commit `package-lock.json`); không `pnpm`/`yarn`; `backend/src/types/` chỉ import `zod` và chính nó |

## Định dạng & chất lượng
- Prettier + ESLint (`--max-warnings 0`). Chưa dùng commit hook (husky/lint-staged); **tự chạy** bộ lệnh ở [[definition-of-done]] trước khi commit.
- File ≤ **300 dòng** code (tách module/hook/component khi vượt). Hàm ≤ ~40 dòng; một trách nhiệm.
- Tên: xem [[architecture-repo-structure]]. Comment giải thích **vì sao**, không lặp lại **cái gì**.
- Không `console.log` (dùng logger ở BE; xóa ở FE). Không code chết/comment-out.
- Không số/chuỗi ma thuật: hằng ở `backend/src/types/constants.ts` (giới hạn upload, ngưỡng, regex).

## Bảo mật (mọi tầng)
1. Không bao giờ tin dữ liệu từ client: validate zod ở biên (route) **và** kiểm quyền ở service.
2. Cấm nối chuỗi SQL; chỉ Prisma hoặc `$queryRaw` có tham số.
3. Không log mật khẩu/token/nội dung tài liệu; không trả `passwordHash`.
4. Bí mật chỉ ở `.env` (không commit); `.env.example` chỉ giá trị giả.
5. Upload: kiểm cỡ + MIME + magic bytes ở backend.
6. Lọc `course_id` ở mọi truy vấn vector ([[concept-rag-overview]]).

## Giao diện (tóm tắt — chi tiết [[coding-standards-frontend]])
Chỉ Tailwind + token ở `tailwind.config.ts`; không inline `style`, không hex tự do; mọi trang dữ liệu có đủ loading/empty/error/forbidden.

## Phụ thuộc
Thêm thư viện mới cần: (1) lý do trong PR, (2) kiểm giấy phép + bảo trì, (3) nếu thay đổi kiến trúc ⇒ ADR mới ở `03_DECISIONS`. Ghim phiên bản: `package-lock.json` (commit) cho Node; `requirements.txt` ghim phiên bản cho Python. Prisma ghim `@6` (xem [[database-prisma-schema]]).

## Kiểm tra bắt buộc trước khi "xong"
`cd backend && npm run lint && npm run typecheck && npm run test`; `cd frontend && npm run lint && npm run typecheck && npm run test`; `./sync-types.sh --check`; (RAG) `cd rag-service && ruff check . && mypy . && pytest` — xem [[definition-of-done]].
