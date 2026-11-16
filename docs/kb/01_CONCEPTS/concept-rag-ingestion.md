---
id: concept-rag-ingestion
title: RAG — Nạp tài liệu PDF (UC11, UC15)
type: concept
status: stable
tags: [rag, ingestion, ai-documents, uc15]
related: [concept-rag-overview, concept-rag-query, concept-file-storage, adr-010-unify-documents-into-ai-documents, adr-012-rag-async-ingest-callback, api-admin-ai-docs, api-internal-rag]
source: "Đồ án §2.3.1.5, UC15, Hình 3-3, 3-6"
updated: 2026-11-15
---
# Nạp tài liệu (Ingestion)

## Hai đường vào, một bảng
1. **Màn Tài liệu AI** (ADMIN·05): kéo-thả PDF + chọn khóa ⇒ `ai_documents(lesson_id = NULL)`.
2. **Upload bài học PDF** (ADMIN·03): tự tạo `ai_documents(lesson_id = <id>)` ([[adr-010-unify-documents-into-ai-documents]]).

## Máy trạng thái `ai_documents.status`
```
PENDING ──(RAG nhận 202)──► PROCESSING ──(callback ok)──► READY
   │                            │
   └──(RAG không gọi được)──────┴──(callback lỗi / quá 15 phút)──► FAILED ──(Nạp lại)──► PENDING
```
| Mã | Nhãn UI | Ghi chú |
|---|---|---|
| `PENDING`, `PROCESSING` | Đang xử lý | FE poll `GET /admin/ai-documents` mỗi 3–5 giây khi còn dòng đang xử lý |
| `READY` | Đã nạp | SV mới hỏi được |
| `FAILED` | Lỗi | hiển thị `errorMessage`; nút **Nạp lại** |

## Luồng chi tiết (Hình 3-3)
1. GV chọn khóa + PDF → `POST /admin/ai-documents` (multipart).
2. Backend: xác thực JWT, quyền owner, **MIME `application/pdf` + magic bytes `%PDF`**, ≤ 10 MB.
3. Upload Cloudinary → `fileUrl`, `filePublicId`.
4. INSERT `ai_documents` `PENDING` → trả `202` kèm bản ghi.
5. Backend gọi `POST {RAG}/ingest {courseId, documentId, fileUrl, fileName}` (không chờ xử lý) → nhận `202` ⇒ UPDATE `PROCESSING`.
6. RAG (background): tải PDF → trích text **theo trang** → cắt đoạn trong trang → embedding theo lô → upsert Chroma.
7. RAG gọi callback `POST {API}/internal/ai-documents/:id/status {status, chunkCount?, errorMessage?}` ⇒ Backend UPDATE `READY|FAILED`.

## Metadata mỗi chunk (Chroma)
`id = "{documentId}:{chunkIndex}"`; metadata: `course_id`, `document_id`, `file_name`, `page` (1-based), `chunk_index`; `documents` = nội dung đoạn. Collection `devlearn_chunks`, `hnsw:space = cosine`.

## Lỗi & mã `errorMessage`
| Mã | Nguyên nhân |
|---|---|
| `NO_TEXT_LAYER` | PDF không trích được văn bản (ảnh quét) |
| `DOWNLOAD_FAILED` | RAG không tải được `fileUrl` (hết hạn/chặn PDF trên Cloudinary) |
| `EMBEDDING_FAILED` | Gemini lỗi/quota |
| `RAG_UNREACHABLE` | Backend không gọi được RAG |
| `TIMEOUT` | PROCESSING > 15 phút (tác vụ quét định kỳ của backend) |

## Idempotent & Nạp lại
- `/ingest` **xóa vector cũ của `documentId` trước** rồi mới ghi mới ⇒ gọi lại an toàn.
- **Nạp lại** = đặt `PENDING`, xóa `errorMessage`, gọi lại `/ingest` với cùng `documentId`.

## Xóa (UC11, nhất quán dữ liệu)
```
1. DELETE {RAG}/documents/{id}   (idempotent; 404 coi như thành công)
2. nếu RAG lỗi → 502, KHÔNG xóa DB (cho phép thử lại)
3. xóa file Cloudinary CHỈ KHI lesson_id IS NULL (file của bài học thuộc về lesson)
4. DELETE ai_documents
```
Xóa khóa học ⇒ `DELETE {RAG}/courses/{courseId}` một lần.

## Quét treo
Backend chạy job mỗi 5 phút: `status IN (PENDING, PROCESSING) AND uploaded_at < now() - 15 phút` ⇒ `FAILED/TIMEOUT`.
