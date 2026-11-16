---
id: concept-exam-statistics
title: Thống kê bài kiểm tra (F3.5, UC12)
type: concept
status: stable
tags: [exam, statistics, teacher, f3]
related: [concept-exam-scoring-attempts, adr-013-exam-stats-owner-only, api-admin-exam-stats, concept-roles-permissions, plan-phase-06-exam-admin-stats]
source: "Đồ án §2.2.5.2, §2.2.5.3, UC12; UI ADMIN 07/08"
updated: 2026-11-15
---
# Thống kê bài kiểm tra

## Quyền
**Owner-only**: chỉ người có `courses.teacher_id = caller.id` của khóa chứa bài kiểm tra. Người khác (kể cả Admin không phải chủ khóa) → `403 FORBIDDEN`. Đối chiếu ở **backend** ([[adr-013-exam-stats-owner-only]]).

## Bốn chỉ số (thẻ trên cùng ADMIN·07)
| Chỉ số | Định nghĩa |
|---|---|
| `enrolledCount` | số `enrollments` của **khóa** chứa bài kiểm tra |
| `submittedCount` | số **sinh viên khác nhau** có ≥ 1 `attempts` của bài này |
| `completionRate` | `submittedCount ÷ enrolledCount × 100` (làm tròn 1 chữ số; `0` nếu `enrolledCount = 0`) — đúng công thức hiển thị trên UI |
| `averageScore` | trung bình **điểm cao nhất** của từng SV đã nộp (làm tròn 2 chữ số; `null` nếu chưa ai nộp) |

> `averageScore` dựa trên điểm cao nhất để nhất quán với quy tắc "điểm cao nhất được ghi nhận" — xem [[delta-vs-thesis]] U-08.

## Bảng "Sinh viên đã làm bài"
Mỗi dòng = 1 SV có ≥ 1 lượt: `studentCode` (MSSV) · `fullName` · `attemptCount` · `bestScore` (hiển thị `x/10`) · `lastSubmittedAt` · `passed` (Đạt/Chưa đạt theo `bestScore`) · **Xem chi tiết**. Mặc định sắp theo `lastSubmittedAt` giảm dần. Chưa ai nộp → bảng rỗng, `completionRate = 0`.

## Chi tiết bài làm (ADMIN·08)
- Header: họ tên, MSSV, tên bài, thời điểm nộp, điểm `8/10`, nhãn Đạt, "Đúng 8/10 câu".
- Dropdown **Lần làm** liệt kê các lượt (`Lần 2 (điểm cao nhất)`); chọn lượt → tải chi tiết lượt đó.
- Danh sách câu: nhãn **Đúng / Sai / Chưa trả lời**; tô màu như [[concept-exam-scoring-attempts]].

## Truy vấn (gợi ý, repository)
```sql
-- submittedCount & bestScore mỗi SV
SELECT student_id, COUNT(*) AS attempt_count, MAX(score) AS best_score, MAX(submitted_at) AS last_submitted_at
FROM attempts WHERE exam_id = $1 GROUP BY student_id;      -- idx(exam_id)
```
`averageScore = AVG(best_score)` trên tập trên. Dùng `prisma.attempt.groupBy` hoặc `$queryRaw` có tham số hóa (cấm nối chuỗi SQL — [[coding-standards-backend]]).

## Chọn bài ở UI
Hai dropdown **Khóa học** (chỉ khóa mình sở hữu) → **Bài kiểm tra** của khóa đó. Nguồn: `GET /admin/courses`, `GET /admin/courses/:id/exams` ([[api-admin-exams]]).
