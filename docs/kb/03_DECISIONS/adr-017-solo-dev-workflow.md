---
id: adr-017-solo-dev-workflow
title: ADR-017 — Solo Dev: bỏ mock, bỏ Review, Agent không tự test
type: decision
status: accepted
tags: [adr, workflow, solo-dev, no-mock, agent]
related: [workflow-solo-dev, agent-rules, definition-of-done, testing-strategy, adr-016-manual-type-sync, plan-00-overview]
source: "Quyết định của Tech Lead sau Phase 01"
updated: 2026-11-15
supersedes: adr-015-ui-first-mock-adapters
---
# ADR-017 — Quy trình Solo Dev tinh gọn

> Thay thế ADR-015 (UI-first bằng mock adapters). File ADR-015 **đã bị xóa khỏi KB** theo yêu cầu của Tech Lead.

## Bối cảnh
Sau khi hoàn thành Phase 01 (Auth) từ UI đến Backend, kết nối DB thật, Tech Lead nhận ra dự án chỉ có **một người** làm: tách UI/Mock rồi mới đấu API làm tốn thời gian; việc chạy lint/typecheck/test do chính Tech Lead thực hiện ở Terminal nên Agent làm thêm chỉ tốn token.

## Quyết định
1. **Không mock.** Không `services/mock/`, không `mocks/fixtures/`, không biến `NEXT_PUBLIC_MOCK_FEATURES`. `services/index.ts` chỉ trỏ vào `http/`. Dữ liệu mẫu = seed DB.
2. **Quy trình 3 bước** ([[workflow-solo-dev]]): (1) Code UI & Wire API song song → (2) Code Backend (+DB) → (3) Tech Lead tự test. Bỏ cổng Review.
3. **Agent không chạy** `npm run lint`, `npm run typecheck`, `npm run test` (và các lệnh tương đương) — Tech Lead tự chạy. Agent **không viết file test** (`.test.ts/.test.tsx`) trừ khi logic cực kỳ phức tạp và Tech Lead đồng ý.
4. **Quy tắc giao tiếp**: Agent không in code ra chat; chỉ báo trạng thái file (`✅ Đã tạo xong auth.controller.ts`) — chi tiết ở [[agent-rules]].
5. DB được **migrate dần theo phase** (không tạo toàn bộ bảng từ đầu) — lịch ở [[database-erd]].

## Phương án đã cân nhắc
| Phương án | Vì sao không chọn |
|---|---|
| Giữ mock nhưng đơn giản hóa | Vẫn phải viết/duy trì hai bản (mock + http) cho một người dùng |
| MSW / Postman mock server | Thêm công cụ phải học, không cần khi làm một mình |
| Agent chạy lint/test và báo kết quả | Tốn token; Tech Lead đằng nào cũng tự chạy |

## Hệ quả
- (+) Ít việc nhân đôi; mỗi tính năng làm một lượt; tiết kiệm token.
- (−) Không xem được UI có dữ liệu cho tới khi backend + seed xong ⇒ mỗi trang bắt buộc có đủ trạng thái `loading/empty/error/forbidden`.
- (−) Mất lưới an toàn tự động ⇒ bù bằng **checklist test tay** của từng phase và danh sách ca bắt buộc ở [[testing-strategy]].
- Các test đã có từ Phase 00–01 (nếu có) giữ nguyên, Tech Lead tự chạy; không bắt buộc bổ sung.

## Ảnh hưởng tới tài liệu
[[agent-rules]], [[definition-of-done]], [[testing-strategy]], [[workflow-solo-dev]], [[plan-00-overview]], toàn bộ `06_EXECUTION_PLAN/`, [[architecture-frontend]], [[FILE_MAPPING]], [[FILE_MAPPING_ADMIN]], [[PROGRESS]].
