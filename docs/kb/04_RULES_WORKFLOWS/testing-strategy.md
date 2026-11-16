---
id: testing-strategy
title: Chiến lược kiểm thử
type: workflow
status: stable
tags: [testing, vitest, playwright, pytest, npm]
related: [definition-of-done, workflow-ui-mock-wire-backend, coding-standards-backend, coding-standards-rag-python, adr-013-exam-stats-owner-only, adr-016-manual-type-sync]
source: "Đồ án §2.2.4 (Postman/Swagger); cập nhật theo ADR-016"
updated: 2026-11-15
---
# Kiểm thử

Không Docker: test backend dùng **một database riêng `devlearn_test`** trên chính PostgreSQL đang cài ([[architecture-deployment-env]]), cấu hình ở `backend/.env.test`.

| Tầng | Công cụ | Phạm vi | Lệnh |
|---|---|---|---|
| Types (nguồn) | Vitest | `computeScore/isPassed` (0, 10/10, 1/3, 2/3) | `cd backend && npm run test` |
| Types (bản copy FE) | script | bản copy khớp nguồn | `./sync-types.sh --check` |
| FE unit/component | Vitest + Testing Library | hook (`useExamTimer`), component có logic (QuestionNavigator, ModuleAccordion, FileDropzone); **mọi fixture mock** `schema.parse(fixture)` | `cd frontend && npm run test` |
| BE unit | Vitest | service (repo giả): chấm điểm, tiến độ, trạng thái exam, ownership | `cd backend && npm run test` |
| BE API | Vitest + Supertest + PostgreSQL `devlearn_test` | từng endpoint | `cd backend && npm run test` |
| RAG | pytest | chunker, pdf, filter `course_id`, `found=false`, idempotent ingest, callback (Gemini giả, Chroma ephemeral) | `cd rag-service && pytest` |
| Tĩnh | ESLint + tsc | không `any`, kiểu đúng | `npm run lint && npm run typecheck` (mỗi dự án) |
| E2E (Phase 10) | Playwright | luồng vàng | `cd frontend && npm run e2e` (cần backend đang chạy) |
| Thủ công | Postman / `curl` | khám phá, demo | tùy |

Chạy **trước mỗi lần báo xong** và trước mỗi PR: xem bộ lệnh chuẩn ở [[definition-of-done]].

## Quy tắc BE API test
Mỗi endpoint tối thiểu: ✅ thành công · `401` thiếu token · `403` sai vai trò/không sở hữu · `400` dữ liệu sai · nhánh nghiệp vụ chính của concept.
DB test: trước bộ test chạy `cd backend && npm run db:test:reset` (migrate + seed nhỏ); mỗi test độc lập (rollback transaction hoặc dọn bảng). **Không bao giờ** trỏ test vào database `devlearn` (dev).

## Ca kiểm thử bắt buộc (không được bỏ)
1. **Auth**: sai cổng ⇒ `WRONG_PORTAL`; tài khoản `LOCKED` ⇒ chặn **ngay** cả khi token còn hạn.
2. **Đề thi không lộ đáp án**: response `GET /exams/:id/questions` không chứa `isCorrect`.
3. **Chấm điểm**: 0/10, 10/10, bỏ trống, làm lại (attemptNo tăng), 2 request song song không trùng `attempt_no`.
4. **Điểm cao nhất**: `bestScore`, `passed`, `averageScore` đúng theo [[concept-exam-statistics]].
5. **Owner-only thống kê**: GV khác ⇒ 403; Admin không phải chủ ⇒ 403 ([[adr-013-exam-stats-owner-only]]).
6. **Ghi danh**: chưa ghi danh ⇒ `NOT_ENROLLED` ở lesson/exam/AI.
7. **Tiến độ**: complete idempotent; đạt 100% ⇒ `completed_at` set một lần.
8. **Khóa bản nháp/bài chưa xuất bản** không lộ cho SV.
9. **Xóa**: khóa có ghi danh ⇒ 409; xóa ai_document khi RAG lỗi ⇒ 502 và còn bản ghi.
10. **RAG**: truy vấn khóa A không trả đoạn của khóa B; PDF ảnh quét ⇒ `FAILED/NO_TEXT_LAYER`; ingest hai lần không nhân đôi vector.
11. **Upload**: quá cỡ ⇒ 413; sai magic bytes ⇒ 415.
12. **Rate limit** `/ai/ask` ⇒ 429.
13. **Types đồng bộ**: `./sync-types.sh --check` ✅ ở mọi PR có đụng DTO.

## E2E (Playwright, Phase 10) — luồng vàng
1. SV đăng ký → đăng nhập → duyệt/lọc → đăng ký học → học 1 bài → hoàn thành → % đổi.
2. SV làm bài kiểm tra → nộp → xem điểm → "Xem lại" → làm lại → My results hiển thị điểm cao nhất.
3. GV đăng nhập admin → tạo khóa → module → bài → xuất bản → tạo bài kiểm tra + câu → mở → xem thống kê.
4. GV tải PDF → chờ `READY` (RAG giả/thật) → SV hỏi AI → có nguồn.
5. Admin khóa người dùng → người đó không vào được.
Cần bật tay: PostgreSQL, `cd backend && npm run dev`, `cd rag-service && uvicorn … ` (với `RAG_FAKE_PROVIDER=true`), rồi `cd frontend && npm run e2e`.

## Dữ liệu & môi trường
Seed [[database-seed-data]]; E2E dùng RAG với Gemini **giả** (`RAG_FAKE_PROVIDER=true`) để ổn định và không tốn quota; một kịch bản "smoke thật" chạy thủ công trước demo.

## Ngưỡng
Service BE ≥ 80% dòng; mọi fixture mock parse được bằng zod; không giảm coverage giữa các lần nộp.
