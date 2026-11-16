---
id: adr-001-nextjs-app-router
title: ADR-001 — Next.js (App Router) + TypeScript + Tailwind cho Frontend
type: decision
status: accepted
tags: [adr, frontend, nextjs]
related: [architecture-frontend, coding-standards-frontend, ui-design-system]
source: "Đồ án §2.2.2 (1)"
updated: 2026-11-15
---
# ADR-001 — Next.js (App Router) cho Frontend

## Bối cảnh
Hệ thống có hai khu vực (CLIENT, ADMIN) với layout và vai trò khác nhau; có trang công khai cần tải nhanh (trang chủ, danh mục).

## Quyết định
Dùng **Next.js App Router** + TypeScript + Tailwind. Route groups `(client)`, `(learn)`, `(auth)`, `admin/(panel)` cho layout dùng chung. Server Component cho trang công khai; Client Component cho trang cần phiên/tương tác.

## Phương án đã cân nhắc
| Phương án | Vì sao không chọn |
|---|---|
| Vite + React Router (SPA) | Không có SSR cho trang công khai; tự dựng layout lồng nhau |
| Pages Router | Hướng cũ; layout lồng nhau kém tiện |

## Hệ quả
- (+) Layout/route group tự nhiên cho nhiều vai trò; Tailwind responsive nhanh.
- (−) Thêm khái niệm Server/Client Component ⇒ **giảm rủi ro** bằng quy tắc: dữ liệu lấy qua REST từ `services/`, trang cần phiên luôn là Client Component ([[architecture-frontend]]).
- Không dùng Server Actions/Route Handlers cho nghiệp vụ — mọi nghiệp vụ ở Express.
