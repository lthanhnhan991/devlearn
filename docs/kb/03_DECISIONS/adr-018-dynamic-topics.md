---
id: adr-018-dynamic-topics
title: ADR-018 — Chủ đề động (bảng `topics`) thay cho chủ đề cố định
type: decision
status: accepted
tags: [adr, topics, database, catalog, admin]
related: [concept-topics, concept-course-structure, database-erd, database-migration-topics, api-catalog, api-admin-topics, api-admin-courses, delta-vs-thesis, plan-phase-02-course-catalog, plan-phase-04-admin-content]
source: "Đồ án bản _1 §3.1 (topics, courses.topic_id); yêu cầu của Tech Lead sau Phase 02"
updated: 2026-11-21
---
# ADR-018 — Chủ đề động (`topics`)

## Bối cảnh
KB trước đó coi chủ đề là **4 mã cố định** (`PROGRAMMING`/`DATABASE`/`WEB`/`SOFTWARE_ENGINEERING`) lưu ở `courses.topic` (varchar) và kiểm bằng zod + `labels.ts` (D-08/U-01 ở [[delta-vs-thesis]]). Thêm/đổi/ẩn một chủ đề phải sửa code và triển khai lại. Đồ án bản `_1` (§3.1) đã mô hình hóa **bảng `topics`** (`id, name, slug, description, is_active, display_order`) và `courses.topic_id → topics`. Phase 02 đã hoàn thành theo thiết kế cũ nên cần điều chỉnh.

## Quyết định
1. **Bảng `topics`** (quan hệ **1-N**: một chủ đề — nhiều khóa học), cột như đồ án + **bổ sung `color`, `icon`** (metadata hiển thị, nullable).
2. `courses.topic` (varchar) **bỏ**, thay bằng `courses.topic_id` **NOT NULL**, FK `ON DELETE RESTRICT`.
3. **Ẩn/hiện bằng `is_active`**: chủ đề ẩn không xuất hiện ở tile/bộ lọc của Client, **nhưng khóa thuộc chủ đề vẫn hiển thị** (không mất dữ liệu, không làm hỏng "Khóa học của tôi") — mặc định, xem [[OPEN_QUESTIONS]] Q-17.
4. **Xóa chủ đề** chỉ khi không còn khóa nào tham chiếu (`409 TOPIC_IN_USE`) và **chỉ ADMIN** (Q-16); thao tác thường dùng là tắt `is_active`.
5. **Client lọc bằng `slug`** (`/courses?topic=lap-trinh`, lặp được). `slug` duy nhất, sinh từ tên, **bất biến sau khi tạo**.
6. **Danh sách chủ đề cho Client** lấy từ API công khai `GET /topics` (chỉ chủ đề hoạt động, có `courseCount`), không còn hằng số ở FE.
7. **Quản trị chủ đề** (thêm, sửa, sắp xếp `display_order`, bật/tắt `is_active`) cho **TEACHER và ADMIN** qua màn **A09** `/admin/topics` + [[api-admin-topics]].
8. `level` (cấp độ) **giữ nguyên là mã cố định** — chỉ chủ đề được động hóa.
9. **Phân phase**: DB + `GET /topics` + chỉnh Client làm ở **P02b** ([[plan-phase-02-course-catalog]]); CRUD quản trị ở **P04** ([[plan-phase-04-admin-content]]); migration `p02b_topics` có backfill ([[database-migration-topics]]).

## Phương án đã cân nhắc
| Phương án | Vì sao không chọn |
|---|---|
| Giữ mã cố định + `labels.ts` | Đổi chủ đề cần sửa code; trái đồ án bản `_1` |
| Enum Postgres/Prisma cho chủ đề | Thêm giá trị = migration; không ẩn/sắp xếp được |
| File cấu hình JSON | Không quản trị được trên giao diện, không FK |
| Quan hệ nhiều-nhiều khóa ↔ chủ đề | Đồ án quy định 1-N; phức tạp hơn nhu cầu |

## Hệ quả
- (+) GV/Admin tự quản chủ đề trên giao diện; Client luôn đồng bộ với hệ thống; không mất dữ liệu khi ẩn/xóa.
- (−) **Đổi hợp đồng**: `CourseCardDto.topic`, `CourseDetailDto.topic`, `AdminCourseRowDto.topic` thành đối tượng `TopicRefDto`; tham số lọc đổi từ mã sang `slug`; tạo/sửa khóa dùng `topicId`.
- (−) Code Phase 02 đã làm phải điều chỉnh (các mục `P02-T*`); `labels.ts`/`constants.ts` bỏ phần chủ đề; `seed.ts` thêm bảng `topics`.
- (−) Thêm 6 endpoint (1 công khai + 5 quản trị) và 1 màn hình chưa có thiết kế (G-17).
- Thiết kế **không** ràng buộc việc GV khác nhau cùng sửa chủ đề dùng chung (last-write-wins); chấp nhận ở quy mô Solo Dev.
