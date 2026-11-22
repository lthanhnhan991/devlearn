---
id: ui-screens-client
title: Đặc tả màn hình CLIENT (C01–C09)
type: ui
status: stable
tags: [ui, client, screens, student]
related: [concept-topics, adr-018-dynamic-topics, ui-design-system, ui-screens-admin, FILE_MAPPING, api-auth, api-catalog, api-learning, api-exam-student, api-ai-chat, delta-vs-thesis]
source: "Design_ui_devlearn/CLIENT · 01…09"
updated: 2026-11-21
---
# Màn hình CLIENT

Mỗi màn: **file thiết kế** → route → vùng UI → dữ liệu (API) → trạng thái bắt buộc → ghi chú. Mã `G-xx` = khoảng trống thiết kế, xem [[delta-vs-thesis]].

## C01 · Đăng nhập / Đăng ký — `CLIENT · 01 Đăng nhập Đăng ký.png`
- **Route** `/login` (`?tab=register`, `?next=`). Layout chia đôi: trái nền xanh `#2E7D32` ("Học phát triển phần mềm cùng trợ lý AI."), phải thẻ form.
- **Vùng**: tab *Đăng nhập | Đăng ký*; Email (placeholder `ten@stu.edu.vn`), Mật khẩu, nút **Đăng nhập**; dòng "Giảng viên và Quản trị viên đăng nhập tại cổng quản trị riêng." (link `/admin/login`).
- **API**: `POST /auth/login`, `POST /auth/register`.
- **Trạng thái**: submitting, lỗi `401` (sai thông tin), `403 ACCOUNT_LOCKED`, `403 WRONG_PORTAL`, `409 EMAIL_TAKEN`.
- **Gap G-01**: tab *Đăng ký* chưa thiết kế — form: Họ tên, MSSV, Email, Mật khẩu, Nhập lại mật khẩu.

## C02 · Trang chủ (chưa đăng nhập) — `CLIENT · 02 Trang chủ (chưa đăng nhập).png`
- **Route** `/` (Server Component). Navbar: *Khám phá · Danh mục · Khóa học của tôi · Trợ lý AI*, ô **Tìm khóa học**, nút **Đăng nhập / Đăng ký** (khi đã đăng nhập: avatar chữ cái đầu).
- **Vùng**: Hero ("Xây kỹ năng. Xây tương lai." + 2 nút + 2 khối màu); **StatStrip** (Khóa học · Sinh viên · Giảng viên · % Hoàn thành khóa học); **Chủ đề** (`TopicTile` lấy từ `GET /topics` — chỉ chủ đề có khóa, tối đa 8, màu `topic.color` → `/courses?topic=<slug>`); **Khóa học phổ biến** (4 CourseCard) + nút **Xem tất cả khóa học**; footer.
- **API**: `GET /public/stats`, `GET /topics`, `GET /courses?sort=popular&pageSize=4`.
- **Ghi chú**: "Khóa học của tôi"/"Trợ lý AI" khi chưa đăng nhập → chuyển `/login?next=`.

## C03 · Danh mục khóa học — `CLIENT · 03 Danh mục khóa học.png`
- **Route** `/courses` (`?q&topic=<slug>&level&page`). Breadcrumb *Trang chủ › Danh mục khóa học*.
- **Vùng**: cột trái **Chủ đề** (checkbox **động** từ `GET /topics`, kèm số khóa; chủ đề ẩn không hiện nhưng khóa thuộc chủ đề đó vẫn liệt kê) + **Cấp độ** (checkbox); lưới CourseCard 3 cột (badge cấp độ, chủ đề, tên, "GV: … · n bài học · n giờ").
- **API**: `GET /topics`, `GET /courses` (lọc nhiều giá trị: `topic=<slug>&topic=<slug>`). **Trạng thái**: empty "Không có khóa học phù hợp", skeleton, error.
- Bộ lọc đồng bộ URL; đổi lọc ⇒ về `page=1`.

## C04 · Chi tiết khóa học — `CLIENT · 04 … (chưa đăng ký).png` & `(đã đăng ký).png`
- **Route** `/courses/[courseId]`. Hai trạng thái của **cùng một trang** (quyết định bởi `course.enrollment`).
- **Vùng chung**: breadcrumb; "Khoa CNTT · Khóa học"; tiêu đề; mô tả ngắn; thẻ xanh **Thông tin khóa học** (Miễn phí · n giờ; Cấp độ; n module · n bài kiểm tra; GV); tab **Tổng quan | Chương trình học**; danh sách **ModuleAccordion** ("Module 1: …", mở ra các bài + bài kiểm tra module).
- **C04a (chưa đăng ký)**: `EnrollPanel` — nút **Đăng ký học khóa học**, "n sinh viên đã đăng ký · Miễn phí". Khách chưa đăng nhập bấm ⇒ `/login?next=`.
- **C04b (đã đăng ký)**: nhãn ✓ **Đã đăng ký**, nút **Tiếp tục học** (→ `resumeLessonId`), "n học viên", thanh tiến độ + "Tiến độ của bạn: 35%".
- **API**: `GET /courses/:id`, `POST /courses/:id/enroll`.
- **Gap G-09**: nội dung tab *Tổng quan* (dùng `description`). **Gap G-08**: hàng bài kiểm tra trong accordion.

## C05 · Giao diện học tập — `CLIENT · 05 Giao diện học tập.png`
- **Route** `/learn/[courseId]/lessons/[lessonId]` (layout `(learn)`). Header: logo · tên khóa · thanh tiến độ + `35%` · nút **Thoát** (→ chi tiết khóa).
- **Vùng**: sidebar trái theo module ("Module 1 · 2/6 bài"; ✓ xong, ○ chưa, dòng hiện tại nền xanh nhạt); khu phải: tiêu đề bài, **LessonViewer** (khung đen 16:9 — video hoặc PDF), nút **← Bài trước / Bài tiếp theo →**, nút **Hoàn thành bài học**.
- **API**: `GET /courses/:id/learn`, `GET /lessons/:id`, `POST /lessons/:id/complete`.
- **Trạng thái**: lỗi tải nội dung + **Thử lại**; bài chưa có file ("Giảng viên chưa tải nội dung"); `403 NOT_ENROLLED` ⇒ về C04.
- **Gap G-16**: trình xem PDF; G-08: hàng bài kiểm tra trong sidebar.

## C06 · Làm bài kiểm tra — `CLIENT · 06 Làm bài kiểm tra.png`
- **Route** `/exams/[examId]` (layout `(learn)`). Header: logo · "Kiểm tra Module 1" · **Còn lại 12:45** (đếm ngược).
- **Vùng**: trái — "Câu 4 / 10", nội dung câu, 4 **OptionRadio** (A–D), nút **Câu trước**, **Nộp bài**; phải — **Danh sách câu** (lưới số, câu hiện tại xanh, câu đã trả lời có dấu) và thẻ **Kết quả sau khi nộp** ("8/10 · Đúng 8 câu · Xem lại đáp án") — **chỉ hiện sau khi nộp**; trước đó ẩn/để trống.
- **API**: `GET /exams/:id`, `GET /exams/:id/questions`, `POST /exams/:id/attempts`.
- **Hành vi**: chọn đáp án lưu state cục bộ; **Nộp bài** có xác nhận khi còn câu chưa làm; hết giờ ⇒ tự nộp; rời trang giữa chừng ⇒ cảnh báo `beforeunload`. Sau nộp: hiện kết quả + nút **Xem lại đáp án** (→ `/my-results/[attemptId]`) và **Làm lại** (nếu `OPEN`).
- **Trạng thái**: `403 EXAM_NOT_OPEN`, `403 NOT_ENROLLED`.

## C07 · Trợ lý AI — `CLIENT · 07 Trợ lý AI (RAG Chat).png`
- **Route** `/ai` (`?courseId=`). Tiêu đề "Trợ lý AI" + **Select khóa học** (các khóa đã ghi danh).
- **Vùng**: khung chat — bong bóng người dùng (xanh nhạt, phải), bong bóng AI (xám, trái) kèm **"Nguồn: [tên tài liệu], trang [n]"**; ô nhập "Hỏi về nội dung khóa học" + nút **Gửi**; chú thích "Sinh viên chỉ hỏi đáp. Tài liệu cho AI do Giảng viên tải lên ở khu vực Admin."
- **API**: `GET /ai/courses`, `GET /ai/courses/:id/messages`, `POST /ai/courses/:id/ask`.
- **Trạng thái**: đang trả lời (typing), `409 NO_READY_DOCUMENTS`, `429`, `502/504` (nút Thử lại), chưa có khóa nào ("Hãy đăng ký một khóa học").

## C08 · Khóa học của tôi — `CLIENT · 08 Khóa học của tôi (theo đăng ký).png`
- **Route** `/my-courses`. Tab **Đang học | Đã hoàn thành**; mỗi hàng **MyCourseRow**: ô màu = `topic.color`, tên, "`topic.name` · GV: …", thanh tiến độ + "Tiến độ n%", nút **Tiếp tục học** (hoặc **Bắt đầu học** khi 0%).
- Cột phải **Tổng quan học tập**: Khóa đang học · Khóa hoàn thành · Điểm kiểm tra trung bình.
- **API**: `GET /me/courses?status=`, `GET /me/learning-summary`.

## C09 · Kết quả kiểm tra của tôi — `CLIENT · 09 Kết quả kiểm tra của tôi.png`
- **Route** `/my-results`. Bảng: Khóa học · Bài kiểm tra · Lần làm · Điểm (cao nhất) `8/10` · Kết quả (chip Đạt/Chưa đạt) · Nộp lúc · **Xem lại**. Chú thích "Bạn chỉ xem được kết quả của chính mình."
- **API**: `GET /me/exam-results`; **Xem lại** ⇒ `GET /me/attempts/:attemptId`.
- **Gap G-07**: trang `/my-results/[attemptId]` (xem lại đáp án) chưa thiết kế — tái dùng `AttemptReview` của [[ui-screens-admin]] A08, bỏ thông tin SV.
