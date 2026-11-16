---
id: adr-005-chromadb-embedded
title: ADR-005 — ChromaDB nhúng trong dịch vụ RAG
type: decision
status: accepted
tags: [adr, vector, chromadb]
related: [architecture-rag-service, concept-rag-ingestion]
source: "Đồ án §2.2.2 (5), §2.2.5.3"
updated: 2026-11-15
---
# ADR-005 — ChromaDB (persistent, nhúng)

## Quyết định
ChromaDB chạy **nhúng** trong tiến trình RAG (`PersistentClient`), dữ liệu ở volume `rag_data`. Một collection `devlearn_chunks`, `cosine`, lọc theo metadata `course_id`.

## Phương án
- pgvector: gộp một CSDL nhưng kéo RAG vào Postgres, phá ranh giới "RAG không đụng DB nghiệp vụ".
- Chroma server riêng: thêm một container không cần thiết ở quy mô này.

## Hệ quả
- (+) Đơn giản, tách biệt vector khỏi dữ liệu nghiệp vụ.
- (−) **Một worker** uvicorn (ghi đồng thời nhiều tiến trình không an toàn); mở rộng ngang cần đổi sang Chroma server ([[architecture-deployment-env]]).
- Bắt buộc filter `course_id` ở mọi truy vấn ([[concept-rag-overview]]).
