---
id: concept-exam-scoring-attempts
title: Chấm điểm tự động & Lượt làm bài (Attempts)
type: concept
status: stable
tags: [exam, scoring, attempts, uc16]
related: [concept-exam-lifecycle, concept-exam-statistics, adr-011-exam-retake-best-score, api-exam-student, database-prisma-schema-exam-ai]
source: "Đồ án §2.3.1.4, UC05/UC06/UC16, §2.2.5.3"
updated: 2026-11-15
---
# Chấm điểm & Lượt làm

## Công thức (UC16)
```
score      = round( correctCount / totalQuestions × 10 , 2 )   // thang 10
passed     = score >= exam.passScore
```
- `totalQuestions` = số câu **tại thời điểm nộp** (đề đã khóa sửa khi `OPEN`, nên ổn định).
- Câu **không trả lời** tính sai. Không tạo bản ghi `answers` cho câu bỏ trống → màn chi tiết GV hiện **"Chưa trả lời"**.
- Làm tròn dùng `Decimal`/`Math.round(x*100)/100`; lưu `numeric(4,2)`.

## Lượt làm (Attempt)
- Mỗi lần **Nộp bài** tạo **1 `attempts`** + các `answers`. `attempt_no` tăng dần theo `(exam_id, student_id)` (1, 2, 3…).
- **Cho phép làm lại không giới hạn** (UC05: "Làm lại: tạo lần làm mới, điểm cao nhất được ghi nhận") — [[adr-011-exam-retake-best-score]].
  - Câu "mỗi sinh viên chỉ nộp một lần" trong bảng quy trình Đồ án được hiểu là **mỗi lượt chỉ nộp một lần** (nộp xong lượt đó là khóa lượt). Xem [[delta-vs-thesis]] C-01.
- **Điểm ghi nhận của SV = điểm cao nhất** trong các lượt (`bestScore`). `Đạt` nếu `bestScore >= passScore`.

## Nộp bài — thuật toán (transaction)
```
1. assertEnrolled(student, exam.courseId); assert exam.status == OPEN
2. load questions+options của exam (kèm isCorrect)
3. validate payload: mọi questionId ∈ exam; optionId thuộc đúng question; không trùng questionId
4. correctCount = số câu có option đã chọn isCorrect
5. attemptNo = (max(attempt_no) của (exam,student) ?? 0) + 1      // trong TX
6. INSERT attempts(...); INSERT answers(...) (chỉ câu đã trả lời)
7. return AttemptResult
```
Đua dữ liệu (2 request song song): ràng buộc `UNIQUE(exam_id, student_id, attempt_no)` làm 1 request fail → service **thử lại tối đa 3 lần** với `attemptNo` mới.

## Xem lại đáp án (UC06)
- SV: `GET /me/attempts/:attemptId` — chỉ lượt của chính mình; trả đủ `isCorrect` cho từng lựa chọn + `selectedOptionId`.
- GV (owner): `GET /admin/exam-stats/attempts/:attemptId` — cùng cấu trúc [[api-admin-exam-stats]].
- Hiển thị: đáp án đúng nền xanh (DCFCE7), lựa chọn sai của SV nền đỏ nhạt (FEE2E2), nhãn **Đúng / Sai / Chưa trả lời** — xem [[ui-screens-admin]] ADMIN·08.

## Màn "Kết quả kiểm tra của tôi"
Một dòng **mỗi bài kiểm tra** (không phải mỗi lượt): Khóa học · Bài kiểm tra · Lần làm (= số lượt) · Điểm (cao nhất) · Kết quả (Đạt/Chưa đạt theo điểm cao nhất) · Nộp lúc (lượt gần nhất) · **Xem lại** (→ lượt có điểm cao nhất). Xem [[api-exam-student]].

## Công thức dùng chung (đặt ở `backend/src/types/scoring.ts`)
```ts
export const computeScore = (correct: number, total: number): number =>
  total === 0 ? 0 : Math.round((correct / total) * 1000) / 100;
export const isPassed = (score: number, passScore: number): boolean => score >= passScore;
```
Backend là nơi **tính điểm thật**; hàm `computeScore/isPassed` nằm ở `backend/src/types/scoring.ts` (frontend có bản copy nếu cần hiển thị) — chỉ có **một** công thức.
