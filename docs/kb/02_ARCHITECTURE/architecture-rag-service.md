---
id: architecture-rag-service
title: RAG service (Python/FastAPI) — cấu trúc & pipeline
type: architecture
status: stable
tags: [rag, fastapi, python, chromadb, gemini]
related: [concept-rag-overview, api-internal-rag, coding-standards-rag-python, adr-003-fastapi-separate-rag-service, adr-005-chromadb-embedded, adr-012-rag-async-ingest-callback]
source: "Đồ án §2.2.5.4"
updated: 2026-11-15
---
# RAG service

## Cấu trúc
```
rag-service/
├─ app/
│  ├─ main.py            # FastAPI app, include routers, exception handlers
│  ├─ config.py          # pydantic-settings: đọc env
│  ├─ prompts.py         # SYSTEM_PROMPT, hàm build_prompt()
│  ├─ api/{ingest.py,query.py,documents.py,health.py,deps.py}   # deps.py: verify X-Internal-Key
│  ├─ schemas/           # pydantic v2: IngestRequest, QueryRequest, QueryResponse, Source
│  ├─ core/{pdf.py,chunker.py,embeddings.py,llm.py,store.py,downloader.py}
│  └─ services/{ingest_service.py,query_service.py,callback_client.py}
├─ tests/                # pytest; fake embeddings/LLM; chroma EphemeralClient
├─ requirements.txt · pyproject.toml (cấu hình ruff, mypy) · .env.example
```

## Module lõi
| Module | Hàm chính | Ghi chú |
|---|---|---|
| `downloader` | `download_pdf(url) -> bytes` | httpx stream, giới hạn 12 MB, timeout 30 s, chỉ cho `https` |
| `pdf` | `extract_pages(bytes) -> list[PageText]` | `pypdf`; bỏ trang rỗng; không có trang nào ⇒ `NoTextLayer` |
| `chunker` | `split_page(text, size, overlap) -> list[str]` | cắt theo đoạn/câu, **không vượt ranh giới trang** |
| `embeddings` | `embed_documents(list[str])`, `embed_query(str)` | Gemini Embedding; gửi theo lô; thử lại 3 lần + backoff khi 429/5xx |
| `store` | `upsert(chunks)`, `search(vec, course_id, k)`, `delete_by_document(id)`, `delete_by_course(id)` | Chroma `PersistentClient(path=CHROMA_PERSIST_DIR)`; collection `devlearn_chunks`, `cosine` |
| `llm` | `generate(prompt) -> str` | Gemini Flash; `temperature` thấp (0.2) |
| `callback_client` | `notify(document_id, status, ...)` | POST về backend kèm `X-Internal-Key`, retry 3 lần |

## Pipeline ingest (chạy nền)
```python
@router.post("/ingest", status_code=202)
async def ingest(req: IngestRequest, bg: BackgroundTasks, _=Depends(verify_key)):
    bg.add_task(ingest_service.run, req)      # trả 202 ngay
    return {"accepted": True, "documentId": req.documentId}

# ingest_service.run:
#   delete_by_document(id) → download → extract_pages → chunk → embed(batch) → upsert → notify(READY, chunkCount)
#   mọi exception → notify(FAILED, errorMessage=<mã>) ; KHÔNG để rơi mất callback
```
- Tác vụ nền chạy trong process (đủ cho quy mô đồ án). Hàm CPU/blocking (pypdf, chunk) bọc bằng `run_in_threadpool`.
- 1 worker uvicorn (Chroma persistent không an toàn đa tiến trình ghi đồng thời) — ghi chú ở [[architecture-deployment-env]].

## Pipeline query
```python
vec = embed_query(q)
hits = store.search(vec, course_id=req.courseId, k=TOP_K)        # BẮT BUỘC filter course_id
hits = [h for h in hits if h.similarity >= MIN_RELEVANCE]
if not hits: return QueryResponse(found=False, answer=NOT_FOUND_MSG, sources=[])
text = llm.generate(build_prompt(q, hits))
if text.strip() == "__NOT_FOUND__": return not_found
return QueryResponse(found=True, answer=text, sources=dedupe_sources(hits))
```
`similarity = 1 - distance` (Chroma cosine distance).

## Bảo mật
- `verify_key`: so sánh hằng thời gian `X-Internal-Key` với `INTERNAL_KEY` ⇒ sai `401`.
- Chạy `uvicorn … --host 127.0.0.1 --port 8000` (chỉ máy local gọi được). Khi triển khai thật: đặt sau mạng nội bộ/tường lửa, không mở ra Internet.
- `GEMINI_API_KEY` chỉ ở env của service này; không log nội dung tài liệu/câu hỏi ở mức INFO.

## Quan sát
`GET /health` ⇒ `{status:"ok", chroma:"ok", collectionCount}`. Log JSON: `documentId`, `courseId`, thời gian từng bước.
