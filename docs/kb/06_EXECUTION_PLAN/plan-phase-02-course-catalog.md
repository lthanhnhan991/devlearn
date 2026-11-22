---
id: plan-phase-02-course-catalog
title: Phase 02 — Danh mục khóa học & ghi danh (UC03)
type: plan
status: living
tags: [plan, catalog, enroll, f2]
related: [adr-018-dynamic-topics, concept-topics, database-migration-topics, plan-00-overview, workflow-solo-dev, concept-course-structure, concept-enrollment-progress, api-catalog, ui-screens-client, database-erd, database-seed-data]
source: "UC03; UI C02, C03, C04"
updated: 2026-11-21
---
# Phase 02 — Catalog & Enroll

**Phạm vi**: C02 trang chủ, C03 danh mục + lọc, C04 chi tiết (2 trạng thái), đăng ký học. **Phụ thuộc**: P01. **FILE_MAPPING**: CL-03…CL-06. **Cỡ**: M.
Quy trình: [[workflow-solo-dev]] — làm trọn một lượt, không mock.
**Trạng thái**: Hoàn tất toàn diện & đã kiểm thử thành công (Phase 02 gốc + Chủ đề động `topics` P02b theo [[adr-018-dynamic-topics]] + Quản trị chủ đề A09). Sẵn sàng chuyển sang Phase 03.

## Việc cần làm
### DTO
- [x] P02-1 `backend/src/types/dto/catalog.ts`: `CourseCardDto`, `CourseDetailDto`, `PublicStatsDto`, schema query danh sách ([[api-catalog]]) → `./sync-types.sh` *(↻ P02-T1: `topic` thành `TopicRefDto`, query lọc theo slug)*
### UI
- [x] P02-2 Component: `CourseCard` (màu theo chủ đề, badge cấp độ), `TopicTile`, `StatStrip`, `CourseFilterSidebar`, `Pagination` *(↻ P02-T2…T4: màu/nhãn/danh sách chủ đề lấy từ `topics`)*
- [x] P02-3 C02 (Server Component): hero, StatStrip, Chủ đề, Khóa học phổ biến, footer
- [x] P02-4 C03: lọc đồng bộ URL, đổi lọc ⇒ `page=1`, `EmptyState`, skeleton *(↻ P02-T2: bộ lọc chủ đề động, `?topic=<slug>`)*
- [x] P02-5 C04: `CourseInfoCard`, `ModuleAccordion` (+ hàng bài kiểm tra — G-08), `EnrollPanel` 2 trạng thái, tab Tổng quan (G-09); khách bấm Đăng ký ⇒ `/login?next=`
### Gọi API (http)
- [x] P02-6 `services/http/catalog.http.ts`: `getPublicStats`, `listCourses`, `getCourseDetail`, `enrollCourse`; Server Components gọi bằng `NEXT_PUBLIC_API_BASE_URL`; `enrollment` của trang chi tiết lấy ở client khi có phiên *(↻ P02-T5: thêm `listTopics`)*
### Backend
- [x] P02-7 `modules/public`: `GET /public/stats` (cache 60 s)
- [x] P02-8 `modules/courses`: `GET /courses` (lọc nhiều giá trị, `q`, sort, count dẫn xuất bằng `_count`/`groupBy`, phân trang) *(↻ P02-T7: lọc theo slug chủ đề)*
- [x] P02-9 `GET /courses/:id` (chỉ `PUBLISHED`, bài đã xuất bản, `enrollment` khi là SV, **ẩn `fileUrl`**, bài kiểm tra `OPEN|CLOSED`)
- [x] P02-10 `modules/enrollments`: `POST /courses/:id/enroll` (`ALREADY_ENROLLED`)
### Cập nhật DB
- [x] P02-11 `schema.prisma`: thêm enum `CourseStatus`, `ContentType`, `ExamStatus` và model `Course`, `Module`, `Lesson`, `Enrollment`, `Exam`, `Question`, `Option` ([[database-prisma-schema]], [[database-prisma-schema-exam-ai]]); thêm `User.coursesTaught`, `User.enrollments`; **bỏ** các trường quan hệ tới model chưa có (bảng ở [[database-erd]]) *(↻ P02-T8: thêm `Topic`, `Course.topic` → `Course.topicId`)*
- [x] P02-12 Migration SQL: CHECK + `options_one_correct_per_question` ([[database-erd]])
- [x] P02-13 `prisma/seed.ts`: 2 giảng viên, 6 khóa + module/bài/bài kiểm tra, ghi danh cho SV mẫu ([[database-seed-data]]) *(↻ P02-T10: seed thêm `topics`)*
- [x] ▶️ Tech Lead chạy: `cd backend && npm run prisma:migrate -- --name p02_catalog` rồi `npm run db:seed`

## Điều chỉnh: Chủ đề động (`topics`) — P02b ✅
> Thứ tự: DTO → UI → gọi API → Backend → DB. Ánh xạ mã cũ → chủ đề mới và SQL backfill: [[database-migration-topics]]. Quy tắc: [[concept-topics]].
### DTO
- [x] P02-T1 `backend/src/types/dto/topic.ts` (mới): `TopicRefDto`, `TopicDto`; sửa `dto/catalog.ts`: `CourseCardDto.topic` và `CourseDetailDto.topic` → `TopicRefDto`, tham số `topic` của query danh sách → mảng **slug**; `constants.ts` (bỏ mã chủ đề cố định; thêm `TOPIC_COLOR_REGEX`, `TOPIC_ICON_KEYS`), `labels.ts` (bỏ nhãn chủ đề), `errors.ts` (thêm `TOPIC_*`) → `./sync-types.sh` ([[api-catalog]])
### UI
- [x] P02-T2 `CourseFilterSidebar`: danh sách chủ đề từ `GET /topics` (kèm số khóa), đồng bộ URL `?topic=<slug>`; bỏ danh sách chủ đề hardcode
- [x] P02-T3 `TopicTile` (C02): từ `GET /topics`, chỉ chủ đề `courseCount > 0`, tối đa 8 → `/courses?topic=<slug>`
- [x] P02-T4 `CourseCard` / `CourseInfoCard`: màu = `topic.color` (`null` ⇒ token `client.slate`), nhãn = `topic.name` (`MyCourseRow` ở P03 áp dụng khi làm)
### Gọi API (http)
- [x] P02-T5 `services/http/catalog.http.ts`: thêm `listTopics`; `listCourses` truyền `topic` = slug
### Backend
- [x] P02-T6 `modules/topics` (công khai): `GET /topics` — chỉ `is_active`, sắp `display_order`, `courseCount` = khóa `PUBLISHED`
- [x] P02-T7 `modules/courses`: lọc `topic` theo slug (join `topics`); mapper card/detail trả `topic: TopicRefDto`; khóa thuộc chủ đề ẩn **vẫn** được liệt kê
### Cập nhật DB
- [x] P02-T8 `schema.prisma`: thêm model `Topic`; `Course.topic` (String) → `Course.topicId` + `topic Topic @relation(..., onDelete: Restrict)` + `@@index([topicId])` ([[database-prisma-schema]])
- [x] P02-T9 Migration `p02b_topics` + CHECK màu: Cách A (`db:reset`, chỉ dev) hoặc Cách B (backfill từ `courses.topic`) — [[database-migration-topics]]
- [x] P02-T10 `seed-ids.ts` thêm `TOPIC_*_ID`; `seed.ts`: upsert 4 chủ đề hoạt động + 1 chủ đề ẩn mẫu (`tri-tue-nhan-tao`); khóa gán `topicId` ([[database-seed-data]])
- [x] ▶️ Tech Lead chạy: (Cách A) `cd backend && npm run db:reset` — hoặc (Cách B) `npx prisma migrate dev --create-only --name p02b_topics` → sửa SQL → `npx prisma migrate dev` → `npm run db:seed`; rồi khởi động lại backend (đã hoàn thành thực tế)

## Checklist test tay (Tech Lead — bước 3)
- [x] Trang chủ hiện số liệu + 4 khóa phổ biến; Danh mục lọc chủ đề/cấp độ/tìm kiếm đúng, URL giữ bộ lọc
- [x] Chi tiết khóa: tên module/bài hiện, **không lộ link file**; khóa `DRAFT` không xem được
- [x] Đăng ký học ⇒ chuyển sang "Đã đăng ký"; bấm lần nữa không lỗi; khách bị chuyển về đăng nhập

### Checklist test tay bổ sung (chủ đề động) ✅
- [x] Trang chủ: tile chủ đề lấy từ hệ thống, đúng thứ tự `display_order`; chủ đề không có khóa `PUBLISHED` không hiện tile
- [x] Danh mục: cột Chủ đề động kèm số khóa; chọn nhiều chủ đề lọc đúng; URL dạng `?topic=lap-trinh`; slug lạ ⇒ danh sách rỗng, không lỗi
- [x] Chủ đề ẩn mẫu (`tri-tue-nhan-tao`) **không** hiện ở tile/bộ lọc
- [x] Màu thẻ khóa khớp `topic.color`; chủ đề `color = null` dùng màu mặc định
- [x] Sau migration không còn khóa nào thiếu `topic_id`; `GET /courses` và `GET /courses/:id` trả `topic` là **đối tượng**

## Rủi ro
Đếm `lessonCount`/thời lượng gây N+1 ⇒ dùng truy vấn tổng hợp một lần.
Migration `p02b_topics` thêm cột NOT NULL trên bảng đã có dữ liệu ⇒ **không** áp dụng migration Prisma tự sinh; dùng Cách A hoặc Cách B ([[database-migration-topics]]).
