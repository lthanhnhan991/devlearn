---
id: plan-phase-06-exam-admin-stats
title: Phase 06 — Admin: bài kiểm tra, câu hỏi & thống kê (UC10, UC12)
type: plan
status: living
tags: [plan, admin, exam, statistics]
related: [plan-00-overview, workflow-solo-dev, concept-exam-lifecycle, concept-exam-statistics, api-admin-exams, api-admin-exam-stats, adr-013-exam-stats-owner-only, ui-screens-admin]
source: "UC10, UC12; UI A04, A07, A08"
updated: 2026-11-15
---
# Phase 06 — Admin: Exams & Stats

**Phạm vi**: A04 soạn đề, A07 thống kê, A08 chi tiết bài làm. **Phụ thuộc**: P04, P05. **FILE_MAPPING**: AD-07…AD-09. **Cỡ**: L. Không thêm model DB mới.

## Việc cần làm
### DTO
- [ ] P06-1 `backend/src/types/dto/admin-exam.ts`, `admin-stats.ts`: `AdminExamRowDto/Dto`, `AdminQuestionUpsertReq`, `ExamStatsDto`, `StudentAttemptsDto`, `AdminAttemptReviewDto` ([[api-admin-exams]], [[api-admin-exam-stats]]) → `./sync-types.sh`
### UI
- [ ] P06-2 A04: `ExamList` + tạo bài (G-04), `ExamStatusControl` (Nháp/Mở/Đóng), form Thời gian/Điểm đạt, `QuestionEditor` (4 radio A–D, Lưu/Xóa có xác nhận), danh sách câu hỏi, nút **Xem thống kê**; thông báo rõ khi bài `OPEN` không sửa được câu hỏi
- [ ] P06-3 A07: hai select Khóa → Bài, 4 `StatCard`, thanh tỷ lệ + công thức, `StudentResultTable`, trạng thái "chưa có SV nộp", `403` ⇒ `ErrorState`
- [ ] P06-4 A08: header, `AttemptSelect` (Lần làm, đánh dấu điểm cao nhất), `AttemptReview` (Đúng/Sai/Chưa trả lời, tô màu)
### Gọi API (http)
- [ ] P06-5 `services/http/admin-exam.http.ts`, `admin-stats.http.ts`; ánh xạ lỗi `409 EXAM_*` sang thông điệp tiếng Việt
### Backend
- [ ] P06-6 `modules/exams` (admin): list/create (`EXAM_DUPLICATE`)/get/patch/status/delete; luật chuyển trạng thái ([[concept-exam-lifecycle]])
- [ ] P06-7 Câu hỏi: create/put/delete/order; đúng 4 lựa chọn, đúng 1 đáp án đúng; chỉ khi `DRAFT`
- [ ] P06-8 `modules/exam-stats`: `assertCourseOwnerStrict` (**không ngoại lệ Admin**); tổng hợp bằng `groupBy`; `averageScore` theo điểm cao nhất ([[concept-exam-statistics]])
- [ ] P06-9 Danh sách lượt của SV + chi tiết lượt (dùng chung mapper `AttemptReview` với phía SV)
### Cập nhật DB
- [ ] P06-10 Không đổi schema; bổ sung `seed.ts` thêm lượt làm của ~10 SV (có câu bỏ trống) để thống kê có số liệu
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run db:seed`

## Checklist test tay (Tech Lead)
- [ ] **Owner-only**: GV khác ⇒ 403; Admin không phải chủ ⇒ 403; chủ khóa ⇒ xem được
- [ ] Số liệu 4 thẻ khớp seed (đã đăng ký / đã nộp / tỷ lệ / điểm TB); chưa ai nộp ⇒ 0%/trống
- [ ] Tạo đề → thêm 10 câu → Mở → SV thi → GV xem thống kê & chi tiết (đúng/sai/chưa trả lời)
- [ ] Bài `OPEN` không sửa/xóa câu hỏi được; xóa bài đã có lượt làm ⇒ 409

## Rủi ro
Thống kê chậm khi nhiều lượt ⇒ index `attempts(exam_id)`; phân trang bảng SV.
