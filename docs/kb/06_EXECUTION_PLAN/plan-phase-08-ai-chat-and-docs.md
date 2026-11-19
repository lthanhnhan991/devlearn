---
id: plan-phase-08-ai-chat-and-docs
title: Phase 08 — Tài liệu AI (Admin) + Chat AI (SV) (UC07, UC11)
type: plan
status: living
tags: [plan, ai, rag, chat, documents]
related: [plan-00-overview, workflow-solo-dev, concept-rag-ingestion, concept-rag-query, api-ai-chat, api-admin-ai-docs, api-internal-rag, plan-phase-07-rag-service, ui-screens-admin, ui-screens-client, database-erd]
source: "UC07, UC11; UI A05, C07"
updated: 2026-11-15
---
# Phase 08 — AI docs & Chat

**Phạm vi**: A05 tài liệu AI, C07 chat AI, ghép Backend ↔ RAG. **Phụ thuộc**: P04, P07. **FILE_MAPPING**: AD-10, CL-12, IN-08. **Cỡ**: L.

## Việc cần làm
### DTO
- [ ] P08-1 `backend/src/types/dto/ai.ts`, `admin-ai-docs.ts`: `AiDocumentDto`, `AiCourseOptionDto`, `AiMessageDto`, `AskReq/Res`, `SourceDto` ([[api-ai-chat]], [[api-admin-ai-docs]]) → `./sync-types.sh`
### UI
- [ ] P08-2 A05: `FileDropzone` + chọn khóa (G-05), `AiDocumentTable` (chip trạng thái, `errorMessage` dịch sang tiếng Việt, **Nạp lại · Xóa** có xác nhận), tự làm mới mỗi 3–5 giây khi còn dòng đang xử lý
- [ ] P08-3 C07: `ChatPanel` (select khóa, bong bóng, "Nguồn: tài liệu, trang n", trạng thái đang trả lời, nút Thử lại), trạng thái chưa ghi danh khóa nào / khóa chưa có tài liệu, giới hạn 1000 ký tự
### Gọi API (http)
- [ ] P08-4 `services/http/admin-ai-docs.http.ts` (multipart), `ai-chat.http.ts`; hook làm mới định kỳ khi còn `PENDING|PROCESSING`
### Backend
- [ ] P08-5 `lib/rag-client.ts`: `ingest`, `query`, `deleteDocument`, `deleteCourse` (timeout, ánh xạ lỗi — [[api-internal-rag]])
- [ ] P08-6 `modules/ai-documents`: list / POST (multipart → Cloudinary → `PENDING` → `/ingest` → `PROCESSING`) / reingest / delete (RAG trước, DB sau; **giữ file** nếu có `lesson_id`)
- [ ] P08-7 Thay bản no-op `IngestDispatcher`/`VectorCleaner` của P04 bằng bản thật: upload PDF bài học ⇒ ingest; xóa bài/khóa ⇒ xóa vector
- [ ] P08-8 `modules/internal`: `POST /internal/ai-documents/:id/status` (kiểm key; chuyển trạng thái hợp lệ; `404` khi đã xóa); `jobs/stuck-document-sweeper.ts` (5 phút; > 15 phút ⇒ `FAILED/TIMEOUT`)
- [ ] P08-9 `modules/ai-chat`: `GET /ai/courses`, `GET …/messages`, `POST …/ask` (kiểm ghi danh + có tài liệu `READY`; lưu `ai_messages` gồm `sources`; **không lưu khi lỗi**; rate limit 10/phút/người dùng)
### Cập nhật DB
- [ ] P08-10 `schema.prisma`: thêm `AiMessage` + `User.aiMessages`, `Course.aiMessages` ([[database-erd]])
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p08_ai_messages`

## Checklist test tay (Tech Lead — bật 3 terminal: backend, rag-service, frontend)
- [ ] GV tải PDF ở A05 ⇒ "Đang xử lý" → "Đã nạp"; PDF ảnh quét ⇒ "Lỗi" + lý do; **Nạp lại** hoạt động; xóa tài liệu ⇒ AI không còn trích nguồn đó
- [ ] SV hỏi ⇒ có câu trả lời + "Nguồn: tên tài liệu, trang n"; câu ngoài tài liệu ⇒ thông báo không tìm thấy; chưa ghi danh ⇒ bị chặn
- [ ] Tắt rag-service rồi hỏi ⇒ báo lỗi thân thiện + Thử lại (và không lưu lượt hỏi lỗi)
- [ ] Khóa A không rò nội dung sang khóa B; hỏi > 10 câu/phút ⇒ 429

## Rủi ro
Callback không tới ⇒ kiểm `API_CALLBACK_BASE_URL` trong `rag-service/.env` (mặc định `http://localhost:4000`); job quét treo là lưới an toàn. Chuẩn bị sẵn tài liệu đã nạp trước khi demo (quota Gemini).
