---
id: adr-003-fastapi-separate-rag-service
title: ADR-003 — Dịch vụ RAG riêng bằng Python/FastAPI
type: decision
status: accepted
tags: [adr, rag, fastapi]
related: [architecture-rag-service, api-internal-rag, concept-rag-overview]
source: "Đồ án §2.2.2 (3)"
updated: 2026-11-15
---
# ADR-003 — RAG tách thành dịch vụ Python/FastAPI

## Bối cảnh
Cần đọc PDF, cắt đoạn, embedding, vector DB — hệ sinh thái Python phong phú hơn Node.

## Quyết định
Dịch vụ **độc lập** `rag-service/` (FastAPI). Backend Node giữ nghiệp vụ, **kiểm quyền trước** rồi gọi RAG qua REST nội bộ. Giao diện nhỏ: `/ingest`, `/query` (+ xóa vector, health). RAG không đọc Postgres, không xác thực người dùng, không mở Internet; bảo vệ bằng `X-Internal-Key`.

## Phương án
- Làm RAG bằng Node (LangChain.js): ít dịch vụ hơn nhưng thư viện PDF/embedding kém đầy đủ, phải tự viết nhiều.
- Gọi Gemini thẳng từ Express, không vector DB: không đáp ứng truy xuất theo ngữ nghĩa.

## Hệ quả
- (+) Mỗi dịch vụ một nhiệm vụ; thay đổi AI không đụng nghiệp vụ.
- (−) Thêm một dịch vụ phải chạy/test ⇒ chạy thêm một terminal (`uvicorn`) + giữ hợp đồng nhỏ ([[api-internal-rag]]).
