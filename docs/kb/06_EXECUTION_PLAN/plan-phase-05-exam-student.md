---
id: plan-phase-05-exam-student
title: Phase 05 — Làm bài kiểm tra & Kết quả (SV) (UC05, UC06, UC16)
type: plan
status: living
tags: [plan, exam, attempts, scoring]
related: [plan-00-overview, concept-exam-lifecycle, concept-exam-scoring-attempts, api-exam-student, ui-screens-client, adr-011-exam-retake-best-score]
source: "UC05, UC06, UC16; UI C06, C09"
updated: 2026-11-15
---
# Phase 05 — Exam (SV)

**Phạm vi**: C06 làm bài, C09 kết quả + xem lại (G-07). **Phụ thuộc**: P03, P04 (đề tạm lấy từ seed — GV tạo đề ở P06). **FILE_MAPPING**: CL-10, CL-11. **Cỡ**: M.

## A — UI + Mock
- [ ] P05-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `ExamInfoDto`, `ExamQuestionsDto` (không `isCorrect`), `SubmitAttemptReq/ResultDto`, `ExamResultRowDto`, `AttemptReviewDto`
- [ ] P05-A2 `exam.mock.ts`: chấm bằng `computeScore/isPassed` từ `@/types/scoring`; làm lại tăng `attemptNo`; `EXAM_NOT_OPEN`, `NOT_ENROLLED`
- [ ] P05-A3 `useExamTimer` (mốc `Date.now()`, tự nộp khi hết, cảnh báo 1 phút) + test
- [ ] P05-A4 C06: `ExamHeader`, `QuestionNavigator` (đánh dấu đã trả lời), `OptionRadio` A–D, Câu trước/sau, **Nộp bài** có xác nhận khi còn câu trống, `beforeunload`
- [ ] P05-A5 Thẻ **Kết quả sau khi nộp** (8/10, đúng 8 câu, Đạt/Chưa đạt, Xem lại đáp án, Làm lại)
- [ ] P05-A6 C09: `ResultsTable`; trang xem lại `/my-results/[attemptId]` (`AttemptReview`, G-07)
## B — Review
- [ ] P05-B1 Khớp C06/C09 · [ ] đồng hồ chính xác khi tab ngủ · [ ] lỗi nộp giữ đáp án ([[error-handling-conventions]]) · [ ] màu Đúng/Sai
## C — Wire
- [ ] P05-C1 `exam.http.ts`; nộp lỗi mạng ⇒ giữ bài, cho nộp lại
## D — Backend
- [ ] P05-D1 `exams` (SV): `GET /exams/:id`, `GET /exams/:id/questions` (select **không** `isCorrect`; hàm repo riêng `findQuestionsForTaking`)
- [ ] P05-D2 `attempts`: `POST /exams/:id/attempts` theo thuật toán transaction ở [[concept-exam-scoring-attempts]] (validate payload, retry khi đụng unique)
- [ ] P05-D3 `GET /me/exam-results` (groupBy best/last/count), `GET /me/attempts/:id` (chỉ của mình)
- [ ] P05-D4 `learning-summary.averageExamScore` nối với dữ liệu thật
## E — Test
- [ ] P05-E1 **Không lộ đáp án** trong response đề (test tự động quét key `isCorrect`)
- [ ] P05-E2 Chấm: 0, toàn đúng, bỏ trống, đáp án sai thuộc câu khác ⇒ 400; 2 nộp song song ⇒ `attempt_no` 1 và 2
- [ ] P05-E3 `CLOSED`/`DRAFT`/chưa ghi danh ⇒ chặn đúng mã; xem lại lượt người khác ⇒ 404
- [ ] P05-E4 Gỡ mock; e2e: thi → nộp → xem lại → làm lại → My results hiển thị điểm cao nhất
- [ ] P05-E5 DoD + log

## Rủi ro
Lệch công thức mock/thật ⇒ cùng import `computeScore`. Làm tròn: test với 1/3, 2/3.
