---
id: adr-004-postgres-prisma
title: ADR-004 — PostgreSQL + Prisma
type: decision
status: accepted
tags: [adr, database, prisma]
related: [database-erd, database-prisma-schema, coding-standards-backend]
source: "Đồ án §2.2.2 (4), §2.2.5.3"
updated: 2026-11-15
---
# ADR-004 — PostgreSQL + Prisma

## Quyết định
PostgreSQL (dữ liệu quan hệ chặt, cần ràng buộc toàn vẹn) + **Prisma** (schema as code, migration, truy vấn an toàn kiểu). Chuẩn hóa 3NF, khóa ngoại đầy đủ. Thống kê dùng `groupBy`/`$queryRaw` **tham số hóa**.

## Hệ quả
- (+) Kiểu sinh tự động khớp TypeScript strict; chống SQL injection mặc định.
- (−) Prisma không mô tả CHECK/unique từng phần ⇒ thêm bằng SQL thô trong migration ([[database-erd]]).
- Chỉ Repository dùng Prisma ([[adr-002-express-layered-backend]]).
