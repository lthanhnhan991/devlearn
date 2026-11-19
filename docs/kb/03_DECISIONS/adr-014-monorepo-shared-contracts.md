---
id: adr-014-monorepo-shared-contracts
title: ADR-014 — Monorepo pnpm + package contracts dùng chung (ĐÃ BỊ THAY THẾ bởi ADR-016)
type: decision
status: superseded
tags: [adr, monorepo, zod, contracts]
related: [adr-016-manual-type-sync, architecture-repo-structure, api-contracts, coding-standards]
source: "Quyết định mới (hỗ trợ TS strict, §2.2.2 mục 8)"
updated: 2026-11-15
superseded_by: adr-016-manual-type-sync
---
# ADR-014 — Monorepo + `@devlearn/contracts`

> ⛔ **ĐÃ BỊ THAY THẾ** bởi [[adr-016-manual-type-sync]] (2026-11-15). **Không áp dụng nội dung bên dưới.**
> Dự án hiện dùng `npm`, 3 thư mục độc lập (`backend/`, `frontend/`, `rag-service/`), không monorepo, không `packages/contracts`.
> Giữ lại file này chỉ để lưu lịch sử quyết định.


## Quyết định
pnpm workspaces: `apps/web`, `apps/api`, `packages/contracts`, (RAG Python tách riêng, giao tiếp qua HTTP). `contracts` chứa **zod schema + kiểu suy ra + labels + hằng số + `computeScore/isPassed` + seed-ids**. FE và BE cùng import.

## Lý do
Đồ án nêu "kiểm tra kiểu dữ liệu giúp giảm lỗi khi trao đổi qua REST". Một schema ⇒ FE không thể lệch hợp đồng thật; Agent không phải đoán JSON.

## Hệ quả
- (+) Bắt lỗi lệch hợp đồng ở compile time; tái dùng validate ở FE.
- (−) Cần build `contracts` (tsup/tsc) trước khi chạy app; thêm bước trong CI.
- Quy tắc: sửa `api-*.md` → sửa `contracts` → code ([[agent-rules]]). Python RAG dùng pydantic riêng, khớp [[api-internal-rag]].
