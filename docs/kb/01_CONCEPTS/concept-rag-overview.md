---
id: concept-rag-overview
title: Trợ lý AI (RAG) — Tổng quan
type: concept
status: stable
tags: [rag, ai, gemini, chromadb, f4]
related: [concept-rag-ingestion, concept-rag-query, architecture-rag-service, api-internal-rag, adr-003-fastapi-separate-rag-service, adr-005-chromadb-embedded, adr-006-gemini-embedding-and-llm]
source: "Đồ án §2.2.5.4, UC07, UC11, UC15; UI CLIENT 07, ADMIN 05"
updated: 2026-11-15
---
# Trợ lý AI (RAG) — Tổng quan

RAG = Retrieval-Augmented Generation: trả lời **chỉ dựa trên PDF của khóa học** do GV cung cấp, kèm nguồn (tên tài liệu + số trang).

```
 GV tải PDF ─► Backend ─► Cloudinary (lưu file) ─► Postgres (ai_documents: PENDING)
                  │ POST /ingest (async, 202)
                  ▼
            RAG service ─ tải PDF ─ trích text/trang ─ cắt đoạn ─ embedding(Gemini) ─► ChromaDB
                  │ callback: READY | FAILED
                  ▼
            Backend cập nhật ai_documents.status

 SV hỏi ─► Backend (JWT + ghi danh + có tài liệu READY) ─ POST /query ─► RAG service
            embedding(câu hỏi) ─► Chroma top-k (lọc course_id) ─► Gemini(ngữ cảnh+câu hỏi)
            ◄── { answer, found, sources[] } ──  Backend lưu ai_messages ─► SV
```

## Thành phần & trách nhiệm
| Thành phần | Làm gì | KHÔNG làm gì |
|---|---|---|
| Backend (Express) | Xác thực JWT, kiểm tra quyền/ghi danh, lưu file, quản lý `ai_documents` & `ai_messages`, gọi RAG | Không gọi Gemini, không đụng ChromaDB |
| RAG service (FastAPI) | Trích văn bản, cắt đoạn, embedding, truy xuất, sinh câu trả lời | Không xác thực người dùng, không truy cập Postgres, không mở ra Internet |
| ChromaDB | Lưu vector + metadata (nhúng trong RAG, persist ra volume) | — |
| Gemini API | Embedding + sinh câu trả lời (gọi từ RAG) | — |

## Hợp đồng giữa Backend ↔ RAG
Chi tiết [[api-internal-rag]]: `POST /ingest`, `POST /query`, `DELETE /documents/{id}`, `DELETE /courses/{id}`, `GET /health`; callback `POST /internal/ai-documents/:id/status`. Bảo vệ bằng header `X-Internal-Key` + chỉ nghe trong mạng nội bộ.

## Tham số mặc định (cấu hình bằng env, chỉnh sau khi đo thực tế)
| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | 1000 / 150 ký tự | cắt đoạn (không vượt ranh giới trang) |
| `TOP_K` | 5 | số đoạn truy xuất |
| `MIN_RELEVANCE` | 0.35 | ngưỡng cosine similarity; dưới ngưỡng ⇒ coi như không liên quan |
| `GEMINI_EMBED_MODEL` / `GEMINI_CHAT_MODEL` | *điền theo model hiện hành* | **kiểm tra tên model trên tài liệu Google tại thời điểm triển khai**, không hardcode |
| `RAG_TIMEOUT_MS` (backend) | 15000 | quá hạn ⇒ `504 AI_TIMEOUT` |

## Ràng buộc quan trọng
- **Cô lập theo khóa học**: mọi truy vấn Chroma **bắt buộc** lọc `where={"course_id": ...}`; thiếu filter là lỗi bảo mật (rò rỉ tài liệu khóa khác).
- **Nhất quán**: xóa tài liệu/khóa ⇒ xóa vector tương ứng; xóa vector **trước**, DB **sau** ([[concept-rag-ingestion]]).
- **Quyền riêng tư**: gói miễn phí Gemini có thể dùng dữ liệu để cải thiện sản phẩm ⇒ demo chỉ dùng tài liệu học tập không nhạy cảm ([[adr-006-gemini-embedding-and-llm]]).
- **Giới hạn tốc độ**: Gemini free-tier có rate limit ⇒ backend giới hạn `10 câu hỏi/phút/người dùng` (`429 RATE_LIMITED`).
- PDF dạng ảnh quét (không có text) ⇒ `FAILED` (`NO_TEXT_LAYER`); OCR **ngoài phạm vi**.
