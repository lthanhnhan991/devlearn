---
id: ui-screens-admin
title: Đặc tả màn hình ADMIN (A00–A08)
type: ui
status: stable
tags: [ui, admin, teacher, screens]
related: [ui-design-system, ui-screens-client, FILE_MAPPING_ADMIN, concept-roles-permissions, api-admin-courses, api-admin-content, api-admin-exams, api-admin-exam-stats, api-admin-ai-docs, api-admin-users-dashboard, delta-vs-thesis]
source: "Design_ui_devlearn/ADMIN · 00…08"
updated: 2026-11-15
---
# Màn hình ADMIN

**AdminShell** (A01–A08): sidebar navy rộng ~256 px — logo **DevLearn** + badge `ADMIN`; nhóm *TỔNG QUAN* (Dashboard), *NỘI DUNG* (Khóa học, Bài học, Bài kiểm tra, Thống kê bài kiểm tra), *TRỢ LÝ AI* (Tài liệu AI), *HỆ THỐNG* (Người dùng — **chỉ ADMIN**). Topbar: breadcrumb + "Vai trò: X · email". Hình thiết kế có sidebar lệch nhau giữa các màn ⇒ **dùng một sidebar thống nhất** như trên (G-12). Nhiều màn có **InfoBanner** "Quản lý nội dung hiển thị ở CLIENT · <màn tương ứng>".

## A00 · Đăng nhập quản trị — `ADMIN · 00 Đăng nhập quản trị.png`
- `/admin/login`; nền navy; thẻ trắng: logo + badge ADMIN, "Đăng nhập quản trị", Email (`admin@edu.vn`), Mật khẩu, nút xanh **Đăng nhập quản trị**; chú thích "Chỉ tài khoản Teacher hoặc Admin được vào. Tài khoản Student sẽ bị từ chối."; link "← Về trang dành cho người học".
- API `POST /auth/admin/login`; lỗi `403 WRONG_PORTAL`, `403 ACCOUNT_LOCKED`, `401`.

## A01 · Dashboard — `ADMIN · 01 Dashboard.png`
- `/admin`. 4 **StatCard**: Sinh viên · Khóa học · Tỷ lệ hoàn thành · Lượt hỏi AI; **BarChart** "Tỷ lệ hoàn thành theo khóa học"; bảng **Hoạt động gần đây** (Người dùng · Hành động · Thời gian).
- API `GET /admin/dashboard` (phạm vi theo vai trò — [[concept-admin-users-dashboard]]).

## A02 · Quản lý khóa học — `ADMIN · 02 Quản lý khóa học.png`
- `/admin/courses`. InfoBanner → CLIENT·Danh mục. Nút **+ Thêm khóa học**; ô tìm + select trạng thái; bảng: Tên khóa học · Chủ đề · Giảng viên · Module · Học viên · Trạng thái (chip) · **Sửa · Xóa**.
- API `GET/POST/PATCH/DELETE /admin/courses…`.
- **Gap G-02** form tạo/sửa (Tên, Mô tả, Chủ đề, Cấp độ); **G-13** công tắc Xuất bản/Bản nháp; **G-14** xác nhận xóa; G-11 phân trang.

## A03 · Soạn bài học — `ADMIN · 03 Soạn bài học.png`
- `/admin/lessons?courseId=`. Breadcrumb *Quản trị › Khóa học › Nhập môn Python › Bài học*. Nút **Xem trước ở client**, **Lưu**.
- Trái **StructureTree** ("Cấu trúc": Module 1 → Bài 1, Bài 3 có tay kéo ⋮ để sắp xếp; **+ Thêm bài học**). Phải **LessonForm**: Tên bài học · Loại nội dung (Video/PDF) · vùng tải lên (kéo-thả, nét đứt) · checkbox **Xuất bản bài học**.
- API: `GET /admin/courses/:id/structure`, `POST/PATCH/DELETE` module & lesson, `POST /admin/lessons/:id/upload`, `PUT …/order`.
- **Gap G-03** thêm/đổi tên/xóa/sắp xếp **module**; **G-05** chọn khóa; hiển thị tiến trình upload + giới hạn 100 MB/10 MB; nhập link YouTube thay cho upload.

## A04 · Quản lý bài kiểm tra — `ADMIN · 04 Quản lý bài kiểm tra.png`
- `/admin/exams?courseId=&examId=`. Nút **Xem thống kê** (→ A07 cùng bài), **+ Thêm câu hỏi**.
- Trái danh sách bài ("Kiểm tra Module 1", "Kiểm tra cuối khóa"). Phải: **Thời gian (phút)**, **Điểm đạt**, ô **Câu hỏi**, 4 radio A–D (chọn đáp án đúng), nút **Lưu câu hỏi**, **Xóa** (viền đỏ).
- API: `GET /admin/courses/:id/exams`, `GET /admin/exams/:id`, `POST/PUT/DELETE` question.
- **Gap G-04** tạo bài kiểm tra + **điều khiển trạng thái** Nháp/Mở/Đóng (bắt buộc cho nghiệp vụ); danh sách câu hỏi đã có của bài (UI chỉ minh họa 1 câu); G-05 chọn khóa.

## A05 · Tài liệu AI — `ADMIN · 05 Tài liệu AI.png`
- `/admin/ai-documents`. **FileDropzone** "Kéo thả hoặc chọn tệp PDF để nạp vào AI"; bảng: Tên tài liệu · Khóa học · Trạng thái nạp (Đã nạp / Đang xử lý / Lỗi) · Ngày tải · **Nạp lại · Xóa**.
- API `GET/POST /admin/ai-documents`, `POST …/:id/reingest`, `DELETE …/:id`. Poll 3–5 s khi có dòng đang xử lý. **Gap G-05**: chọn khóa trước khi tải; hiển thị `errorMessage` khi Lỗi.

## A06 · Người dùng — `ADMIN · 06 Người dùng.png`
- `/admin/users` (**chỉ ADMIN**). Nút **+ Thêm người dùng**; ô "Tìm theo email"; bảng: Họ tên · Email · Vai trò (select Student/Teacher/Admin) · Trạng thái · **Lưu · Khóa**. Chú thích "Chỉ Admin truy cập mục này. Giảng viên không thấy mục Người dùng."
- API `GET/POST/PATCH /admin/users`. **Gap G-06** modal thêm người dùng. Khóa ⇒ nút đổi thành **Mở khóa**.

## A07 · Thống kê bài kiểm tra — `ADMIN · 07 Thống kê bài kiểm tra.png`
- `/admin/exam-stats?courseId=&examId=`. Hai select **Khóa học** → **Bài kiểm tra**; 4 thẻ: Đã đăng ký khóa học · Đã nộp bài · Tỷ lệ hoàn thành · Điểm trung bình; thanh tỷ lệ + công thức "= số sinh viên đã nộp bài ÷ số sinh viên đã đăng ký khóa học × 100%"; bảng **Sinh viên đã làm bài**: MSSV · Họ tên · Số lần nộp · Điểm cao nhất `x/10` · Nộp lần cuối · Kết quả · **Xem chi tiết**. Chú thích "Chỉ giảng viên phụ trách khóa học xem được…".
- API `GET /admin/exam-stats/exams/:examId`. `403` ⇒ ErrorState "Bạn không phụ trách khóa học này".

## A08 · Chi tiết bài làm — `ADMIN · 08 Chi tiết bài làm của sinh viên.png`
- `/admin/exam-stats/[examId]/students/[studentId]?attemptId=`. Link "← Danh sách sinh viên". Header: họ tên, "MSSV · Kiểm tra Module 1 · Nộp lúc …", select **Lần làm** ("Lần 2 (điểm cao nhất)"), điểm `8/10`, chip Đạt, "Đúng 8/10 câu".
- **AttemptReview**: mỗi câu — nhãn **Đúng/Sai/Chưa trả lời**; 4 đáp án: đúng nền xanh + "Đáp án đúng", SV chọn sai nền đỏ + "Sinh viên chọn", chọn đúng ghi "Đáp án đúng · Sinh viên chọn".
- API `GET /admin/exam-stats/exams/:examId/students/:studentId/attempts`, `GET /admin/exam-stats/attempts/:attemptId`.
