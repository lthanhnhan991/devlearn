---
id: plan-phase-08-ai-chat-and-docs
title: Phase 08 — Tài liệu AI (Admin) + Chat AI (SV) (UC07, UC11)
type: plan
status: living
tags: [plan, ai, rag, chat, documents]
related: [plan-00-overview, concept-rag-ingestion, concept-rag-query, api-ai-chat, api-admin-ai-docs, api-internal-rag, plan-phase-07-rag-service, ui-screens-admin, ui-screens-client]
source: "UC07, UC11; UI A05, C07"
updated: 2026-11-15
---
# Phase 08 — AI docs & Chat

**Phạm vi**: A05 tài liệu AI, C07 chat AI, ghép Backend ↔ RAG. **Phụ thuộc**: P04, P07. **FILE_MAPPING**: AD-10, CL-12, IN-08. **Cỡ**: L.

## A — UI + Mock
- [ ] P08-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `AiDocumentDto`, `AiCourseOptionDto`, `AiMessageDto`, `AskReq/Res`, `SourceDto`
- [ ] P08-A2 `admin-ai-docs.mock.ts`: tải lên ⇒ `PROCESSING` rồi tự chuyển `READY`/`FAILED` sau vài giây (mô phỏng poll); `ai-chat.mock.ts`: trả lời mẫu có nguồn, `found=false`, `NO_READY_DOCUMENTS`, `429`, `504`
- [ ] P08-A3 A05: `FileDropzone` + chọn khóa (G-05), `AiDocumentTable` (chip trạng thái, `errorMessage` dịch sang tiếng Việt, **Nạp lại · Xóa** có xác nhận), poll 3–5 s khi còn đang xử lý
- [ ] P08-A4 C07: `ChatPanel` (select khóa, bong bóng, "Nguồn: tài liệu, trang n", typing, Thử lại), trạng thái chưa ghi danh khóa nào / khóa chưa có tài liệu, giới hạn 1000 ký tự
## B — Review
- [ ] P08-B1 Khớp A05/C07 · [ ] thông điệp lỗi AI thân thiện · [ ] ghi chú "Sinh viên chỉ hỏi đáp…"
## C — Wire
- [ ] P08-C1 `admin-ai-docs.http.ts` (multipart), `ai-chat.http.ts`; hook `usePollWhile(processing)`
## D — Backend
- [ ] P08-D1 `lib/rag-client.ts`: `ingest`, `query`, `deleteDocument`, `deleteCourse`; timeout/ánh xạ lỗi ([[api-internal-rag]])
- [ ] P08-D2 `ai-documents`: list/POST (multipart → Cloudinary → `PENDING` → `/ingest` → `PROCESSING`)/reingest/delete (RAG trước, DB sau; giữ file nếu `lesson_id`)
- [ ] P08-D3 Thay bản no-op `IngestDispatcher`/`VectorCleaner` của P04 bằng bản thật: upload PDF bài học ⇒ ingest; xóa bài/khóa ⇒ xóa vector
- [ ] P08-D4 `internal`: `POST /internal/ai-documents/:id/status` (kiểm key; chuyển trạng thái hợp lệ; 404 khi đã xóa)
- [ ] P08-D5 `jobs/stuck-document-sweeper.ts` (5 phút; > 15 phút ⇒ `FAILED/TIMEOUT`)
- [ ] P08-D6 `ai-chat`: `GET /ai/courses`, `GET …/messages`, `POST …/ask` (kiểm ghi danh + có `READY`; lưu `ai_messages` gồm `sources`; không lưu khi lỗi); rate limit 10/phút/người dùng
## E — Test
- [ ] P08-E1 Backend với **RAG giả** (nock/`msw/node`): ask ok/`found=false`/`409`/`403`/`429`/`502`/`504`; ingest callback thành công & thất bại; callback muộn cho bản ghi đã xóa
- [ ] P08-E2 Xóa khi RAG lỗi ⇒ `502` và còn bản ghi; xóa khóa ⇒ gọi `deleteCourse`
- [ ] P08-E3 Sweeper: bản ghi treo > 15 phút ⇒ `FAILED/TIMEOUT`
- [ ] P08-E4 **Tích hợp thật 3 dịch vụ** (3 terminal: `cd backend && npm run dev`, `cd rag-service && uvicorn …`, `cd frontend && npm run dev`): GV tải PDF → `READY` → SV hỏi → có nguồn đúng trang; khóa khác không rò rỉ
- [ ] P08-E5 Gỡ mock; e2e luồng 4 ở [[testing-strategy]]; DoD + log (đạt **M3**)

## Rủi ro
Callback không tới ⇒ kiểm `API_CALLBACK_BASE_URL` trong `rag-service/.env` (mặc định `http://localhost:4000`); sweeper là lưới an toàn. Quota Gemini khi demo ⇒ chuẩn bị tài liệu mẫu đã nạp sẵn.
