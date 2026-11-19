---
id: plan-phase-05-exam-student
title: Phase 05 — Làm bài kiểm tra & Kết quả (SV) (UC05, UC06, UC16)
type: plan
status: living
tags: [plan, exam, attempts, scoring]
related: [plan-00-overview, workflow-solo-dev, concept-exam-lifecycle, concept-exam-scoring-attempts, api-exam-student, ui-screens-client, adr-011-exam-retake-best-score, database-erd]
source: "UC05, UC06, UC16; UI C06, C09"
updated: 2026-11-15
---
# Phase 05 — Exam (SV)

**Phạm vi**: C06 làm bài, C09 kết quả + xem lại (G-07). **Phụ thuộc**: P03, P04 (đề lấy từ seed — GV tạo đề ở P06). **FILE_MAPPING**: CL-10, CL-11. **Cỡ**: M.

## Việc cần làm
### DTO
- [ ] P05-1 `backend/src/types/dto/exam.ts`: `ExamInfoDto`, `ExamQuestionsDto` (**không** `isCorrect`), `SubmitAttemptReq/ResultDto`, `ExamResultRowDto`, `AttemptReviewDto` ([[api-exam-student]]) → `./sync-types.sh`
### UI
- [ ] P05-2 `useExamTimer` (mốc `Date.now()`, tự nộp khi hết giờ, cảnh báo 1 phút)
- [ ] P05-3 C06: `ExamHeader`, `QuestionNavigator` (đánh dấu đã trả lời), `OptionRadio` A–D, Câu trước/sau, **Nộp bài** có xác nhận khi còn câu trống, `beforeunload`; thẻ **Kết quả sau khi nộp** (điểm, Đạt/Chưa đạt, Xem lại đáp án, Làm lại)
- [ ] P05-4 C09 `ResultsTable`; trang xem lại `/my-results/[attemptId]` (`AttemptReview`, G-07)
### Gọi API (http)
- [ ] P05-5 `services/http/exam.http.ts`: `getExam`, `getExamQuestions`, `submitAttempt`, `getMyExamResults`, `getMyAttempt`; lỗi nộp ⇒ **giữ đáp án trên màn hình**, cho nộp lại
### Backend
- [ ] P05-6 `modules/exams` (SV): `GET /exams/:id`, `GET /exams/:id/questions` (hàm repo riêng **không select `isCorrect`**)
- [ ] P05-7 `modules/attempts`: `POST /exams/:id/attempts` theo thuật toán transaction ở [[concept-exam-scoring-attempts]] (validate payload; thử lại khi đụng unique `attempt_no`); dùng `computeScore`/`isPassed` từ `types/scoring.ts`
- [ ] P05-8 `GET /me/exam-results` (best/last/count), `GET /me/attempts/:id` (chỉ lượt của mình); nối `averageExamScore` của learning-summary
### Cập nhật DB
- [ ] P05-9 `schema.prisma`: thêm `Attempt`, `Answer` + `User.attempts`, `Exam.attempts`, `Question.answers`, `Option.answers`; migration SQL CHECK cho `attempts` ([[database-erd]])
- [ ] P05-10 `seed.ts`: lượt làm mẫu (6/10 → 8/10; 4/10; 7/10)
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p05_attempts` rồi `npm run db:seed`

## Checklist test tay (Tech Lead)
- [ ] Network tab: response đề **không có `isCorrect`**
- [ ] Nộp bỏ trống ⇒ 0/10; đúng hết ⇒ 10/10; làm lại ⇒ "Lần làm" tăng; My results hiển thị điểm **cao nhất**
- [ ] Đề `DRAFT` không thấy; đề `CLOSED` không làm được; chưa ghi danh ⇒ bị chặn; xem lại lượt của người khác ⇒ 404
- [ ] Hết giờ tự nộp; thoát giữa chừng có cảnh báo

## Rủi ro
Làm tròn điểm (1/3, 2/3) ⇒ chỉ dùng `computeScore`. Nộp song song ⇒ unique `(exam, student, attempt_no)` + thử lại.
