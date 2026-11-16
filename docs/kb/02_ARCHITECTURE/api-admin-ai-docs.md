---
id: api-admin-ai-docs
title: API — Admin: Tài liệu cho Trợ lý AI
type: api
status: stable
tags: [api, admin, ai, rag]
related: [api-contracts, concept-rag-ingestion, api-internal-rag, plan-phase-08-ai-chat-and-docs]
source: "UC11, UC15; UI A05"
updated: 2026-11-15
---
# API — Admin / AI documents

Quyền: owner (👤)/ADMIN (🌐). TEACHER chỉ thấy tài liệu thuộc khóa của mình.

## DTO
```ts
interface AiDocumentDto { id: string; courseId: string; courseTitle: string; lessonId: string | null; fileName: string; fileUrl: string;
  status: 'PENDING'|'PROCESSING'|'READY'|'FAILED'; errorMessage: string | null; uploadedAt: ISODate }
```
`errorMessage` ∈ `NO_TEXT_LAYER | DOWNLOAD_FAILED | EMBEDDING_FAILED | RAG_UNREACHABLE | TIMEOUT | null`. FE map sang câu tiếng Việt (bảng ở `labels.ts`).

## `GET /admin/ai-documents`
Query: `courseId`, `status`, `page`, `pageSize` (mặc định 20). Sắp `uploadedAt` giảm dần.
```json
{ "data": [ { "id": "d-1", "courseId": "c-1", "courseTitle": "Nhập môn Python", "lessonId": null, "fileName": "python-co-ban.pdf",
              "fileUrl": "https://res.cloudinary.com/…", "status": "READY", "errorMessage": null, "uploadedAt": "…" } ],
  "meta": { "page": 1, "pageSize": 20, "total": 3, "totalPages": 1 } }
```
FE poll endpoint này mỗi 3–5 giây khi còn dòng `PENDING|PROCESSING`.

## `POST /admin/ai-documents`
`multipart/form-data`: `courseId` (text) + `file` (PDF ≤ 10 MB).
`202` ⇒ `{ "data": AiDocumentDto }` với `status: "PROCESSING"` (hoặc `FAILED/RAG_UNREACHABLE` nếu không gọi được RAG; bản ghi vẫn tạo để GV **Nạp lại**).
Lỗi: `400`, `403` (không phải chủ khóa), `413`, `415`.

## `POST /admin/ai-documents/:documentId/reingest`
Không body. `202` ⇒ `{ "data": AiDocumentDto }` (`PROCESSING`). Cho phép khi `FAILED` hoặc `READY`; đang `PROCESSING|PENDING` ⇒ `409 DOCUMENT_BUSY`.

## `DELETE /admin/ai-documents/:documentId`
`204`. Thứ tự: `DELETE {RAG}/documents/{id}` → (file Cloudinary nếu `lessonId = null`) → xóa DB. RAG lỗi ⇒ `502 AI_UNAVAILABLE`, giữ nguyên bản ghi.

## Trạng thái → nhãn UI
`PENDING|PROCESSING` "Đang xử lý" · `READY` "Đã nạp" · `FAILED` "Lỗi" ([[ui-design-system]]).
