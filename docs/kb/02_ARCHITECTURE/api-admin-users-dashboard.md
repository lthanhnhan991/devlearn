---
id: api-admin-users-dashboard
title: API — Admin: Người dùng & Dashboard
type: api
status: stable
tags: [api, admin, users, dashboard]
related: [api-contracts, concept-admin-users-dashboard, concept-roles-permissions, plan-phase-09-admin-dashboard-users]
source: "UC13, UC14; UI A01, A06"
updated: 2026-11-15
---
# API — Admin / Users & Dashboard

## Người dùng — 👑 chỉ ADMIN
```ts
interface AdminUserDto { id: string; fullName: string; email: string; studentCode: string | null;
  role: Role; status: 'ACTIVE'|'LOCKED'; createdAt: ISODate }
```
### `GET /admin/users`
Query: `q` (email chứa, không phân biệt hoa thường), `role`, `status`, `page`, `pageSize` (mặc định 20). Sắp `createdAt` giảm dần.
```json
{ "data": [ { "id": "u-1", "fullName": "Lê Thanh Nhàn", "email": "na@stu.edu.vn", "studentCode": "DH52301350",
              "role": "STUDENT", "status": "ACTIVE", "createdAt": "…" } ],
  "meta": { "page": 1, "pageSize": 20, "total": 14, "totalPages": 1 } }
```
### `POST /admin/users`
```json
{ "fullName": "Trần Thị B", "email": "teacher3@edu.vn", "password": "Passw0rd!", "role": "TEACHER", "studentCode": null }
```
`201 AdminUserDto`. `studentCode` bắt buộc khi `role = STUDENT`. Lỗi `409 EMAIL_TAKEN`/`STUDENT_CODE_TAKEN`.
### `PATCH /admin/users/:userId`
Tập con `{ role, status, fullName }` — màn A06: **Lưu** (đổi `role`) và **Khóa/Mở khóa** (đổi `status`).
```json
{ "role": "TEACHER" }        { "status": "LOCKED" }
```
`200 AdminUserDto`. Sửa chính mình về `role`/`status` ⇒ `409 CANNOT_MODIFY_SELF`. Khóa có hiệu lực ngay ([[concept-auth]]).

## Dashboard — 🧑‍🏫 (ADMIN: toàn hệ thống; TEACHER: khóa của mình)
### `GET /admin/dashboard`
```json
{ "data": {
  "scope": "ALL",
  "summary": { "studentCount": 1240, "courseCount": 6, "completionRate": 61.5, "aiQuestionCount": 3820 },
  "completionByCourse": [ { "courseId": "c-1", "title": "Nhập môn Python", "enrolledCount": 132, "completedCount": 80, "completionRate": 60.6 } ],
  "recentActivities": [ { "type": "COURSE_COMPLETED", "userEmail": "na@stu.edu.vn", "targetName": "Nhập môn Python", "occurredAt": "…" },
                        { "type": "EXAM_SUBMITTED",   "userEmail": "sv02@stu.edu.vn", "targetName": "Kiểm tra Module 1", "occurredAt": "…" } ]
} }
```
- `scope`: `"ALL"` (ADMIN) hoặc `"OWN"` (TEACHER).
- `recentActivities`: 10 dòng mới nhất, hợp nhất `enrollments.completed_at` và `attempts.submitted_at`; FE hiển thị "Hoàn thành khóa [tên]" / "Nộp bài kiểm tra [tên]" ([[concept-admin-users-dashboard]]).
- `completionByCourse`: tối đa 10 khóa (theo `enrolledCount` giảm dần) cho biểu đồ cột.
