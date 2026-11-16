---
id: glossary
title: Thuật ngữ (Glossary)
type: index
status: stable
tags: [glossary, terms]
related: [00_INDEX, concept-project-overview, concept-rag-overview, workflow-ui-mock-wire-backend]
source: "Đồ án + KB"
updated: 2026-11-15
---
# Thuật ngữ

| Thuật ngữ | Nghĩa trong dự án |
|---|---|
| **CLIENT / ADMIN** | Hai khu vực giao diện: người học / giảng viên-quản trị |
| **Owner (chủ khóa)** | Người dùng có `courses.teacher_id` = chính họ |
| **Portal (cổng)** | Trang đăng nhập riêng cho CLIENT và ADMIN ([[adr-009-separate-admin-login-portal]]) |
| **Enrollment (ghi danh)** | SV đăng ký học một khóa ([[concept-enrollment-progress]]) |
| **Attempt (lượt làm)** | Một lần nộp bài kiểm tra; có `attempt_no` ([[concept-exam-scoring-attempts]]) |
| **Best score** | Điểm cao nhất trong các lượt; là điểm ghi nhận của SV |
| **Passed (Đạt)** | `bestScore >= passScore` |
| **Completion rate** | Tỷ lệ hoàn thành: tùy ngữ cảnh khóa/bài kiểm tra ([[concept-exam-statistics]], [[concept-admin-users-dashboard]]) |
| **RAG** | Retrieval-Augmented Generation: truy xuất đoạn tài liệu rồi sinh câu trả lời ([[concept-rag-overview]]) |
| **Ingestion (nạp)** | PDF → trích văn bản → chunk → embedding → vector ([[concept-rag-ingestion]]) |
| **Chunk** | Đoạn văn bản ~1000 ký tự được vector hóa |
| **Embedding** | Vector số biểu diễn ngữ nghĩa của đoạn/câu hỏi |
| **Top-k** | Số đoạn gần nhất được lấy làm ngữ cảnh |
| **Grounding** | Ép AI chỉ trả lời từ ngữ cảnh; sentinel `__NOT_FOUND__` |
| **Source (nguồn)** | `{tài liệu, trang, đoạn trích}` kèm câu trả lời |
| **Contract-first** | Sửa tài liệu API → `backend/src/types/` → `./sync-types.sh` → code ([[api-contracts]]) |
| **Shared types** | `backend/src/types/` (nguồn: Zod schema, kiểu DTO, nhãn, `computeScore`, `seed-ids`) + bản copy `frontend/src/types/` ([[adr-016-manual-type-sync]]) |
| **sync-types.sh** | Script `cp` chép types backend → frontend; `--check` kiểm lệch |
| **Mock adapter** | Cài đặt giả của service FE cùng interface với bản HTTP ([[adr-015-ui-first-mock-adapters]]) |
| **Review gate** | Cổng duyệt UI do người quyết định, trước khi đấu API ([[workflow-ui-mock-wire-backend]]) |
| **Wire (đấu dây)** | Thay mock bằng service HTTP thật |
| **Atomic note** | Ghi chú một chủ đề, ≤ 300 dòng, liên kết chéo ([[agent-rules]]) |
| **ADR** | Architecture Decision Record — thư mục `03_DECISIONS` |
| **DoD** | Definition of Done ([[definition-of-done]]) |
| **Seed-ids** | UUID cố định dùng chung cho mock & seed DB ([[database-seed-data]]) |
