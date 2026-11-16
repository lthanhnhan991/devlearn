---
id: adr-009-separate-admin-login-portal
title: ADR-009 — Hai cổng đăng nhập: CLIENT và ADMIN
type: decision
status: accepted
tags: [adr, auth, portal]
related: [concept-auth, concept-roles-permissions, api-auth]
source: "UI C01, A00"
updated: 2026-11-15
---
# ADR-009 — Cổng đăng nhập riêng cho Admin

## Quyết định
Hai endpoint: `POST /auth/login` (chỉ `STUDENT`) và `POST /auth/admin/login` (chỉ `TEACHER|ADMIN`). Sai cổng ⇒ `403 WRONG_PORTAL`. FE có hai trang `/login` và `/admin/login` (UI thiết kế riêng, có ghi chú hướng dẫn chuyển cổng).

## Lý do
Thiết kế UI nêu rõ "Giảng viên và Quản trị viên đăng nhập tại cổng quản trị riêng" và "Tài khoản Student sẽ bị từ chối". Quy trình Đồ án §2.3.1.1 bước 4 (chuyển khu vực theo vai trò) được thực hiện bằng cổng + guard.

## Hệ quả
- Một cookie dùng chung; nếu nhân viên đã đăng nhập mà mở khu CLIENT, `StudentGuard` chuyển về `/admin`.
- "Xem trước ở client" của GV nằm trong `/admin/lessons/[id]/preview`, không đi qua cổng CLIENT.
