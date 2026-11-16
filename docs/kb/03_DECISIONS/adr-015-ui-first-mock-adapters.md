---
id: adr-015-ui-first-mock-adapters
title: ADR-015 — UI trước bằng mock adapters, rồi đấu API
type: decision
status: accepted
tags: [adr, workflow, mock, frontend]
related: [adr-016-manual-type-sync, workflow-ui-mock-wire-backend, architecture-frontend, database-seed-data]
source: "Yêu cầu quy trình dự án"
updated: 2026-11-15
---
# ADR-015 — UI-first với mock adapters ở tầng service

## Quyết định
Mỗi tính năng: **UI + Mock → Review → Wire → Backend → Test** ([[workflow-ui-mock-wire-backend]]). Mock nằm ở **tầng `services/`** (không MSW): mỗi service có `http/` và `mock/` cùng interface; `NEXT_PUBLIC_MOCK_FEATURES` chọn từng tính năng.

## Phương án
- **MSW** (chặn ở tầng mạng): sát thật hơn, nhưng cấu hình rắc rối với Server Components/Next và thêm phụ thuộc.
- Mock cứng trong component: khi đấu API phải sửa UI ⇒ loại.

## Hệ quả
- (+) Đổi mock → thật là đổi **một dòng env**; mock dùng `seed-ids` và `computeScore` chung nên khớp backend.
- (−) Mock có thể "đẹp hơn thật" ⇒ bắt buộc mô phỏng trễ + nhánh lỗi/empty/403 và kiểm bằng **contract test** (zod parse fixture) trong `cd frontend && npm run test`.
