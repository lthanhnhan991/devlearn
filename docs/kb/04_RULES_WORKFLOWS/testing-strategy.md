---
id: testing-strategy
title: Chiến lược kiểm thử (Tech Lead tự test)
type: workflow
status: stable
tags: [testing, manual, solo-dev]
related: [definition-of-done, workflow-solo-dev, agent-rules, adr-013-exam-stats-owner-only, adr-017-solo-dev-workflow, architecture-deployment-env]
source: "Cập nhật theo ADR-017"
updated: 2026-11-15
---
# Kiểm thử

## Nguyên tắc
- **Tech Lead (User) sẽ tự chạy các lệnh này. Agent không cần quan tâm.** Agent **không** chạy `npm run lint`, `npm run typecheck`, `npm run test` và **không** viết file test (`.test.ts`, `.test.tsx`, pytest).
- Ngoại lệ duy nhất: logic **cực kỳ phức tạp** *và* Tech Lead đồng ý (ví dụ nộp bài đồng thời) — khi đó Agent mới viết test cho đúng phần đó.
- Không có mock ⇒ test = **dùng thử trên hệ thống thật** (backend + DB seed).

## Lệnh Tech Lead tự chạy (khi muốn)
| Mục đích | Lệnh |
|---|---|
| Lint / kiểu BE | `cd backend && npm run lint` · `npm run typecheck` |
| Lint / kiểu FE | `cd frontend && npm run lint` · `npm run typecheck` |
| Test tự động (nếu dự án đã có) | `cd backend && npm run test` · `cd frontend && npm run test` |
| Types lệch? | `./sync-types.sh --check` (thư mục gốc) |
| RAG | `cd rag-service && ruff check . && mypy .` |
| KB | `python docs/kb/tools/kb_lint.py` |
Test tay API: Postman hoặc `curl`.

## Bật hệ thống để test
PostgreSQL chạy → Terminal 1 `cd backend && npm run dev` → Terminal 2 `cd frontend && npm run dev` (từ Phase 07–08 thêm Terminal 3: rag-service). Chi tiết [[architecture-deployment-env]]. Tài khoản/dữ liệu mẫu: [[database-seed-data]].

## Checklist test tay bắt buộc (không được bỏ qua)
Thay cho bộ test tự động. Mỗi mục thuộc phase tương ứng ở `06_EXECUTION_PLAN/`.
1. **Auth**: SV đăng nhập ở cổng admin ⇒ bị từ chối (`WRONG_PORTAL`) và ngược lại; tài khoản `LOCKED` bị chặn **ngay** cả khi vẫn còn cookie.
2. **Đề thi không lộ đáp án**: mở tab Network ở màn làm bài ⇒ response đề không có `isCorrect`.
3. **Chấm điểm**: nộp bỏ trống (0/10), đúng hết (10/10), làm lại (Lần làm tăng), điểm hiển thị là điểm **cao nhất**.
4. **Owner-only thống kê**: đăng nhập GV khác ⇒ 403; Admin không phải chủ khóa ⇒ 403 ([[adr-013-exam-stats-owner-only]]).
5. **Ghi danh**: chưa đăng ký khóa mà vào thẳng URL bài học/đề thi/AI ⇒ bị chặn (`NOT_ENROLLED`).
6. **Tiến độ**: bấm Hoàn thành bài hai lần không đổi dữ liệu; đạt 100% ⇒ khóa chuyển sang "Đã hoàn thành".
7. **Bản nháp**: khóa `DRAFT`/bài chưa xuất bản không hiện với SV.
8. **Xóa**: khóa đã có người đăng ký ⇒ không xóa được (409).
9. **Upload**: file quá cỡ/sai loại bị từ chối (video > 100 MB, PDF > 10 MB; đổi đuôi `.pdf` giả).
10. **RAG**: hỏi khóa A không trả nội dung tài liệu khóa B; PDF ảnh quét ⇒ trạng thái `Lỗi`; nạp lại cùng tài liệu không nhân đôi nguồn.
11. **Rate limit**: gửi > 10 câu hỏi AI/phút ⇒ 429.
12. **Types**: `./sync-types.sh --check` ✅ sau mỗi lần Agent sửa DTO.

## Ghi chú
Test tự động đã tồn tại từ Phase 00–01 (nếu có) được giữ nguyên; không bắt buộc bổ sung. Database `devlearn_test` (`backend/.env.test`) chỉ cần khi Tech Lead chạy test API tự động.
