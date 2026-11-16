---
id: adr-010-unify-documents-into-ai-documents
title: ADR-010 — Gộp bảng documents vào ai_documents
type: decision
status: accepted
tags: [adr, database, ai]
related: [database-prisma-schema-exam-ai, concept-rag-ingestion, delta-vs-thesis, api-admin-content]
source: "Đồ án §3.1.1, §3.1.2 (mâu thuẫn giữa hai bảng)"
updated: 2026-11-15
---
# ADR-010 — Một bảng `ai_documents`

## Bối cảnh (mâu thuẫn trong Đồ án)
Mức vật lý có **cả** `documents(lesson_id, status…)` **và** `ai_documents(course_id, uploaded_by, status…)` — cùng trạng thái, cùng vai trò (nạp RAG). Mức luận lý chỉ có `ai_documents`. Quy trình §2.3.1.2 bước 4 nói tải PDF bài giảng ⇒ "bắt đầu xử lý cho Trợ lý AI"; màn A05 quản lý tài liệu AI theo **khóa**.

## Quyết định
Chỉ giữ `ai_documents`, thêm `lesson_id` (nullable, unique) và `file_public_id`, `error_message`.
- Upload bài học PDF ⇒ tự tạo `ai_documents(lesson_id)` + nạp.
- Tải ở màn Tài liệu AI ⇒ `ai_documents(lesson_id = NULL)`.
- Xóa tài liệu có `lesson_id` ⇒ chỉ xóa vector + bản ghi, **giữ** file của bài học.

## Hệ quả
- (+) Một nguồn sự thật cho trạng thái nạp; A05 liệt kê đầy đủ.
- (−) Cần xác nhận với giảng viên hướng dẫn (ghi ở [[OPEN_QUESTIONS]] Q-01).
