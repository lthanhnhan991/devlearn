---
id: 00_INDEX
title: 00_INDEX — Bản đồ Knowledge Base DevLearn (đọc file này đầu tiên)
type: index
status: living
tags: [index, map, start-here]
related: [agent-rules, delta-vs-thesis, glossary, plan-00-overview, concept-project-overview, system-overview, api-contracts]
source: "KB DevLearn"
updated: 2026-11-15
---
# 00_INDEX — DevLearn Knowledge Base

**DevLearn** = nền tảng học tập & quản lý khóa học phát triển phần mềm (Khoa CNTT, ĐH Công nghệ Sài Gòn): Next.js + Express + dịch vụ RAG (FastAPI/ChromaDB/Gemini) + PostgreSQL/Prisma. Hai khu vực: **CLIENT** (sinh viên, 9 màn) và **ADMIN** (giảng viên/quản trị, 9 màn).

> **Kiến trúc tài liệu**: thư mục phẳng theo chủ đề · ghi chú nguyên tử (≤ 300 dòng/file) · liên kết chéo `[[id]]` · frontmatter YAML. Kiểm tra bằng `python docs/kb/tools/kb_lint.py`.

## 1. Bắt đầu (mọi người, mọi Agent)
1. Đọc [[agent-rules]] — luật làm việc & cách ghi log.
2. Đọc [[delta-vs-thesis]] — nơi KB **khác** Đồ án (mâu thuẫn, giả định, khoảng trống UI). *KB thắng Đồ án.*
3. Xem [[PROGRESS]] — đang ở đâu; [[plan-00-overview]] — làm gì tiếp.
4. Tra thuật ngữ ở [[glossary]].

## 2. Đọc theo nhiệm vụ
| Bạn đang… | Đọc theo thứ tự |
|---|---|
| Dựng **UI một màn** | `plan-phase-XX` → [[ui-screens-client]] / [[ui-screens-admin]] → [[ui-design-system]] → [[architecture-frontend]] → [[coding-standards-frontend]] → [[workflow-ui-mock-wire-backend]] |
| Đấu API (**Wire**) | `api-*` của tính năng → [[api-contracts]] → [[error-handling-conventions]] → [[FILE_MAPPING]] |
| Viết **Backend** | `concept-*` → `api-*` → [[architecture-backend-layers]] → [[database-erd]] → [[coding-standards-backend]] → [[testing-strategy]] |
| Viết **RAG (Python)** | [[concept-rag-overview]] → [[concept-rag-ingestion]] → [[concept-rag-query]] → [[api-internal-rag]] → [[architecture-rag-service]] → [[coding-standards-rag-python]] |
| Sửa **DB** | [[database-erd]] → [[database-prisma-schema]] → [[database-prisma-schema-exam-ai]] → [[delta-vs-thesis]] (mục D) |
| Hiểu **quyền** | [[concept-roles-permissions]] → [[concept-auth]] → [[adr-013-exam-stats-owner-only]] |
| Hiểu **vì sao** | thư mục `03_DECISIONS` (ADR-001…016) |
| Kiểm **xong chưa** | [[definition-of-done]] → [[FILE_MAPPING]] / [[FILE_MAPPING_ADMIN]] |

## 3. Sự thật nhanh (đừng đoán — đã chốt)
| Chủ đề | Giá trị |
|---|---|
| Vai trò | `STUDENT`, `TEACHER`, `ADMIN` — hai cổng đăng nhập ([[adr-009-separate-admin-login-portal]]) |
| Auth | JWT trong cookie httpOnly `devlearn_token` ([[adr-008-jwt-httponly-cookie]]) |
| API | `/api/v1`, envelope `{data,meta}` / `{error:{code,message}}` ([[api-contracts]]) |
| Chấm điểm | `score = round(đúng/tổng×10, 2)`; Đạt ⇔ `bestScore ≥ passScore`; làm lại không giới hạn ([[concept-exam-scoring-attempts]]) |
| Upload | video ≤ 100 MB, PDF ≤ 10 MB (Cloudinary) ([[concept-file-storage]]) |
| AI | chỉ trả lời từ PDF của khóa; kèm nguồn; ≤ 5 s ([[concept-rag-overview]]) |
| Thống kê bài kiểm tra | **owner-only** ([[adr-013-exam-stats-owner-only]]) |
| Quy trình | UI+Mock → Review → Wire → Backend → Test ([[workflow-ui-mock-wire-backend]]) |
| Cấu trúc repo | `backend/` · `frontend/` · `rag-service/` · `docs/` — **chỉ npm, không monorepo, không Docker** ([[adr-016-manual-type-sync]], [[architecture-repo-structure]]) |
| Kiểu dùng chung | nguồn `backend/src/types/` → `./sync-types.sh` → bản copy `frontend/src/types/` (không sửa tay) ([[agent-rules]] §2b) |
| Cấm | `any`, `@ts-ignore`, hex tự do, Prisma ngoài repository ([[coding-standards]]) |

## 4. Bản đồ tệp (tự sinh — chạy `python docs/kb/tools/build_index.py` sau khi đổi KB)
<!-- AUTO:START -->
### `00_INDEX/` — Bản đồ & đọc trước
- [[delta-vs-thesis]] — Lệch so với Đồ án — mâu thuẫn, bổ sung schema, giả định, khoảng trống UI
- [[glossary]] — Thuật ngữ (Glossary)

### `01_CONCEPTS/` — Khái niệm nghiệp vụ
- [[concept-admin-users-dashboard]] — Quản lý người dùng & Dashboard (F5, UC13, UC14)
- [[concept-auth]] — Xác thực (Auth) — đăng ký, đăng nhập, phiên
- [[concept-course-structure]] — Cấu trúc khóa học (Course → Module → Lesson)
- [[concept-enrollment-progress]] — Ghi danh & Tiến độ học tập
- [[concept-exam-lifecycle]] — Vòng đời bài kiểm tra trắc nghiệm
- [[concept-exam-scoring-attempts]] — Chấm điểm tự động & Lượt làm bài (Attempts)
- [[concept-exam-statistics]] — Thống kê bài kiểm tra (F3.5, UC12)
- [[concept-file-storage]] — Lưu trữ file (Cloudinary) & Giới hạn upload
- [[concept-project-overview]] — Tổng quan dự án DevLearn
- [[concept-rag-ingestion]] — RAG — Nạp tài liệu PDF (UC11, UC15)
- [[concept-rag-overview]] — Trợ lý AI (RAG) — Tổng quan
- [[concept-rag-query]] — RAG — Hỏi đáp với Trợ lý AI (UC07)
- [[concept-roles-permissions]] — Vai trò & Ma trận phân quyền (RBAC)

### `02_ARCHITECTURE/` — Kiến trúc · CSDL · API · UI
- [[api-admin-ai-docs]] — API — Admin: Tài liệu cho Trợ lý AI
- [[api-admin-content]] — API — Admin: Module, bài học, upload
- [[api-admin-courses]] — API — Admin: Quản lý khóa học
- [[api-admin-exam-stats]] — API — Admin: Thống kê bài kiểm tra (owner-only)
- [[api-admin-exams]] — API — Admin: Bài kiểm tra & câu hỏi
- [[api-admin-users-dashboard]] — API — Admin: Người dùng & Dashboard
- [[api-ai-chat]] — API — Trợ lý AI (phía SV)
- [[api-auth]] — API — Auth (đăng ký, đăng nhập, phiên)
- [[api-catalog]] — API — Danh mục khóa học công khai & Ghi danh
- [[api-contracts]] — API Contracts — Quy ước chung, mã lỗi, DTO dùng chung, chỉ mục endpoint
- [[api-exam-student]] — API — Làm bài kiểm tra & Kết quả (phía SV)
- [[api-internal-rag]] — API nội bộ — Backend ↔ RAG service (+ callback)
- [[api-learning]] — API — Học tập, tiến độ, Khóa học của tôi
- [[architecture-backend-layers]] — Backend — Kiến trúc phân lớp (Express)
- [[architecture-deployment-env]] — Chạy cục bộ (không Docker) & Biến môi trường
- [[architecture-frontend]] — Frontend — Next.js App Router, state, guard, services
- [[architecture-rag-service]] — RAG service (Python/FastAPI) — cấu trúc & pipeline
- [[architecture-repo-structure]] — Cấu trúc thư mục dự án (3 dự án độc lập) & quy ước
- [[database-erd]] — Database — ERD, ràng buộc, chỉ mục
- [[database-prisma-schema-exam-ai]] — Prisma schema (2/2) — kiểm tra, lượt làm, tài liệu AI, lịch sử AI
- [[database-prisma-schema]] — Prisma schema (1/2) — enum, người dùng, khóa học, tiến độ
- [[database-seed-data]] — Dữ liệu seed & ID cố định (dùng chung cho mock và DB thật)
- [[system-overview]] — Kiến trúc tổng thể — luồng đi của 3 dịch vụ
- [[ui-design-system]] — Design system — màu, kiểu chữ, component (rút từ file thiết kế)
- [[ui-screens-admin]] — Đặc tả màn hình ADMIN (A00–A08)
- [[ui-screens-client]] — Đặc tả màn hình CLIENT (C01–C09)

### `03_DECISIONS/` — Quyết định kỹ thuật (ADR)
- [[adr-001-nextjs-app-router]] — ADR-001 — Next.js (App Router) + TypeScript + Tailwind cho Frontend
- [[adr-002-express-layered-backend]] — ADR-002 — Express + TypeScript, kiến trúc phân lớp
- [[adr-003-fastapi-separate-rag-service]] — ADR-003 — Dịch vụ RAG riêng bằng Python/FastAPI
- [[adr-004-postgres-prisma]] — ADR-004 — PostgreSQL + Prisma
- [[adr-005-chromadb-embedded]] — ADR-005 — ChromaDB nhúng trong dịch vụ RAG
- [[adr-006-gemini-embedding-and-llm]] — ADR-006 — Gemini cho embedding và sinh câu trả lời
- [[adr-007-cloudinary-storage]] — ADR-007 — Cloudinary lưu video & PDF
- [[adr-008-jwt-httponly-cookie]] — ADR-008 — JWT lưu ở cookie httpOnly
- [[adr-009-separate-admin-login-portal]] — ADR-009 — Hai cổng đăng nhập: CLIENT và ADMIN
- [[adr-010-unify-documents-into-ai-documents]] — ADR-010 — Gộp bảng documents vào ai_documents
- [[adr-011-exam-retake-best-score]] — ADR-011 — Làm lại bài kiểm tra, ghi nhận điểm cao nhất
- [[adr-012-rag-async-ingest-callback]] — ADR-012 — Nạp tài liệu bất đồng bộ + callback
- [[adr-013-exam-stats-owner-only]] — ADR-013 — Thống kê bài kiểm tra chỉ dành cho chủ khóa
- [[adr-014-monorepo-shared-contracts]] — ADR-014 — Monorepo pnpm + package contracts dùng chung (ĐÃ BỊ THAY THẾ bởi ADR-016)
- [[adr-015-ui-first-mock-adapters]] — ADR-015 — UI trước bằng mock adapters, rồi đấu API
- [[adr-016-manual-type-sync]] — ADR-016 — Đơn giản hóa: npm + 3 thư mục độc lập + đồng bộ types thủ công

### `04_RULES_WORKFLOWS/` — Luật & quy trình
- [[agent-rules]] — Luật làm việc cho AI Agent & Dev
- [[coding-standards-backend]] — Luật code Backend (Express, Prisma, zod)
- [[coding-standards-frontend]] — Luật code Frontend (Next.js, Tailwind, services/mock)
- [[coding-standards-rag-python]] — Luật code RAG service (Python/FastAPI)
- [[coding-standards]] — Luật code chung (TypeScript strict, không any, Tailwind…)
- [[definition-of-done]] — Definition of Done (DoD)
- [[error-handling-conventions]] — Quy ước xử lý lỗi (BE ↔ FE)
- [[git-workflow]] — Quy trình Git & Commit
- [[testing-strategy]] — Chiến lược kiểm thử
- [[workflow-ui-mock-wire-backend]] — Quy trình: UI + Mock → Review → Wire → Backend → Test

### `05_MEMORY_LOGS/` — Bộ nhớ làm việc
- [[FILE_MAPPING]] — FILE_MAPPING — Tính năng → UI → API → Backend (CLIENT + hạ tầng)
- [[FILE_MAPPING_ADMIN]] — FILE_MAPPING — ADMIN (Giảng viên/Quản trị)
- [[OPEN_QUESTIONS]] — OPEN_QUESTIONS — Câu hỏi cần người phụ trách xác nhận
- [[PROGRESS]] — PROGRESS — Nhật ký làm việc & bảng tiến độ phase

### `06_EXECUTION_PLAN/` — Kế hoạch thực thi
- [[plan-00-overview]] — Kế hoạch thực thi — Tổng quan, phụ thuộc, làn song song
- [[plan-phase-00-foundation]] — Phase 00 — Nền móng (npm, 3 dự án độc lập) & spike rủi ro
- [[plan-phase-01-auth]] — Phase 01 — Xác thực & phân quyền (UC01, UC02)
- [[plan-phase-02-course-catalog]] — Phase 02 — Danh mục khóa học & ghi danh (UC03)
- [[plan-phase-03-learning-progress]] — Phase 03 — Học tập & theo dõi tiến độ (UC04)
- [[plan-phase-04-admin-content]] — Phase 04 — Admin: quản lý khóa học & soạn bài + upload (UC08, UC09)
- [[plan-phase-05-exam-student]] — Phase 05 — Làm bài kiểm tra & Kết quả (SV) (UC05, UC06, UC16)
- [[plan-phase-06-exam-admin-stats]] — Phase 06 — Admin: bài kiểm tra, câu hỏi & thống kê (UC10, UC12)
- [[plan-phase-07-rag-service]] — Phase 07 — Dịch vụ RAG (Python/FastAPI) (UC15)
- [[plan-phase-08-ai-chat-and-docs]] — Phase 08 — Tài liệu AI (Admin) + Chat AI (SV) (UC07, UC11)
- [[plan-phase-09-admin-dashboard-users]] — Phase 09 — Dashboard & Quản lý người dùng (UC13, UC14)
- [[plan-phase-10-hardening-release]] — Phase 10 — Hardening, E2E & chuẩn bị demo
<!-- AUTO:END -->

## 5. Nguồn gốc
Tổng hợp từ: Đồ án chuyên ngành (Chương 1–3), 19 màn thiết kế UI (`Design_ui_devlearn`), 10 sơ đồ drawio + use case tổng quát (`Tai_lieu_so_do`).
