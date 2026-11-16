---
id: delta-vs-thesis
title: Lệch so với Đồ án — mâu thuẫn, bổ sung schema, giả định, khoảng trống UI
type: index
status: living
tags: [delta, conflicts, assumptions, ui-gaps]
related: [00_INDEX, OPEN_QUESTIONS, database-erd, ui-screens-client, ui-screens-admin, adr-010-unify-documents-into-ai-documents, adr-011-exam-retake-best-score, adr-013-exam-stats-owner-only]
source: "Đối chiếu Đồ án (3 chương) × 19 màn UI × 10 sơ đồ drawio"
updated: 2026-11-15
---
# Lệch so với Đồ án

**Đọc file này trước khi code.** Khi KB ≠ Đồ án, **KB thắng** (đã giải quyết có chủ đích). Câu hỏi cần người xác nhận: [[OPEN_QUESTIONS]].

## 1. Mâu thuẫn trong tài liệu nguồn (C)
| ID | Mâu thuẫn | Giải quyết |
|---|---|---|
| C-01 | §2.3.1.4: "mỗi SV chỉ nộp một lần" ↔ UC05 + schema `attempt_no` + UI "Lần làm": cho làm lại | Làm lại không giới hạn; "một lần" = mỗi lượt ([[adr-011-exam-retake-best-score]]) |
| C-02 | Mức vật lý có cả `documents` và `ai_documents` (cùng vai trò) | Gộp vào `ai_documents` ([[adr-010-unify-documents-into-ai-documents]]) |
| C-03 | Admin "kế thừa" quyền GV ↔ thống kê "chỉ GV phụ trách" + ghi chú UI A07 | Thống kê owner-only ([[adr-013-exam-stats-owner-only]]) |
| C-04 | UC04: nội dung ô "Tiền điều kiện" và "Hậu điều kiện" bị đảo | Dùng: Tiền ĐK = đã đăng nhập (SV) + đã ghi danh; Hậu ĐK = tiến độ được cập nhật |
| C-05 | §1.3.1 vừa đưa "tổ chức và quản lý bài kiểm tra trực tuyến" vào phạm vi, vừa loại "tổ chức thi trắc nghiệm trực tuyến" | Hiểu loại trừ = **thi có giám sát/chống gian lận**; trắc nghiệm tự chấm vẫn trong phạm vi |
| C-06 | §1.3.1: "không bao gồm lập trình triển khai thực tế" ↔ mục tiêu hiện tại là code | KB giả định triển khai đầy đủ ([[OPEN_QUESTIONS]] Q-13) |
| C-07 | UI A02 để "SQL cơ bản" là *Bản nháp* nhưng C08 SV đang học 70% khóa đó | Chỉ là dữ liệu minh họa; seed dùng PUBLISHED ([[database-seed-data]]) |
| C-08 | Sidebar ADMIN khác nhau giữa các màn (một số có "Thống kê bài kiểm tra", một số không) | Một sidebar thống nhất ([[ui-screens-admin]]) |

## 2. Bổ sung schema so với Đồ án (D)
| ID | Thay đổi | Lý do |
|---|---|---|
| D-01 | `lessons.duration_seconds` | Thẻ khóa/chi tiết hiển thị "[n] giờ" nhưng Đồ án không có nguồn thời lượng |
| D-02 | `lessons.file_public_id`, `ai_documents.file_public_id` | Cần để xóa file Cloudinary |
| D-03 | `options.position` (0–3) | Giữ thứ tự A–D ổn định (UUID không có thứ tự) |
| D-04 | `ai_documents.lesson_id` (unique), `.error_message` | Gộp `documents`; hiển thị lý do lỗi |
| D-05 | `ai_messages.sources` (jsonb) | Hiển thị lại "Nguồn: tài liệu, trang" khi tải lịch sử |
| D-06 | CHECK + unique từng phần (`options_one_correct_per_question`) | Toàn vẹn dữ liệu đề thi |
| D-07 | `users.student_code` unique | MSSV hiển thị ở thống kê, tránh trùng |
| D-08 | `topic`/`level` lưu **mã** (VarChar) | Đồng bộ nhãn ở một nơi (`labels.ts`) |

## 3. Giả định khi Đồ án không nêu (U)
| ID | Giả định |
|---|---|
| U-01 | Chủ đề: 4 mã như UI; cấp độ: `BEGINNER/INTERMEDIATE/ADVANCED` |
| U-02 | Đăng ký SV yêu cầu `studentCode` |
| U-03 | Tài khoản GV/Admin do Admin tạo (không đăng ký công khai) |
| U-04 | Dashboard hiển thị cả cho GV, phạm vi khóa của mình |
| U-05 | Tối đa 1 bài kiểm tra/module và 1 bài cuối khóa/khóa (kiểm ở service) |
| U-06 | Hoàn thành khóa = học hết bài đã xuất bản; không cần đậu kiểm tra |
| U-07 | Đồng hồ thi chạy ở FE; backend không ép hạn |
| U-08 | `averageScore` = trung bình điểm cao nhất mỗi SV |
| U-09 | Xuất bản khóa cần ≥ 1 bài đã xuất bản; chỉ xóa khóa chưa có ghi danh |
| U-10 | Rate limit: login 10/15′, register 5/giờ, AI 10/phút |
| U-11 | RAG: chunk 1000/150, top-k 5, ngưỡng 0.35 (chỉnh bằng env) |
| U-12 | SV thấy bài `OPEN`/`CLOSED`, không thấy `DRAFT`; `CLOSED` chỉ xem kết quả |
| U-13 | `passScore` mặc định 5.00 (thang 10) |
| U-14 | Câu bỏ trống không có bản ghi `answers` |
| U-15 | Mật khẩu ≥ 8 ký tự, có chữ + số; bcrypt cost 12 |
| U-16 | Câu hỏi: đúng 4 lựa chọn, đúng 1 đáp án đúng (UC10) |

## 4. Khoảng trống thiết kế UI (G)
Dev dựng theo mô tả dưới, bám [[ui-design-system]]; chốt ở Review gate của phase tương ứng.
| ID | Màn | Thiếu | Đề xuất |
|---|---|---|---|
| G-01 | C01 | Form **Đăng ký** | Họ tên, MSSV, Email, Mật khẩu, Nhập lại mật khẩu; cùng thẻ, tab *Đăng ký* |
| G-02 | A02 | Form tạo/sửa khóa | Modal: Tên, Mô tả, Chủ đề (select), Cấp độ (select) |
| G-03 | A03 | Quản lý **module** | Nút "+ Thêm module", đổi tên inline, xóa (xác nhận), kéo-thả thứ tự |
| G-04 | A04 | Tạo bài kiểm tra + **trạng thái** | Nút "+ Tạo bài kiểm tra" (chọn module/cuối khóa); `ExamStatusControl` Nháp/Mở/Đóng |
| G-05 | A03/A04/A05 | Chọn **khóa** làm ngữ cảnh | Select khóa ở đầu trang, đồng bộ `?courseId=` |
| G-06 | A06 | Form thêm người dùng | Modal: Họ tên, Email, Mật khẩu tạm, Vai trò, MSSV (nếu SV) |
| G-07 | C09 | Trang xem lại đáp án của SV | `/my-results/[attemptId]` tái dùng `AttemptReview` |
| G-08 | C04/C05/C06 | Chỗ vào **bài kiểm tra** | Hàng "Kiểm tra Module N" cuối mỗi module ở accordion & sidebar học |
| G-09 | C04 | Nội dung tab **Tổng quan** | Hiển thị `description` + thông tin GV |
| G-10 | Tất cả | Trạng thái loading/empty/error/forbidden | Skeleton / `EmptyState` / `ErrorState` ([[architecture-frontend]]) |
| G-11 | A02, A05, A06, A07 | Phân trang | Component `Pagination` |
| G-12 | A01–A08 | Sidebar thống nhất | Xem C-08 |
| G-13 | A02 | Công tắc Xuất bản/Bản nháp | Hành động trong hàng hoặc trong modal sửa |
| G-14 | A02–A06 | Xác nhận xóa | `ConfirmDialog` |
| G-15 | CLIENT | Menu avatar (đăng xuất, kết quả) | Dropdown từ avatar "NA" |
| G-16 | C05 | Trình xem **PDF** | `<iframe>`/viewer; cảnh báo nếu không tải được |
