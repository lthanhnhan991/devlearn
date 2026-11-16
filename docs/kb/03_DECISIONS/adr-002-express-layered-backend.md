---
id: adr-002-express-layered-backend
title: ADR-002 — Express + TypeScript, kiến trúc phân lớp
type: decision
status: accepted
tags: [adr, backend, express]
related: [architecture-backend-layers, coding-standards-backend]
source: "Đồ án §2.2.2 (2), §2.2.5.2"
updated: 2026-11-15
---
# ADR-002 — Express phân lớp Route → Controller → Service → Repository

## Bối cảnh
Phạm vi nhỏ, thời gian ngắn; cần đội/AI Agent hiểu nhanh cấu trúc và dễ test.

## Quyết định
**Express + TypeScript** (không NestJS). Rủi ro "thiếu cấu trúc" của Express được xử lý bằng **quy ước phân lớp cứng** và thư mục theo module. Chỉ Repository được import Prisma. Validate bằng zod ở middleware.

## Phương án
- **NestJS**: cấu trúc sẵn nhưng đường cong học và boilerplate lớn so với phạm vi đồ án.
- **Fastify/Hono**: tốt nhưng hệ sinh thái middleware (multer, rate-limit, cookie) quen thuộc hơn ở Express.

## Hệ quả
- (+) Đơn giản, nhiều tài liệu; dễ viết test service thuần.
- (−) Kỷ luật phụ thuộc quy ước ⇒ ESLint rule `no-restricted-imports` chặn import `@prisma/client`/`lib/prisma` ngoài `*.repository.ts` ([[coding-standards-backend]]).
