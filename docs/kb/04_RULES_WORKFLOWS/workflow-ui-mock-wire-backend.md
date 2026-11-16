---
id: workflow-ui-mock-wire-backend
title: Quy trình: UI + Mock → Review → Wire → Backend → Test
type: workflow
status: stable
tags: [workflow, mock, review, wire, npm]
related: [adr-015-ui-first-mock-adapters, adr-016-manual-type-sync, agent-rules, architecture-frontend, testing-strategy, definition-of-done, plan-00-overview]
source: "Yêu cầu dự án; cập nhật theo ADR-016"
updated: 2026-11-15
---
# Quy trình 5 giai đoạn cho **mỗi tính năng**

```
 A. UI + Mock ─► B. REVIEW (cổng người) ─► C. WIRE ─► D. BACKEND ─► E. TEST & ĐÓNG
 (mock services)   (chấp thuận UI)        (service http) (route→repo)   (e2e, bỏ mock)
```
Lệnh chạy theo [[architecture-repo-structure]]: `cd frontend && npm run …` cho FE, `cd backend && npm run …` cho BE.

## A. UI + Mock Data
**Vào**: hợp đồng API đã chốt ([[api-contracts]]); màn đã có thiết kế ([[ui-screens-client]]/[[ui-screens-admin]]).
1. Thêm/sửa DTO (Zod + kiểu) ở **`backend/src/types/dto/<x>.ts`**, rồi từ thư mục gốc chạy **`./sync-types.sh`** để copy sang `frontend/src/types/` ([[adr-016-manual-type-sync]]). *Không sửa trực tiếp `frontend/src/types/`.*
2. Viết fixtures `frontend/src/mocks/fixtures/<x>.ts` (dùng `@/types/seed-ids`) — **đủ nhánh**: dữ liệu thường, rỗng, nhiều (phân trang), lỗi.
3. Viết `services/<x>.service.ts` (interface) + `mock/<x>.mock.ts` (trễ 300–600 ms, công tắc `?mock=error|empty|forbidden`).
4. Dựng trang/component theo thiết kế, **khớp đến từng nhãn/màu** ([[ui-design-system]]); đủ `loading/empty/error/forbidden`.
5. Test component có logic; test contract: `schema.parse(fixture)` pass. Chạy: `cd frontend && npm run lint && npm run typecheck && npm run test`.
6. `NEXT_PUBLIC_MOCK_FEATURES` (trong `frontend/.env.local`) có tên tính năng.
7. `./sync-types.sh --check` ✅ trước khi tạo PR.
**Ra**: PR "UI+Mock" + ảnh chụp từng trạng thái. Backend **chưa cần chạy**.

## B. Review (cổng chặn — người quyết định)
Checklist:
- [ ] Khớp ảnh thiết kế (bố cục, chữ, màu, trạng thái chip).
- [ ] Đủ 4 trạng thái; responsive mobile/desktop.
- [ ] Tương tác đúng nghiệp vụ (đồng hồ, xác nhận xóa, điều hướng sau hành động).
- [ ] Không có hex/inline style; không `any`.
- [ ] Hợp đồng API vẫn đủ cho UI (nếu UI cần thêm trường ⇒ **sửa `api-*.md` + `backend/src/types/` + chạy `./sync-types.sh` ngay bây giờ**).
- [ ] Các "Gap" của màn ([[delta-vs-thesis]]) đã được chốt thiết kế.
**Kết quả**: *Approved* ⇒ sang C; *Changes* ⇒ quay lại A. Ghi vào [[PROGRESS]].

## C. Wire (đấu dây)
1. Viết `services/http/<x>.http.ts` dùng `apiClient` — chữ ký **y hệt** mock; parse response bằng zod ở dev.
2. Xử lý lỗi theo [[error-handling-conventions]] (mã lỗi → thông điệp/điều hướng).
3. Chưa có backend: giữ tính năng trong `NEXT_PUBLIC_MOCK_FEATURES`; kiểm `http` bằng test có `fetch` giả (`vi.fn`) hoặc Postman/`curl` để chắc đường dẫn, `credentials`, envelope đúng.
4. Không còn import trực tiếp `mocks/` trong component.
5. Chạy `cd frontend && npm run lint && npm run typecheck && npm run test`.

## D. Backend
Thứ tự trong module (`backend/src/modules/<x>/`): `schema (zod từ ../types)` → `repository` → `service` (+kiểm quyền) → `controller` → `routes` → `mapper`. Viết test **song song** ([[testing-strategy]]). Khớp từng ví dụ JSON ở `api-*.md`.
Nếu phải đổi DTO ⇒ quay lại sửa `backend/src/types/` + `./sync-types.sh` (luật S1–S4 ở [[agent-rules]]).
Chạy: `cd backend && npm run lint && npm run typecheck && npm run test`; thử tay: `cd backend && npm run dev`.

## E. Test & đóng
1. Gỡ tên tính năng khỏi `NEXT_PUBLIC_MOCK_FEATURES` ⇒ FE chạy với backend thật + seed (`cd backend && npm run db:seed`). Bật hai terminal: `cd backend && npm run dev` và `cd frontend && npm run dev`.
2. Kiểm tay luồng chính (Phase 10 mới có Playwright: `cd frontend && npm run e2e`); so lại với ảnh thiết kế.
3. Kiểm quyền: vai trò sai ⇒ 403/404 đúng.
4. [[definition-of-done]]; tick checklist plan; cập nhật FILE_MAPPING (⬜→✅) và PROGRESS.

## Trạng thái trong FILE_MAPPING
`⬜ TODO` → `🎨 UI+Mock` → `👀 Reviewed` → `🔌 Wired` → `🛠 BE done` → `✅ Tested`.

## Ngoại lệ
- **RAG service** (Python) không có UI: làm theo "Contract → test với fake → tích hợp" ([[plan-phase-07-rag-service]]); chạy bằng `uvicorn` + `pytest` trong `rag-service/`.
- Tính năng thuần backend (job quét, callback): bỏ A–C.
