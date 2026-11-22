---
id: api-admin-topics
title: API — Admin: Quản lý chủ đề (topics)
type: api
status: stable
tags: [api, admin, topics]
related: [api-contracts, api-catalog, api-admin-courses, concept-topics, adr-018-dynamic-topics, concept-roles-permissions, plan-phase-04-admin-content, ui-screens-admin]
source: "Yêu cầu Tech Lead; ADR-018"
updated: 2026-11-21
---
# API — Admin / Topics

Quyền: 🧑‍🏫 TEACHER/ADMIN (riêng `DELETE` chỉ 👑 ADMIN). Chủ đề là dữ liệu **dùng chung** (không có chủ sở hữu). Endpoint công khai `GET /topics` ở [[api-catalog]]. Quy tắc nghiệp vụ: [[concept-topics]].

## DTO
```ts
interface TopicRefDto   { id: string; name: string; slug: string; color: string | null; icon: string | null }
interface AdminTopicDto extends TopicRefDto {
  description: string; isActive: boolean; displayOrder: number;
  courseCount: number;            // mọi khóa (DRAFT + PUBLISHED) đang dùng chủ đề này
  createdAt: ISODate;
}
```

## `GET /admin/topics`
Trả **toàn bộ** chủ đề (kể cả ẩn), sắp `displayOrder` tăng dần; không phân trang. Query tùy chọn: `q` (tên/slug chứa), `isActive=true|false`.
```json
{ "data": [ { "id": "tp-1", "name": "Lập trình", "slug": "lap-trinh", "color": "#1D5E8C", "icon": "code",
              "description": "Ngôn ngữ và tư duy lập trình", "isActive": true, "displayOrder": 0, "courseCount": 2, "createdAt": "…" } ] }
```

## `POST /admin/topics`
```json
{ "name": "Trí tuệ nhân tạo", "slug": "tri-tue-nhan-tao", "description": "…", "color": "#6A1B9A", "icon": "cpu", "isActive": true }
```
Chỉ `name` bắt buộc; `slug` bỏ trống ⇒ tự sinh; `isActive` mặc định `true`; `displayOrder` do server đặt (`max + 1`).
`201` ⇒ `AdminTopicDto`. Validate: `name` 1–100; `slug` theo regex ở [[concept-topics]]; `color` `^#[0-9A-Fa-f]{6}$` hoặc `null`; `icon` thuộc `TOPIC_ICON_KEYS` hoặc `null`.
Lỗi: `400 VALIDATION_ERROR`, `409 TOPIC_NAME_TAKEN`, `409 TOPIC_SLUG_TAKEN`.

## `PATCH /admin/topics/:topicId`
Tập con `{ name, description, color, icon, isActive }` ⇒ `200 AdminTopicDto`. **Không** nhận `slug` (gửi `slug` ⇒ `400`) và không nhận `displayOrder` (dùng `PUT …/order`).
Tắt `isActive` luôn được, kể cả khi còn khóa đang dùng. Lỗi: `404`, `409 TOPIC_NAME_TAKEN`.

## `PUT /admin/topics/order`
```json
{ "orderedIds": ["tp-3", "tp-1", "tp-2", "tp-4"] }
```
Phải **đủ và đúng** tập id của mọi chủ đề (kể cả ẩn), không trùng; server ghi `displayOrder = 0..n-1` trong một transaction. `200 { "data": { "orderedIds": [...] } }`. Sai tập ⇒ `400 VALIDATION_ERROR`.

## `DELETE /admin/topics/:topicId` 👑
`204`. Chỉ khi không có khóa nào tham chiếu; ngược lại `409 TOPIC_IN_USE` (kèm `courseCount` trong `details`). TEACHER gọi ⇒ `403 FORBIDDEN`.

## Mã lỗi (bổ sung vào [[api-contracts]])
`TOPIC_NAME_TAKEN`, `TOPIC_SLUG_TAKEN`, `TOPIC_IN_USE`, `TOPIC_INACTIVE` (409).
