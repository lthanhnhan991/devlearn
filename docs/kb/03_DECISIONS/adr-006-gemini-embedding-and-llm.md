---
id: adr-006-gemini-embedding-and-llm
title: ADR-006 — Gemini cho embedding và sinh câu trả lời
type: decision
status: accepted
tags: [adr, gemini, llm]
related: [concept-rag-query, architecture-rag-service]
source: "Đồ án §2.2.2 (6)"
updated: 2026-11-15
---
# ADR-006 — Gemini (Flash + Embedding)

## Quyết định
Dùng **Gemini API** cho cả embedding và sinh câu trả lời (dòng Flash). Gọi qua API ⇒ không cần GPU; một nhà cung cấp giúp luồng đồng bộ. Tên model **cấu hình bằng env**, không hardcode.

## Rủi ro & giảm thiểu
| Rủi ro | Giảm thiểu |
|---|---|
| Giới hạn tốc độ gói miễn phí | rate limit 10 câu/phút/người dùng; retry + backoff ở RAG |
| Dữ liệu gửi đi có thể được dùng cải thiện sản phẩm | demo chỉ dùng tài liệu học tập không nhạy cảm |
| Model đổi tên/ngừng hỗ trợ | env `GEMINI_*_MODEL`; bọc sau `core/embeddings.py`, `core/llm.py` để thay nhà cung cấp |
| Chất lượng "bịa" | prompt grounding + sentinel `__NOT_FOUND__` + ngưỡng `MIN_RELEVANCE` ([[concept-rag-query]]) |

## Hệ quả
Đổi embedding model ⇒ **phải nạp lại toàn bộ tài liệu** (không trộn vector khác model trong cùng collection).
