---
id: adr-016-manual-type-sync
title: ADR-016 — Đơn giản hóa: npm + 3 thư mục độc lập + đồng bộ types thủ công
type: decision
status: accepted
tags: [adr, simplification, npm, types, sync]
related: [adr-014-monorepo-shared-contracts, architecture-repo-structure, architecture-deployment-env, agent-rules, plan-phase-00-foundation, workflow-ui-mock-wire-backend]
source: "Quyết định của chủ dự án sau khi thử Phase 00"
updated: 2026-11-15
supersedes: adr-014-monorepo-shared-contracts
---
# ADR-016 — Đơn giản hóa công cụ, đồng bộ types thủ công

## Bối cảnh
Chủ dự án là sinh viên, đã thử dựng Phase 00 theo [[adr-014-monorepo-shared-contracts]] và nhận thấy `pnpm`, monorepo (workspace, package `contracts` phải build) và Docker làm **mất kiểm soát quy trình**, không kịp bắt nhịp. Mục tiêu là hoàn thành sản phẩm, không phải học hạ tầng. Công cụ phải đủ đơn giản để người làm hiểu và sửa lỗi được một mình.

## Quyết định
1. **Chỉ dùng `npm`.** Không `pnpm`, không `pnpm-workspace.yaml`, không thư mục `packages/`, không `package.json` ở thư mục gốc.
2. **Ba dự án độc lập**, mỗi dự án có `package.json`/`requirements.txt` riêng: `backend/`, `frontend/`, `rag-service/` (+ `docs/`). Chạy lệnh bằng `cd backend && npm run …` hoặc `cd frontend && npm run …`.
3. **Không Docker** ở giai đoạn này. Chạy trực tiếp: 3 terminal (backend, frontend, rag-service) + PostgreSQL cài trên máy (hoặc Postgres đám mây). Docker chỉ là **tùy chọn cho Phase 10** ([[plan-phase-10-hardening-release]]).
4. **Kiểu dùng chung (shared types)**: nguồn sự thật nằm ở **`backend/src/types/`** (DTO + Zod schema, `constants`, `labels`, `errors`, `scoring.ts` chứa `computeScore/isPassed`, `seed-ids`). Frontend dùng **bản copy** ở `frontend/src/types/`, tạo bằng script `sync-types.sh` (chỉ dùng lệnh `cp`).

## Quy tắc đi kèm (bắt buộc)
| # | Quy tắc |
|---|---|
| R1 | **Chỉ sửa ở `backend/src/types/`.** Không bao giờ sửa `frontend/src/types/` (file `_SYNCED_FROM_BACKEND.txt` nhắc điều này). |
| R2 | Sau **mỗi** lần sửa `backend/src/types/`, chạy `./sync-types.sh` rồi **commit cả hai thư mục trong cùng một commit**. |
| R3 | Trước khi báo xong một tác vụ / mở PR: chạy `./sync-types.sh --check` (lệch ⇒ thoát mã 1). |
| R4 | `backend/src/types/` phải **tự đủ**: chỉ `import` từ `zod` và từ chính `types/`. Cấm import Express, Prisma, Node API, React, `process.env` ⇒ copy sang frontend vẫn biên dịch. |
| R5 | Cả hai dự án cài `zod` (`npm install zod`). |
| R6 | Frontend **không** import đường dẫn tới `backend/` (kiểu `../../backend/...`). |

## Phương án đã cân nhắc
| Phương án | Vì sao không chọn |
|---|---|
| npm workspaces (giữ monorepo, đổi pnpm → npm) | Vẫn còn khái niệm workspace + build package; khó gỡ lỗi với người mới |
| Xuất types thành package npm riêng | Phải publish/link; quá nặng |
| Sinh types từ OpenAPI (codegen) | Thêm công cụ + bước sinh code phải học |
| Frontend import thẳng `../backend/src/types` (tsconfig paths) | Ràng buộc build Next.js ↔ backend, dễ vỡ; trộn hai dự án |
| Git submodule | Phức tạp hơn copy |

## Hệ quả
- (+) Một lệnh `npm` quen thuộc; mỗi dự án chạy độc lập; không cần Docker.
- (+) `sync-types.sh --check` cho biết ngay khi lệch.
- (−) Có thể **quên đồng bộ** ⇒ giảm thiểu bằng R2/R3 và mục kiểm trong [[definition-of-done]].
- (−) Phải **cài PostgreSQL** (hoặc dùng Postgres đám mây) và chạy 3 tiến trình thủ công ([[architecture-deployment-env]]).
- (−) Không còn một lệnh dựng cả hệ thống; chấp nhận ở giai đoạn này.
- Các thư viện được cài ở **cả hai** dự án (ví dụ `zod`, `prettier`) — trùng lặp có chủ đích.

## Khi nào xem lại
Nếu trong một phase mà lệch types gây lỗi ≥ 3 lần, hoặc có thêm người cùng làm ⇒ cân nhắc npm workspaces hoặc codegen từ OpenAPI và viết ADR mới thay thế ADR này.

## Ảnh hưởng tới tài liệu
Cấu trúc repo ([[architecture-repo-structure]]), môi trường ([[architecture-deployment-env]]), luật Agent ([[agent-rules]]), quy trình ([[workflow-ui-mock-wire-backend]]), kiểm thử ([[testing-strategy]]), Git ([[git-workflow]]), Phase 00 ([[plan-phase-00-foundation]]), ánh xạ file ([[FILE_MAPPING]]).
