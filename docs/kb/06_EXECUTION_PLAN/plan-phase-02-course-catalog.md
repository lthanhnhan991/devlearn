---
id: plan-phase-02-course-catalog
title: Phase 02 — Danh mục khóa học & ghi danh (UC03)
type: plan
status: living
tags: [plan, catalog, enroll, f2]
related: [plan-00-overview, workflow-solo-dev, concept-course-structure, concept-enrollment-progress, api-catalog, ui-screens-client, database-erd, database-seed-data]
source: "UC03; UI C02, C03, C04"
updated: 2026-11-15
---
# Phase 02 — Catalog & Enroll

**Phạm vi**: C02 trang chủ, C03 danh mục + lọc, C04 chi tiết (2 trạng thái), đăng ký học. **Phụ thuộc**: P01. **FILE_MAPPING**: CL-03…CL-06. **Cỡ**: M.
Quy trình: [[workflow-solo-dev]] — làm trọn một lượt, không mock.

## Việc cần làm
### DTO
- [ ] P02-1 `backend/src/types/dto/catalog.ts`: `CourseCardDto`, `CourseDetailDto`, `PublicStatsDto`, schema query danh sách ([[api-catalog]]) → `./sync-types.sh`
### UI
- [ ] P02-2 Component: `CourseCard` (màu theo chủ đề, badge cấp độ), `TopicTile`, `StatStrip`, `CourseFilterSidebar`, `Pagination`
- [ ] P02-3 C02 (Server Component): hero, StatStrip, Chủ đề, Khóa học phổ biến, footer
- [ ] P02-4 C03: lọc đồng bộ URL, đổi lọc ⇒ `page=1`, `EmptyState`, skeleton
- [ ] P02-5 C04: `CourseInfoCard`, `ModuleAccordion` (+ hàng bài kiểm tra — G-08), `EnrollPanel` 2 trạng thái, tab Tổng quan (G-09); khách bấm Đăng ký ⇒ `/login?next=`
### Gọi API (http)
- [ ] P02-6 `services/http/catalog.http.ts`: `getPublicStats`, `listCourses`, `getCourseDetail`, `enrollCourse`; Server Components gọi bằng `NEXT_PUBLIC_API_BASE_URL`; `enrollment` của trang chi tiết lấy ở client khi có phiên
### Backend
- [ ] P02-7 `modules/public`: `GET /public/stats` (cache 60 s)
- [ ] P02-8 `modules/courses`: `GET /courses` (lọc nhiều giá trị, `q`, sort, count dẫn xuất bằng `_count`/`groupBy`, phân trang)
- [ ] P02-9 `GET /courses/:id` (chỉ `PUBLISHED`, bài đã xuất bản, `enrollment` khi là SV, **ẩn `fileUrl`**, bài kiểm tra `OPEN|CLOSED`)
- [ ] P02-10 `modules/enrollments`: `POST /courses/:id/enroll` (`ALREADY_ENROLLED`)
### Cập nhật DB
- [ ] P02-11 `schema.prisma`: thêm enum `CourseStatus`, `ContentType`, `ExamStatus` và model `Course`, `Module`, `Lesson`, `Enrollment`, `Exam`, `Question`, `Option` ([[database-prisma-schema]], [[database-prisma-schema-exam-ai]]); thêm `User.coursesTaught`, `User.enrollments`; **bỏ** các trường quan hệ tới model chưa có (bảng ở [[database-erd]])
- [ ] P02-12 Migration SQL: CHECK + `options_one_correct_per_question` ([[database-erd]])
- [ ] P02-13 `prisma/seed.ts`: 2 giảng viên, 6 khóa + module/bài/bài kiểm tra, ghi danh cho SV mẫu ([[database-seed-data]])
- [ ] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p02_catalog` rồi `npm run db:seed`

## Checklist test tay (Tech Lead — bước 3)
- [ ] Trang chủ hiện số liệu + 4 khóa phổ biến; Danh mục lọc chủ đề/cấp độ/tìm kiếm đúng, URL giữ bộ lọc
- [ ] Chi tiết khóa: tên module/bài hiện, **không lộ link file**; khóa `DRAFT` không xem được
- [ ] Đăng ký học ⇒ chuyển sang "Đã đăng ký"; bấm lần nữa không lỗi; khách bị chuyển về đăng nhập

## Rủi ro
Đếm `lessonCount`/thời lượng gây N+1 ⇒ dùng truy vấn tổng hợp một lần.
