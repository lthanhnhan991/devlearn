---
id: concept-rag-query
title: RAG — Hỏi đáp với Trợ lý AI (UC07)
type: concept
status: stable
tags: [rag, query, chat, uc07]
related: [concept-rag-overview, concept-rag-ingestion, api-ai-chat, api-internal-rag, plan-phase-08-ai-chat-and-docs]
source: "Đồ án §2.3.1.5, UC07, Hình 3-4, 3-7; UI CLIENT 07"
updated: 2026-11-15
---
# Hỏi đáp AI

## Luồng (Hình 3-4/3-7)
1. SV mở **Trợ lý AI**, chọn khóa (chỉ khóa đã ghi danh), nhập câu hỏi (1–1000 ký tự).
2. `POST /ai/courses/:courseId/ask`.
3. Backend kiểm tra: JWT hợp lệ → đã ghi danh → khóa có ≥ 1 `ai_documents READY`.
   - Chưa ghi danh ⇒ `403 NOT_ENROLLED`; chưa có tài liệu ⇒ `409 NO_READY_DOCUMENTS` (UI: "Khóa này chưa có tài liệu cho Trợ lý AI").
4. Backend gọi `POST {RAG}/query {courseId, question, topK}` (timeout `RAG_TIMEOUT_MS`).
5. RAG: embedding(câu hỏi) → Chroma top-k lọc `course_id` → loại đoạn dưới `MIN_RELEVANCE` → nếu rỗng ⇒ `found=false` (không gọi Gemini).
6. Gemini sinh câu trả lời từ ngữ cảnh. RAG trả `{answer, found, sources[]}`.
7. Backend **lưu `ai_messages`** (kể cả `found=false`) rồi trả cho FE. Lỗi 5xx/timeout **không** lưu.

## Chống bịa (grounding)
Prompt hệ thống (Tiếng Việt, rút gọn — đặt ở `rag-service/app/prompts.py`):
```
Bạn là trợ lý học tập của khóa học. Chỉ trả lời dựa trên phần NGỮ CẢNH bên dưới.
Nếu NGỮ CẢNH không đủ thông tin, trả lời đúng một chuỗi: __NOT_FOUND__
Trả lời ngắn gọn, đúng chuyên môn, bằng tiếng Việt; giữ nguyên thuật ngữ/mã nguồn.
NGỮ CẢNH:
[1] (tài liệu: {file_name}, trang {page}) {text}
...
CÂU HỎI: {question}
```
`found=false` khi **không có đoạn đạt ngưỡng** *hoặc* Gemini trả `__NOT_FOUND__`. Khi đó `answer` = "Tôi không tìm thấy thông tin này trong tài liệu của khóa học." và `sources = []`.

## `sources[]`
Mỗi nguồn: `{ documentId, fileName, page, snippet }` — khử trùng theo `(documentId, page)`, tối đa 5. UI hiển thị dòng **"Nguồn: [tên tài liệu], trang [n]"** dưới câu trả lời ([[ui-screens-client]] CLIENT·07). `snippet` ≤ 200 ký tự.

## Lịch sử chat
- `GET /ai/courses/:courseId/messages` trả tối đa 50 lượt gần nhất (cũ → mới) để dựng lại khung chat.
- `ai_messages.sources` (JSON) lưu nguồn để hiển thị lại ([[delta-vs-thesis]] D-05).
- **Không** đưa lịch sử vào prompt (mỗi câu độc lập) — giữ đơn giản, đủ cho phạm vi đồ án.

## Ánh xạ lỗi
| Tình huống | HTTP | `error.code` | UI |
|---|---|---|---|
| Hết giờ / RAG không phản hồi | 504 | `AI_TIMEOUT` | "Trợ lý đang bận, vui lòng thử lại" |
| Gemini/RAG lỗi | 502 | `AI_UNAVAILABLE` | như trên |
| Vượt hạn mức | 429 | `RATE_LIMITED` | "Bạn hỏi quá nhanh…" |
| Không có tài liệu | 409 | `NO_READY_DOCUMENTS` | thông báo khóa chưa có tài liệu |

## Chỉ SV hỏi
GV **không** có màn chat; chỉ tải tài liệu ở khu ADMIN (ghi chú trên CLIENT·07: "Sinh viên chỉ hỏi đáp. Tài liệu cho AI do Giảng viên tải lên ở khu vực Admin.").
