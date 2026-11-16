---
id: coding-standards-rag-python
title: Luật code RAG service (Python/FastAPI)
type: rule
status: stable
tags: [rules, python, fastapi, rag]
related: [coding-standards, architecture-rag-service, api-internal-rag, testing-strategy, concept-rag-overview]
source: "Đồ án §2.2.5.4"
updated: 2026-11-15
---
# Luật Python (RAG)

- Python ≥ 3.11; **type hint đầy đủ**; `mypy --strict` sạch; `ruff` (lint + format) sạch. Phụ thuộc ghim trong `pyproject.toml`/lockfile.
- **pydantic v2** cho mọi schema request/response (khớp [[api-internal-rag]]); không dùng `dict` trần ở biên.
- Cấm `Any` không có lý do; cấm `except Exception: pass`. Bắt lỗi cụ thể; ingest bọc toàn bộ để **luôn gửi callback** `READY|FAILED`.
- `async def` chỉ khi thật sự `await` I/O (httpx async, Gemini async). Hàm CPU/blocking (pypdf, chunk, Chroma sync) chạy `run_in_threadpool`.
- Cấu hình duy nhất qua `config.py` (`pydantic-settings`); không `os.getenv` rải rác.
- Mọi endpoint (trừ `/health`) phụ thuộc `verify_key` (so sánh hằng thời gian `hmac.compare_digest`).
- Truy vấn Chroma **bắt buộc** `where={"course_id": …}`; có test chứng minh không rò sang khóa khác.
- Gemini: retry có backoff (429/5xx), giới hạn kích thước lô; model name từ env; prompt đặt ở `prompts.py` (không rải trong code).
- Log JSON; **không** log nội dung tài liệu/câu hỏi ở INFO; log `documentId`, `courseId`, thời gian, số chunk.
- Tải file: chỉ `https`, giới hạn 12 MB, timeout 30 s, chặn địa chỉ nội bộ (SSRF: từ chối `localhost`, dải riêng) vì URL do backend cung cấp nhưng vẫn phòng thủ.
- Test: pytest; Gemini và embedding **giả (fake)**; Chroma `EphemeralClient`; test cho `NO_TEXT_LAYER`, idempotent ingest, filter `course_id`, `found=false`.
- Chạy: `python -m venv .venv`, `pip install -r requirements.txt`, `uvicorn app.main:app --host 127.0.0.1 --port 8000` — **một worker** (không dùng `--workers`) ([[adr-005-chromadb-embedded]]). `.venv/` và `data/` không commit.
