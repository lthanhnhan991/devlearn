---
id: api-ai-chat
title: API — Trợ lý AI (phía SV)
type: api
status: stable
tags: [api, ai, rag, chat]
related: [api-contracts, concept-rag-query, api-internal-rag, plan-phase-08-ai-chat-and-docs]
source: "UC07; UI C07"
updated: 2026-11-15
---
# API — AI chat

## `GET /ai/courses` 🎓
Các khóa đã ghi danh (cho ô chọn khóa).
```json
{ "data": [ { "id": "c-1", "title": "Nhập môn Python", "hasReadyDocuments": true },
            { "id": "c-2", "title": "SQL cơ bản", "hasReadyDocuments": false } ] }
```

## `GET /ai/courses/:courseId/messages` 🎓
Query: `limit` (mặc định 50, tối đa 100). Trả `limit` lượt **gần nhất**, sắp cũ → mới. Yêu cầu đã ghi danh.
```json
{ "data": [ { "id": "msg-1", "question": "Giải thích vòng lặp for trong bài 3.",
              "answer": "Vòng lặp for dùng để duyệt…", "found": true,
              "sources": [ { "documentId": "d-1", "fileName": "python-co-ban.pdf", "page": 12, "snippet": "for i in range(…" } ],
              "createdAt": "2026-11-15T08:00:00.000Z" } ] }
```
`found` suy ra: `sources.length > 0`.

## `POST /ai/courses/:courseId/ask` 🎓
Rate limit **10 request/phút/người dùng**.
```json
// Request
{ "question": "Giải thích vòng lặp for trong bài 3." }
```
Validate: `question` 1–1000 ký tự sau trim.
```json
// 201 — có thông tin
{ "data": { "id": "msg-2", "question": "…", "answer": "…", "found": true,
            "sources": [ { "documentId": "d-1", "fileName": "python-co-ban.pdf", "page": 12, "snippet": "…" } ],
            "createdAt": "2026-11-15T08:01:00.000Z" } }
```
```json
// 201 — không tìm thấy (vẫn lưu lượt hỏi)
{ "data": { "id": "msg-3", "question": "…", "answer": "Tôi không tìm thấy thông tin này trong tài liệu của khóa học.",
            "found": false, "sources": [], "createdAt": "…" } }
```
Lỗi: `400`, `401`, `403 NOT_ENROLLED`, `409 NO_READY_DOCUMENTS`, `429 RATE_LIMITED`, `502 AI_UNAVAILABLE`, `504 AI_TIMEOUT` (hai lỗi cuối **không** lưu `ai_messages`).

Trình tự phía backend: authenticate → enrolled? → có `ai_documents READY`? → `rag-client.query` → lưu `ai_messages` → trả. Xem [[concept-rag-query]].
