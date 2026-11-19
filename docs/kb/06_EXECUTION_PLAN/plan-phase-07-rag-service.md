---
id: plan-phase-07-rag-service
title: Phase 07 — Dịch vụ RAG (Python/FastAPI) (UC15)
type: plan
status: living
tags: [plan, rag, python, chromadb, gemini]
related: [plan-00-overview, workflow-solo-dev, architecture-rag-service, api-internal-rag, concept-rag-ingestion, concept-rag-query, coding-standards-rag-python, adr-012-rag-async-ingest-callback, architecture-deployment-env]
source: "UC15; Đồ án §2.2.5.4"
updated: 2026-11-15
---
# Phase 07 — RAG service

**Đặc thù**: không có UI/DTO phía frontend (bỏ bước 1 của [[workflow-solo-dev]]); chỉ code `rag-service/`, Tech Lead test bằng `curl`. **Phụ thuộc**: không (độc lập, làm xen kẽ được). **FILE_MAPPING**: IN-07. **Cỡ**: L. Chạy trực tiếp bằng `uvicorn`, không Docker.

## Việc đầu tiên (nếu chưa làm)
- [ ] P07-0 **Spike Gemini** (Q-10): tra tài liệu Google chọn tên model embedding + Flash hiện hành; thử 1 embedding + 1 generate bằng `curl`; ghi vào [[OPEN_QUESTIONS]] và `rag-service/.env`

## Việc cần làm
### Khung
- [ ] P07-1 `rag-service/`: `requirements.txt` (ghim phiên bản), `.env.example`, `app/main.py`, `config.py` (pydantic-settings), `GET /health` ([[architecture-deployment-env]])
- [ ] P07-2 Schemas pydantic khớp [[api-internal-rag]] (`IngestRequest`, `QueryRequest/Response`, `Source`); `verify_key` (`hmac.compare_digest`) cho mọi endpoint trừ `/health`
### Lõi
- [ ] P07-3 `core/downloader.py` (chỉ https, ≤ 12 MB, timeout, chặn địa chỉ nội bộ); `core/pdf.py` (`pypdf`, theo trang, `NoTextLayer`)
- [ ] P07-4 `core/chunker.py` (size/overlap, **không vượt ranh giới trang**, metadata `page`, `chunk_index`)
- [ ] P07-5 `core/embeddings.py` (Gemini, theo lô, retry/backoff); `core/llm.py` (Gemini Flash); `prompts.py` ([[concept-rag-query]])
- [ ] P07-6 `core/store.py`: Chroma `PersistentClient` ở `rag-service/data/chroma/`, collection `devlearn_chunks` (cosine); `upsert`, `search` (**bắt buộc filter `course_id`**), `delete_by_document`, `delete_by_course`
- [ ] P07-7 Tùy chọn `RAG_FAKE_PROVIDER=true`: embedding/LLM giả để dùng thử không tốn quota Gemini
### Dịch vụ & endpoint
- [ ] P07-8 `services/ingest_service.py`: xóa vector cũ → tải → trích → chunk → embed → upsert → callback; **mọi lỗi ⇒ callback `FAILED` kèm mã** ([[concept-rag-ingestion]]); `services/callback_client.py` (retry 1s/3s/9s, `X-Internal-Key`)
- [ ] P07-9 `POST /ingest` (`202` + `BackgroundTasks`), `POST /query` (ngưỡng `MIN_RELEVANCE`, sentinel `__NOT_FOUND__`, dedupe nguồn), `DELETE /documents/{id}`, `DELETE /courses/{id}` (idempotent)
- [ ] ▶️ Tech Lead chạy: `cd rag-service && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` (một worker)

## Checklist test tay bằng `curl` (Tech Lead)
- [ ] `/health` ok; thiếu/sai `X-Internal-Key` ⇒ 401
- [ ] `/ingest` một PDF có chữ ⇒ `202`, sau đó callback `READY` (hoặc xem log); PDF ảnh quét ⇒ `FAILED/NO_TEXT_LAYER`
- [ ] `/ingest` cùng `documentId` hai lần ⇒ không nhân đôi vector
- [ ] `/query` câu có trong tài liệu ⇒ `found=true` + nguồn (tên file, trang); câu ngoài tài liệu ⇒ `found=false`
- [ ] `/query` với `courseId` khác ⇒ **không** trả nội dung của khóa kia; thời gian trả lời ≤ ~5 s
- [ ] Tinh chỉnh `CHUNK_*`, `TOP_K`, `MIN_RELEVANCE` nếu chất lượng chưa tốt; ghi vào [[PROGRESS]]

## Rủi ro
Tiếng Việt/PDF phức tạp (bảng, nhiều cột) ⇒ chấp nhận giới hạn, ghi vào tài liệu demo. Quota Gemini ⇒ dùng `RAG_FAKE_PROVIDER` khi dùng thử.
