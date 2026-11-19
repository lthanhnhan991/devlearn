---
id: workflow-solo-dev
title: Quy trình Solo Dev — 3 bước (UI & Wire → Backend → Tech Lead test)
type: workflow
status: stable
tags: [workflow, solo-dev, no-mock]
related: [adr-017-solo-dev-workflow, agent-rules, definition-of-done, testing-strategy, plan-00-overview, architecture-frontend, adr-016-manual-type-sync]
source: "Quyết định của Tech Lead sau Phase 01"
updated: 2026-11-15
---
# Quy trình Solo Dev (3 bước)

Dự án làm **một mình**: không mock, không cổng Review, Agent **không** chạy lint/typecheck/test. Lý do: [[adr-017-solo-dev-workflow]].

```
 1. CODE UI & WIRE API (song song)  ─►  2. CODE BACKEND (+DB)  ─►  3. TECH LEAD TỰ TEST
    DTO → UI → gọi API (http)           route→…→repository         bật 2 terminal, dùng thử
```

## Bước 1 — Code UI & Wire API (làm song song, một lượt)
Với mỗi tính năng, theo đúng thứ tự:
1. **Tạo/sửa DTO** ở `backend/src/types/dto/<x>.ts` (Zod + kiểu), rồi chạy `./sync-types.sh` để copy sang `frontend/src/types/` ([[adr-016-manual-type-sync]]). Hợp đồng tham chiếu: `api-*.md` ([[api-contracts]]).
2. **Viết UI** theo thiết kế ([[ui-screens-client]] / [[ui-screens-admin]], [[ui-design-system]]): trang + component, đủ 4 trạng thái `loading / empty / error / forbidden`.
3. **Gắn API ngay (Wire)**: viết `frontend/src/services/http/<x>.http.ts` gọi `apiClient`; trang/hook gọi hàm này. `services/index.ts` chỉ re-export từ `./http/*` — **không có mock, không fixture**.
4. Xử lý lỗi theo [[error-handling-conventions]].

> Backend chưa có thì trang sẽ hiện trạng thái lỗi — bình thường. Dữ liệu mẫu duy nhất là **seed của DB** ([[database-seed-data]]).

## Bước 2 — Code Backend (+ cập nhật DB)
Thứ tự trong module `backend/src/modules/<x>/`:
`schema (zod từ ../types)` → `repository` → `service` (+ kiểm quyền) → `controller` → `routes` → `mapper`.
Khớp từng ví dụ JSON ở `api-*.md`. Đụng DTO ⇒ quay lại sửa `backend/src/types/` + `./sync-types.sh`.

**Cập nhật DB (khi phase có model mới)**: thêm model vào `backend/prisma/schema.prisma` đúng lịch ở [[database-erd]]; mở rộng `prisma/seed.ts`. Agent chỉ **sửa file**; lệnh `prisma migrate`/`db:seed` do Tech Lead chạy.

## Bước 3 — Tech Lead tự test
Tech Lead bật PostgreSQL + 2 terminal ([[architecture-deployment-env]]), dùng thử theo checklist của phase ở `06_EXECUTION_PLAN/`, và tự chạy `lint` / `typecheck` / `test` khi muốn ([[testing-strategy]]). **Agent không làm bước này và không cần quan tâm kết quả.**
Kết quả tốt ⇒ Tech Lead (hoặc Agent theo lệnh) đổi trạng thái ở [[FILE_MAPPING]] / [[FILE_MAPPING_ADMIN]].

## Trạng thái tính năng (FILE_MAPPING)
`⬜ TODO` → `🎨 UI+Wire` (xong bước 1) → `🛠 BE done` (xong bước 2) → `✅ Đã test` (Tech Lead xác nhận bước 3). `🚧` = làm dở/một phần.

## Ngoại lệ
- **RAG service** ([[plan-phase-07-rag-service]]): không có UI; bước 1 bỏ, chỉ code service rồi Tech Lead test bằng `curl`.
- Tính năng thuần backend (job quét treo, callback RAG): bỏ bước 1.
