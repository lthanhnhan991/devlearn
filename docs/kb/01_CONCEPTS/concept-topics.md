---
id: concept-topics
title: Chủ đề khóa học động (topics)
type: concept
status: stable
tags: [topics, catalog, admin, category]
related: [adr-018-dynamic-topics, concept-course-structure, api-catalog, api-admin-topics, api-admin-courses, database-erd, database-migration-topics, concept-roles-permissions, ui-screens-client, ui-screens-admin]
source: "Đồ án bản _1 §3.1 (topics); ADR-018"
updated: 2026-11-21
---
# Chủ đề khóa học (Topics)

**Chủ đề** là danh mục phân loại khóa học (Lập trình, Cơ sở dữ liệu, Web, Công nghệ phần mềm…), lưu ở bảng `topics` và **quản trị động**. Quan hệ **1-N**: một chủ đề có nhiều khóa học; mỗi khóa thuộc **đúng một** chủ đề (`courses.topic_id`, bắt buộc). Quyết định: [[adr-018-dynamic-topics]].

## Thuộc tính
| Cột | Quy tắc |
|---|---|
| `id` | uuid |
| `name` | 1–100 ký tự; **duy nhất** không phân biệt hoa thường (service kiểm trước khi ghi) |
| `slug` | 1–100 ký tự, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, **duy nhất**; tự sinh từ `name` (bỏ dấu, `đ→d`, ký tự lạ → `-`); **không đổi sau khi tạo** |
| `description` | text, mặc định rỗng |
| `color` | `null` hoặc `#RRGGBB` (CHECK ở DB); màu thẻ khóa/ô chủ đề; `null` ⇒ dùng token mặc định `client.slate` |
| `icon` | `null` hoặc một khóa trong `TOPIC_ICON_KEYS` (`code`, `database`, `globe`, `bug`, `cpu`, `server`, `shield`, `book`); phiên bản đầu UI chưa bắt buộc hiển thị |
| `is_active` | mặc định `true` |
| `display_order` | số nguyên ≥ 0, tăng dần; server ghi lại `0..n-1` khi sắp xếp |
| `created_at` | timestamptz |

`color` và `icon` là **bổ sung so với Đồ án** (D-09 ở [[delta-vs-thesis]]).

## Quy tắc nghiệp vụ
1. **Tạo**: `slug` tự sinh nếu bỏ trống (có thể nhập tay khi tạo); `display_order = max + 1`; `is_active = true`.
2. **Sắp xếp**: gửi toàn bộ danh sách id đã sắp (cả chủ đề đang ẩn) ⇒ server ghi lại `display_order` trong một transaction.
3. **Bật/tắt (`is_active`)**:
   - Chủ đề **ẩn** không có trong `GET /topics` (tile Trang chủ, bộ lọc Danh mục).
   - **Khóa thuộc chủ đề ẩn vẫn hiển thị** (danh mục, trang chủ, chi tiết, "Khóa học của tôi"), nhãn/màu vẫn lấy từ chủ đề đó — mặc định, xem Q-17 ở [[OPEN_QUESTIONS]].
   - Không thể **gán/đổi sang** chủ đề ẩn cho khóa (`409 TOPIC_INACTIVE`); khóa đang ở chủ đề ẩn vẫn sửa các trường khác bình thường.
4. **Xóa**: chỉ **ADMIN**, chỉ khi **không có khóa nào** (mọi trạng thái) tham chiếu ⇒ nếu không `409 TOPIC_IN_USE`. FK `ON DELETE RESTRICT` bảo vệ ở DB. Nên **tắt** thay vì xóa.
5. **Gán cho khóa**: `topicId` bắt buộc khi tạo khóa; không có chủ đề "mặc định/không phân loại".
6. **Lọc phía Client**: `?topic=<slug>` lặp được; slug không tồn tại ⇒ danh sách rỗng (không lỗi). Slug của chủ đề đang ẩn vẫn lọc được nếu truy cập trực tiếp URL.
7. **Số khóa**: `GET /topics` (công khai) đếm khóa **`PUBLISHED`**; `GET /admin/topics` đếm **mọi trạng thái** (để biết có xóa được không).

## Quyền ([[concept-roles-permissions]])
| Hành động | TEACHER | ADMIN |
|---|---|---|
| Xem danh sách (kể cả ẩn), thêm, sửa, sắp xếp, bật/tắt | ✅ | ✅ |
| Xóa chủ đề chưa dùng | ❌ | ✅ |
Chủ đề là **dữ liệu dùng chung**, không có "chủ sở hữu" (GV nào cũng sửa được — Q-16).

## Hiển thị
- **Client**: tile Trang chủ (chỉ chủ đề `courseCount > 0`, tối đa 8), cột lọc Danh mục (mọi chủ đề hoạt động kèm số khóa), màu thẻ khóa = `topic.color`, nhãn = `topic.name` ([[ui-screens-client]]).
- **Admin**: màn A09 `/admin/topics`; ô chọn chủ đề trong form khóa (chỉ chủ đề hoạt động) ([[ui-screens-admin]]).
- Không hardcode tên/màu chủ đề ở FE; `labels.ts` **không còn** nhãn chủ đề.

## Dữ liệu mẫu & migration
4 chủ đề hoạt động + 1 chủ đề ẩn mẫu: [[database-seed-data]]. Chuyển từ `courses.topic` cũ: [[database-migration-topics]].
Hợp đồng API: công khai [[api-catalog]]; quản trị [[api-admin-topics]]; gán cho khóa [[api-admin-courses]].
