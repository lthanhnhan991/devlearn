---
id: plan-phase-07-rag-service
title: Phase 07 — Dịch vụ RAG (Python/FastAPI) (UC15)
type: plan
status: living
tags: [plan, rag, python, chromadb, gemini]
related: [plan-00-overview, architecture-rag-service, api-internal-rag, concept-rag-ingestion, concept-rag-query, coding-standards-rag-python, adr-012-rag-async-ingest-callback]
source: "UC15; Đồ án §2.2.5.4"
updated: 2026-11-15
---
# Phase 07 — RAG service

**Đặc thù**: không có UI; chạy **song song** với các phase FE/BE sau P00. Quy trình: *Contract → test với fake → cài đặt → tích hợp thật*. **Phụ thuộc**: P00 (spike Gemini). Chạy bằng `uvicorn` + `pytest` trong `rag-service/` (không Docker). **FILE_MAPPING**: IN-07. **Cỡ**: L.

## 1 — Hợp đồng & khung
- [ ] P07-1 Pydantic schemas khớp [[api-internal-rag]] (`IngestRequest`, `QueryRequest/Response`, `Source`); test schema bằng ví dụ JSON trong tài liệu
- [ ] P07-2 `config.py`, `verify_key` (`hmac.compare_digest`), `main.py`, `/health`
- [ ] P07-3 `cd rag-service && python -m venv .venv`, kích hoạt, `pip install -r requirements.txt` (ghim phiên bản); chạy `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` (một worker)
- [ ] P07-3b Spike Chroma: `PersistentClient` ghi/đọc ở `rag-service/data/chroma/`, tắt/bật lại vẫn còn dữ liệu

## 2 — Lõi (test với fake, TDD)
- [ ] P07-4 `core/downloader.py` (https-only, ≤ 12 MB, timeout, chặn SSRF) + test
- [ ] P07-5 `core/pdf.py` (`pypdf`, theo trang, `NoTextLayer`) + test với PDF có chữ / PDF ảnh
- [ ] P07-6 `core/chunker.py` (size/overlap, không vượt trang, metadata `page`, `chunk_index`) + test biên
- [ ] P07-7 `core/embeddings.py` (interface + `GeminiEmbeddings` + `FakeEmbeddings`; lô, retry/backoff)
- [ ] P07-8 `core/store.py` (Chroma `PersistentClient`, collection cosine; `upsert/search/delete_by_document/delete_by_course`) + test **lọc `course_id` không rò sang khóa khác**
- [ ] P07-9 `core/llm.py` (interface + `GeminiLLM` + `FakeLLM`); `prompts.py` ([[concept-rag-query]])

## 3 — Dịch vụ
- [ ] P07-10 `services/ingest_service.py`: xóa vector cũ → tải → trích → chunk → embed → upsert → `callback_client.notify`; **mọi lỗi ⇒ callback `FAILED` với mã** ([[concept-rag-ingestion]])
- [ ] P07-11 `services/callback_client.py` (retry 1s/3s/9s, `X-Internal-Key`)
- [ ] P07-12 `api/ingest.py` (`202` + `BackgroundTasks`), `api/query.py` (ngưỡng `MIN_RELEVANCE`, sentinel `__NOT_FOUND__`, dedupe nguồn), `api/documents.py` (2 DELETE idempotent)
- [ ] P07-13 Chế độ `RAG_FAKE_PROVIDER=true` dùng fake cho E2E

## 4 — Kiểm thử
- [ ] P07-14 pytest: ingest idempotent (2 lần không nhân đôi), `NO_TEXT_LAYER`, `DOWNLOAD_FAILED`, `found=false`, filter khóa, callback gọi đúng khi thành công/thất bại
- [ ] P07-15 `ruff`, `mypy --strict` sạch
- [ ] P07-16 **Smoke thật** với Gemini: nạp 1 PDF tiếng Việt ~20 trang, hỏi 5 câu; đo thời gian (mục tiêu ≤ 5 s); ghi kết quả + tinh chỉnh `CHUNK_*`, `TOP_K`, `MIN_RELEVANCE` vào [[PROGRESS]]
- [ ] P07-17 Đo chất lượng sơ bộ: 10 câu hỏi vàng (có/không có trong tài liệu) ⇒ tỷ lệ trả lời đúng/`found=false` đúng

## Definition of Done
- [ ] Mọi ví dụ trong [[api-internal-rag]] chạy đúng bằng `curl` · [ ] test xanh · [ ] không log nội dung tài liệu ở INFO

## Rủi ro
Chất lượng tiếng Việt/PDF phức tạp (bảng, cột) ⇒ chấp nhận giới hạn, ghi vào tài liệu demo. Quota Gemini ⇒ dùng fake (`RAG_FAKE_PROVIDER=true`) khi chạy test.
