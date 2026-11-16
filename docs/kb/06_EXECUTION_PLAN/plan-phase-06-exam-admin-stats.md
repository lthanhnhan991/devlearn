---
id: plan-phase-06-exam-admin-stats
title: Phase 06 — Admin: bài kiểm tra, câu hỏi & thống kê (UC10, UC12)
type: plan
status: living
tags: [plan, admin, exam, statistics]
related: [plan-00-overview, concept-exam-lifecycle, concept-exam-statistics, api-admin-exams, api-admin-exam-stats, adr-013-exam-stats-owner-only, ui-screens-admin]
source: "UC10, UC12; UI A04, A07, A08"
updated: 2026-11-15
---
# Phase 06 — Admin: Exams & Stats

**Phạm vi**: A04 soạn đề, A07 thống kê, A08 chi tiết bài làm. **Phụ thuộc**: P04, P05. **FILE_MAPPING**: AD-07…AD-09. **Cỡ**: L.

## A — UI + Mock
- [ ] P06-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `AdminExamRowDto/Dto`, `AdminQuestionUpsertReq`, `ExamStatsDto`, `StudentAttemptsDto`, `AdminAttemptReviewDto`
- [ ] P06-A2 `admin-exam.mock.ts` (đúng ràng buộc: 4 đáp án/1 đúng; sửa chỉ khi `DRAFT`; `EXAM_EMPTY`, `EXAM_HAS_ATTEMPTS`) và `admin-stats.mock.ts` (tính từ fixtures lượt làm; `403` cho khóa không sở hữu)
- [ ] P06-A3 A04: `ExamList` + tạo bài (G-04), `ExamStatusControl`, form Thời gian/Điểm đạt, `QuestionEditor` (4 radio A–D, Lưu/Xóa có xác nhận), danh sách câu hỏi, nút **Xem thống kê**
- [ ] P06-A4 A07: hai select Khóa → Bài, 4 `StatCard`, thanh tỷ lệ + công thức, `StudentResultTable`, empty "chưa có SV nộp", `403` ErrorState
- [ ] P06-A5 A08: header, `AttemptSelect` (Lần làm, đánh dấu điểm cao nhất), `AttemptReview` (Đúng/Sai/Chưa trả lời, tô màu)
## B — Review
- [ ] P06-B1 Khớp A04/A07/A08 · [ ] G-04 duyệt · [ ] khóa sửa câu khi `OPEN` rõ ràng với người dùng
## C — Wire
- [ ] P06-C1 `admin-exam.http.ts`, `admin-stats.http.ts`; map lỗi `409 EXAM_*` sang thông điệp
## D — Backend
- [ ] P06-D1 `exams` admin: list/create (`EXAM_DUPLICATE`)/get/patch/status/delete; luật chuyển trạng thái ([[concept-exam-lifecycle]])
- [ ] P06-D2 `questions`: create/put/delete/order; validate 4 lựa chọn, đúng 1 đáp án; chỉ `DRAFT`
- [ ] P06-D3 `exam-stats`: `assertCourseOwnerStrict`; truy vấn tổng hợp (`groupBy`), `averageScore` theo điểm cao nhất ([[concept-exam-statistics]])
- [ ] P06-D4 Endpoint danh sách lượt của SV + chi tiết lượt (dùng chung mapper `AttemptReview` với SV)
## E — Test
- [ ] P06-E1 **Owner-only**: GV khác 403; Admin không phải chủ 403; chủ 200 ([[adr-013-exam-stats-owner-only]])
- [ ] P06-E2 Số liệu: seed có tập lượt cố định ⇒ kiểm `enrolledCount/submittedCount/completionRate/averageScore` chính xác; chưa ai nộp ⇒ `null`/0
- [ ] P06-E3 Chuyển trạng thái & khóa sửa; xóa câu khi đã có lượt ⇒ chặn
- [ ] P06-E4 Gỡ mock; e2e: GV tạo đề → mở → SV thi → GV xem thống kê & chi tiết
- [ ] P06-E5 DoD + log (đạt **M2**)

## Rủi ro
Thống kê chậm khi nhiều lượt ⇒ index `attempts(exam_id)`; `EXPLAIN` truy vấn; phân trang bảng SV.
