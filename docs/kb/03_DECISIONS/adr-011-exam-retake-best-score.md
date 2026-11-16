---
id: adr-011-exam-retake-best-score
title: ADR-011 — Làm lại bài kiểm tra, ghi nhận điểm cao nhất
type: decision
status: accepted
tags: [adr, exam, scoring]
related: [concept-exam-scoring-attempts, delta-vs-thesis]
source: "Đồ án UC05 vs bảng §2.3.1.4 (mâu thuẫn)"
updated: 2026-11-15
---
# ADR-011 — Làm lại không giới hạn, điểm cao nhất được ghi nhận

## Bối cảnh (mâu thuẫn)
- Bảng quy trình §2.3.1.4: "Mỗi sinh viên chỉ nộp một lần".
- UC05 ngoại lệ: "Làm lại: tạo lần làm mới, điểm cao nhất được ghi nhận"; mô hình dữ liệu có `attempt_no`; UI có "Lần làm", "Số lần nộp", "Lần 2 (điểm cao nhất)".

## Quyết định
Cho phép làm lại **không giới hạn** khi bài `OPEN`; câu "chỉ nộp một lần" hiểu là **mỗi lượt chỉ nộp một lần**. Điểm hiển thị = điểm cao nhất; `averageScore` thống kê dựa trên điểm cao nhất mỗi SV.

## Mở rộng (chưa làm)
Cột `exams.max_attempts` (null = không giới hạn) nếu GV yêu cầu — thêm sau không phá hợp đồng.
