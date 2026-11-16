---
id: api-internal-rag
title: API nội bộ — Backend ↔ RAG service (+ callback)
type: api
status: stable
tags: [api, internal, rag, fastapi]
related: [api-contracts, concept-rag-overview, concept-rag-ingestion, concept-rag-query, architecture-rag-service, adr-012-rag-async-ingest-callback]
source: "Đồ án §2.2.5.4, Hình 3-3, 3-4"
updated: 2026-11-15
---
# API nội bộ RAG

**Không công khai.** Mọi request có header `X-Internal-Key: <INTERNAL_KEY>` (sai/thiếu ⇒ `401`). Lỗi RAG dạng FastAPI: `{ "detail": { "code": "…", "message": "…" } }`; backend ánh xạ về `AI_UNAVAILABLE`/`AI_TIMEOUT` ([[concept-rag-query]]).

## I1 · `POST {RAG}/ingest` (Backend → RAG, bất đồng bộ)
```json
{ "courseId": "c-1", "documentId": "d-1", "fileUrl": "https://res.cloudinary.com/…/python-co-ban.pdf", "fileName": "python-co-ban.pdf" }
```
`202` ⇒ `{ "accepted": true, "documentId": "d-1" }` ngay lập tức; xử lý nền. Xóa vector cũ của `documentId` trước khi ghi mới (idempotent). Lỗi `422` nếu sai schema.

## I2 · `POST {RAG}/query` (Backend → RAG, đồng bộ)
```json
{ "courseId": "c-1", "question": "Giải thích vòng lặp for trong bài 3.", "topK": 5 }
```
```json
// 200
{ "answer": "Vòng lặp for dùng để duyệt…", "found": true,
  "sources": [ { "documentId": "d-1", "fileName": "python-co-ban.pdf", "page": 12, "snippet": "for i in range(…", "score": 0.82 } ] }
```
`found=false` ⇒ `answer` = thông điệp chuẩn, `sources = []`. `topK` tùy chọn (1–10, mặc định `TOP_K`). Backend **bỏ** `score` khi trả cho FE.

## I3 · `DELETE {RAG}/documents/{documentId}` (idempotent)
`204` kể cả khi không có vector.

## I4 · `DELETE {RAG}/courses/{courseId}` (idempotent)
`204`. Xóa mọi vector có `course_id` đó.

## I5 · `GET {RAG}/health`
`200 { "status": "ok", "chroma": "ok" }` — không cần key (để kiểm tra nhanh bằng `curl` và giám sát).

## Callback · `POST {API}/internal/ai-documents/:documentId/status` (RAG → Backend)
Header `X-Internal-Key`. Không thuộc `/api/v1` công khai: route mount ở `/internal`, **chặn ở reverse proxy** ngoài Internet.
```json
{ "status": "READY", "chunkCount": 48 }
{ "status": "FAILED", "errorMessage": "NO_TEXT_LAYER" }
```
Backend: `200 { "ok": true }`. Quy tắc: chỉ chấp nhận chuyển từ `PROCESSING|PENDING` → `READY|FAILED`; callback đến muộn cho bản ghi đã bị xóa ⇒ `404` (RAG bỏ qua). RAG retry 3 lần (backoff 1s/3s/9s) nếu backend không phản hồi. Xem [[adr-012-rag-async-ingest-callback]].

## Timeout & thử lại (phía Backend)
| Lệnh gọi | Timeout | Thử lại |
|---|---|---|
| `/ingest` | 10 s (chỉ chờ `202`) | không (lỗi ⇒ `FAILED/RAG_UNREACHABLE`) |
| `/query` | `RAG_TIMEOUT_MS` (15 s) | không (tránh nhân đôi chi phí) |
| `DELETE …` | 10 s | 1 lần |
