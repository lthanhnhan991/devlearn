---
id: architecture-repo-structure
title: Cấu trúc thư mục dự án (3 dự án độc lập) & quy ước
type: architecture
status: stable
tags: [repo, structure, naming, npm, types]
related: [adr-016-manual-type-sync, architecture-backend-layers, architecture-frontend, architecture-rag-service, architecture-deployment-env, coding-standards]
source: "Thiết kế Tech Lead, cập nhật theo ADR-016"
updated: 2026-11-15
---
# Cấu trúc dự án

**Một repo Git, ba dự án độc lập** — mỗi dự án tự có `package.json` (hoặc `requirements.txt`), tự cài thư viện, tự chạy. **Không** monorepo, **không** `pnpm`, **không** `packages/`, **không** Docker ([[adr-016-manual-type-sync]]).

```
devlearn/
├── backend/                     # Node.js + Express + Prisma (npm)
│   ├── package.json · tsconfig.json · .env.example   (.env, .env.test: KHÔNG commit)
│   ├── prisma/{schema.prisma, migrations/, seed.ts}
│   └── src/
│       ├── app.ts · server.ts
│       ├── config/env.ts             # zod-validate process.env
│       ├── middlewares/              # authenticate, requireRole, validate, error-handler, rate-limit, upload
│       ├── lib/                      # prisma.ts, jwt.ts, password.ts, cloudinary.ts, rag-client.ts, errors.ts
│       ├── jobs/                     # stuck-document-sweeper.ts
│       ├── modules/<module>/         # <module>.routes.ts · .controller.ts · .service.ts · .repository.ts · .mapper.ts · .test.ts
│       └── types/                    # ★ NGUỒN SỰ THẬT của kiểu dùng chung (xem bên dưới)
├── frontend/                    # Next.js App Router (npm)
│   ├── package.json · .env.example   (.env.local: KHÔNG commit)
│   └── src/
│       ├── app/                      # (client)/ (learn)/ (auth)/login/ admin/login/ admin/(panel)/
│       ├── components/{ui,client,admin,shared}/
│       ├── features/<feature>/       # hooks, view-model theo tính năng
│       ├── services/                 # http/*.http.ts + index.ts (barrel, chỉ trỏ vào http/) — KHÔNG mock
│       ├── lib/                      # api-client, auth-context, cn(), format
│       └── types/                    # ★ BẢN COPY từ backend/src/types — KHÔNG SỬA TAY
├── rag-service/                 # Python FastAPI (làm sau, Phase 07)
│   ├── requirements.txt · .env.example   (.env, .venv/, data/: KHÔNG commit)
│   └── app/{main.py, config.py, prompts.py, api/, core/, services/, schemas/}  ·  tests/
├── docs/                        # KB (docs/kb/), thiết kế UI, sơ đồ — giữ nguyên
├── sync-types.sh                # copy backend/src/types → frontend/src/types
└── .gitignore
```
Mỗi module backend: `auth · users · public · courses · modules · lessons · enrollments · progress · exams · attempts · exam-stats · ai-chat · ai-documents · dashboard · internal`. **Chỉ `*.repository.ts` được import Prisma** ([[architecture-backend-layers]]).

## Kiểu dùng chung: `backend/src/types/`
```
backend/src/types/
├─ index.ts            # re-export
├─ dto/*.ts            # Zod schema + kiểu suy ra (z.infer): common, auth, catalog, learning, exam, ai, admin-*, dashboard
├─ constants.ts        # mã topic/level, giới hạn upload (100 MB / 10 MB)
├─ labels.ts           # nhãn tiếng Việt cho enum (Đạt, Bản nháp…)
├─ errors.ts           # union mã lỗi (VALIDATION_ERROR, NOT_ENROLLED…)
├─ scoring.ts          # computeScore, isPassed
└─ seed-ids.ts         # UUID cố định cho seed DB (chỉ backend dùng)
```
**Luật** (chi tiết [[adr-016-manual-type-sync]]): (1) chỉ sửa ở backend; (2) sửa xong chạy `./sync-types.sh` và commit cả hai thư mục; (3) `types/` chỉ import `zod` + chính nó; (4) FE không bao giờ sửa `frontend/src/types/`.

## Hợp đồng npm scripts (mọi lệnh trong KB bám theo bảng này)
| Dự án | Script | Lệnh thực chạy | Ý nghĩa |
|---|---|---|---|
| backend | `dev` | `tsx watch src/server.ts` | chạy dev, tự reload (cổng 4000) |
| backend | `build` / `start` | `tsc` / `node dist/server.js` | build / chạy bản build |
| backend | `lint` | `eslint .` | |
| backend | `typecheck` | `tsc --noEmit` | |
| backend | `test` | `vitest run` (nạp `.env.test`) | unit + API test |
| backend | `prisma:migrate` | `prisma migrate dev` | tạo/áp migration (dev) |
| backend | `prisma:deploy` | `prisma migrate deploy` | áp migration có sẵn |
| backend | `db:seed` | `prisma db seed` | nạp dữ liệu mẫu |
| backend | `db:reset` | `prisma migrate reset --force` | xóa + migrate + seed (**chỉ dev**) |
| backend | `db:test:reset` | như trên với `.env.test` | reset DB test |
| frontend | `dev` / `build` / `start` | do `create-next-app` tạo | cổng 3000 |
| frontend | `lint` | giữ script sinh sẵn | |
| frontend | `typecheck` | `tsc --noEmit` | |
| frontend | `test` | `vitest run` | test tự động (chỉ khi dự án đã có) |
| rag-service | — (Python) | `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` | chạy dev |
| rag-service | — | `ruff check . && mypy . && pytest` | kiểm tra |

Gọi bằng `cd backend && npm run <script>`; riêng `test` viết `npm run test`. **`lint`, `typecheck`, `test` do Tech Lead tự chạy; Agent không chạy** ([[agent-rules]], [[testing-strategy]]).

## Quy ước đặt tên
| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| File/thư mục TS | `kebab-case` | `course-card.tsx`, `exam.service.ts` |
| Component React | `PascalCase` (export có tên) | `CourseCard` |
| Hook | `useXxx` | `useEnrollment` |
| Biến/hàm | `camelCase` | `computeScore` |
| Hằng số | `UPPER_SNAKE` | `MAX_PDF_BYTES` |
| Route Next | thư mục theo URL | `app/(client)/courses/[courseId]/page.tsx` |
| Bảng DB / cột | `snake_case` (`@map`) | `lesson_progress.completed_at` |
| JSON API | `camelCase` | `totalDurationMinutes` |
| Enum | `UPPER_SNAKE` | `PUBLISHED` |
| Git branch | `feat/p<phase>-<slug>` | `feat/p02-course-catalog` |

## Đường dẫn import
- **Frontend**: alias `@/…` → `frontend/src/…` (ví dụ `@/types/dto/auth`, `@/components/ui/button`).
- **Backend**: import **tương đối** (`../types/dto/auth`), **không** dùng alias — `tsc` không đổi alias khi build nên `node dist/…` sẽ lỗi.
- Cấm import chéo `frontend` ↔ `backend`; chia sẻ duy nhất qua bản copy `types/`.

## `.gitignore` (thư mục gốc)
```
node_modules/
dist/
.next/
.env
.env.*
!.env.example
.venv/
__pycache__/
rag-service/data/
*.log
.DS_Store
```
(Commit `package-lock.json` của backend và frontend.)
