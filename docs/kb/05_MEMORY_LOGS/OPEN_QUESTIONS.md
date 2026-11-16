---
id: OPEN_QUESTIONS
title: OPEN_QUESTIONS — Câu hỏi cần người phụ trách xác nhận
type: log
status: living
tags: [questions, decisions, risks]
related: [delta-vs-thesis, PROGRESS, agent-rules, adr-010-unify-documents-into-ai-documents, adr-011-exam-retake-best-score, adr-013-exam-stats-owner-only]
source: "Tổng hợp từ quá trình đọc Đồ án + UI"
updated: 2026-11-15
---
# Câu hỏi mở

Mỗi câu có **mặc định đang áp dụng** — Agent cứ làm theo mặc định cho đến khi có trả lời. Khi được trả lời: đổi `Trạng thái`, cập nhật tài liệu liên quan, ghi [[PROGRESS]].

| ID | Câu hỏi | Mặc định đang áp dụng | Ảnh hưởng nếu đổi | Tham chiếu | Trạng thái |
|---|---|---|---|---|---|
| Q-01 | Gộp `documents` vào `ai_documents`? | Gộp, thêm `lesson_id` | Schema + A03/A05 | [[adr-010-unify-documents-into-ai-documents]] | 🟡 mở |
| Q-02 | PDF của bài học có **tự động** thành nguồn cho AI? | Có (đúng §2.3.1.2 bước 4) | Upload bài PDF | [[concept-rag-ingestion]] | 🟡 mở |
| Q-03 | Admin có xem được thống kê bài kiểm tra của khóa không do mình sở hữu? | Không (owner-only) | 1 hàm service + test | [[adr-013-exam-stats-owner-only]] | 🟡 mở |
| Q-04 | Làm lại bài kiểm tra: có giới hạn số lần? | Không giới hạn | cột `exams.max_attempts` | [[adr-011-exam-retake-best-score]] | 🟡 mở |
| Q-05 | Dashboard cho Giảng viên (phạm vi khóa của mình) có chấp nhận? | Có | `GET /admin/dashboard` scope | [[concept-admin-users-dashboard]] | 🟡 mở |
| Q-06 | `studentCode` (MSSV) bắt buộc khi đăng ký? Có kiểm định dạng theo trường? | Bắt buộc, 4–20 ký tự chữ-số | Form đăng ký, API | [[api-auth]] | 🟡 mở |
| Q-07 | Hoàn thành khóa có cần đậu bài kiểm tra cuối khóa? | Không, chỉ cần học hết bài đã xuất bản | công thức tiến độ | [[concept-enrollment-progress]] | 🟡 mở |
| Q-08 | Backend có cần ép hạn thời gian làm bài (server-side)? | Không (đồng hồ ở FE) | thêm bảng/cột `started_at` | [[concept-exam-lifecycle]] | 🟡 mở |
| Q-09 | Tài khoản Cloudinary có cho phát hành PDF công khai không? | Chưa rõ — **spike P00** | luồng RAG tải PDF | [[concept-file-storage]] | 🟡 mở |
| Q-10 | Tên model Gemini (embedding + Flash) tại thời điểm triển khai & quota | điền env sau khi kiểm tra tài liệu Google | cấu hình RAG | [[adr-006-gemini-embedding-and-llm]] | 🟡 mở |
| Q-11 | Có thêm cấp độ "Nâng cao" (UI chỉ có Nhập môn/Trung cấp)? | Có mã `ADVANCED` nhưng UI lọc ẩn nếu chưa có khóa | filter C03 | [[concept-course-structure]] | 🟡 mở |
| Q-12 | Các khoảng trống thiết kế G-01…G-16 — ai thiết kế bổ sung? | Dev dựng theo mô tả ở [[delta-vs-thesis]] §4, bám design system | Review gate mỗi phase | [[delta-vs-thesis]] | 🟡 mở |
| Q-13 | Phạm vi "không triển khai thực tế" trong Đồ án §1.3.1 vs mục tiêu code hiện tại | KB giả định **triển khai đầy đủ** | phạm vi báo cáo | [[delta-vs-thesis]] C-06 | 🟡 mở |
| Q-14 | PostgreSQL chạy bằng cách nào (cài trên máy hay Postgres đám mây)? | Chưa chọn — chọn khi làm Phase 00 và ghi lại ở đây | `DATABASE_URL`, test DB | [[architecture-deployment-env]] | 🟡 mở |
| Q-15 | `npx prisma init` (bản mới nhất) có sinh cấu trúc khác schema trong KB không (ví dụ `prisma.config.ts`)? | Giữ cú pháp KB (classic), xóa prisma.config.ts, generator prisma-client-js | Schema, scripts | [[database-prisma-schema]], [[adr-016-manual-type-sync]] | ✅ đã giải quyết 2026-11-16 (Phương án B) |
