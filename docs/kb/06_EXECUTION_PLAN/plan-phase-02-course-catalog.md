---
id: plan-phase-02-course-catalog
title: Phase 02 — Danh mục khóa học & ghi danh (UC03)
type: plan
status: living
tags: [plan, catalog, enroll, f2]
related: [plan-00-overview, concept-course-structure, concept-enrollment-progress, api-catalog, ui-screens-client]
source: "UC03; UI C02, C03, C04"
updated: 2026-11-15
---
# Phase 02 — Catalog & Enroll

**Phạm vi**: C02 trang chủ, C03 danh mục + lọc, C04 chi tiết (2 trạng thái), đăng ký học. **Phụ thuộc**: P01. **FILE_MAPPING**: CL-03…CL-06. **Cỡ**: M.

## A — UI + Mock
- [ ] P02-A1 Types (`backend/src/types/dto/…` rồi `./sync-types.sh`): `CourseCardDto`, `CourseDetailDto`, `PublicStatsDto`, query schema list
- [ ] P02-A2 Fixtures 6 khóa + modules/bài/bài kiểm tra; `catalog.mock.ts` (lọc `topic/level/q`, phân trang, `sort=popular`, nhánh empty/error, ghi danh giả)
- [ ] P02-A3 Components: `CourseCard` (màu theo chủ đề, badge cấp độ), `TopicTile`, `StatStrip`, `CourseFilterSidebar`, `Pagination`
- [ ] P02-A4 C02 (Server Component): hero, StatStrip, Chủ đề, Khóa học phổ biến, footer
- [ ] P02-A5 C03: lọc đồng bộ URL, đổi lọc ⇒ `page=1`, empty state, skeleton
- [ ] P02-A6 C04: `CourseInfoCard`, `ModuleAccordion` (+ hàng bài kiểm tra G-08), `EnrollPanel` 2 trạng thái, tab Tổng quan (G-09)
- [ ] P02-A7 Khách bấm Đăng ký học ⇒ `/login?next=`
## B — Review
- [ ] P02-B1 Khớp C02/C03/C04a/C04b · [ ] lọc/URL đúng · [ ] G-08, G-09 duyệt
## C — Wire
- [ ] P02-C1 `catalog.http.ts`; Server Components dùng `NEXT_PUBLIC_API_BASE_URL`; trang chi tiết lấy `enrollment` ở client khi có phiên
## D — Backend
- [ ] P02-D1 `public`: `GET /public/stats` (cache 60 s)
- [ ] P02-D2 `courses`: `GET /courses` (lọc nhiều giá trị, `q`, sort, count dẫn xuất qua `groupBy`/`_count`, phân trang)
- [ ] P02-D3 `GET /courses/:id` (chỉ `PUBLISHED`, bài đã xuất bản, `enrollment` khi SV, ẩn `fileUrl`, bài kiểm tra `OPEN|CLOSED`)
- [ ] P02-D4 `enrollments`: `POST /courses/:id/enroll` (`ALREADY_ENROLLED`)
- [ ] P02-D5 Chỉ mục: `courses(status)`, `enrollments(course_id)` đã có ở migration — kiểm `EXPLAIN` danh sách
## E — Test
- [ ] P02-E1 API: chỉ khóa PUBLISHED; lọc kết hợp; popular đúng thứ tự; detail ẩn bài chưa xuất bản; enroll 201/409/401/403
- [ ] P02-E2 Gỡ `catalog` khỏi mock; e2e: duyệt → lọc → xem chi tiết → đăng ký → trạng thái "Đã đăng ký"
- [ ] P02-E3 DoD + log

## Rủi ro
Đếm `lessonCount/duration` gây N+1 ⇒ dùng truy vấn tổng hợp một lần; cân nhắc cột tính sẵn nếu chậm.
