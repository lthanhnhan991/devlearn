---
id: adr-012-rag-async-ingest-callback
title: ADR-012 — Nạp tài liệu bất đồng bộ + callback
type: decision
status: accepted
tags: [adr, rag, async]
related: [concept-rag-ingestion, api-internal-rag, architecture-rag-service]
source: "Hình 3-3 (bước 9, 16, 17)"
updated: 2026-11-15
---
# ADR-012 — Ingest bất đồng bộ, RAG gọi callback

## Quyết định
`POST /ingest` trả `202` ngay; RAG xử lý bằng `BackgroundTasks` và **callback** `POST /internal/ai-documents/:id/status` khi xong/lỗi. FE poll `GET /admin/ai-documents`. Backend có job quét `PROCESSING` quá 15 phút ⇒ `FAILED/TIMEOUT`.

## Phương án
- Backend polling RAG: thêm endpoint trạng thái ở RAG (RAG phải nhớ trạng thái) — trái nguyên tắc RAG stateless nghiệp vụ.
- Hàng đợi (Redis/BullMQ, Celery): quá nặng cho phạm vi.

## Hệ quả
- (+) Đúng sơ đồ tuần tự (bước 16–17); RAG không đụng Postgres.
- (−) Tác vụ nền mất khi RAG restart giữa chừng ⇒ job quét + **Nạp lại** là lưới an toàn.
