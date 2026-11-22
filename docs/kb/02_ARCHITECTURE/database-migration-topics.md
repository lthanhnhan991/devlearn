---
id: database-migration-topics
title: Migration `p02b_topics` — chuyển courses.topic (mã) sang topics + topic_id
type: database
status: stable
tags: [database, migration, topics, prisma, backfill]
related: [database-erd, database-prisma-schema, database-seed-data, adr-018-dynamic-topics, concept-topics, plan-phase-02-course-catalog]
source: "ADR-018"
updated: 2026-11-21
---
# Migration `p02b_topics`

**Bối cảnh**: DB đã migrate `p02_catalog` với `courses.topic varchar(100)` (mã cố định) và đã có dữ liệu seed. Cần: tạo bảng `topics`, thêm `courses.topic_id NOT NULL`, bỏ cột `topic`. Prisma **không tự backfill** — thêm cột NOT NULL khi đã có dòng sẽ lỗi, và bỏ cột `topic` sẽ mất dữ liệu.

## Ánh xạ mã cũ → chủ đề mới
| `courses.topic` cũ | `topics.name` | `slug` | `color` | `icon` | `display_order` |
|---|---|---|---|---|---|
| `PROGRAMMING` | Lập trình | `lap-trinh` | `#1D5E8C` | `code` | 0 |
| `DATABASE` | Cơ sở dữ liệu | `co-so-du-lieu` | `#37474F` | `database` | 1 |
| `WEB` | Web | `web` | `#00796B` | `globe` | 2 |
| `SOFTWARE_ENGINEERING` | Công nghệ phần mềm | `cong-nghe-phan-mem` | `#2E7D32` | `bug` | 3 |
`id` của 4 chủ đề dùng đúng UUID `TOPIC_*_ID` trong `backend/src/types/seed-ids.ts` để `seed.ts` (upsert theo `slug`/`id`) không tạo bản sao.

## Cách A — Dev reset (đơn giản nhất, mất dữ liệu thử)
Chỉ khi DB chỉ chứa dữ liệu seed/tài khoản thử: sửa `schema.prisma` (xem [[database-prisma-schema]]), sửa `seed.ts` ([[database-seed-data]]), rồi
`cd backend && npm run db:reset` (xóa + migrate lại + seed). **Cấm ở môi trường có dữ liệu thật.**

## Cách B — Migration có backfill (giữ dữ liệu)
1. Sửa `schema.prisma`, rồi tạo migration **không áp dụng ngay**: `cd backend && npx prisma migrate dev --create-only --name p02b_topics`.
2. **Sửa tay** file `migration.sql` vừa sinh thành trình tự sau (tên ràng buộc có thể khác nhẹ do Prisma sinh):
```sql
CREATE TABLE "topics" (
  "id" UUID NOT NULL, "name" VARCHAR(100) NOT NULL, "slug" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL DEFAULT '', "color" VARCHAR(7), "icon" VARCHAR(50),
  "is_active" BOOLEAN NOT NULL DEFAULT true, "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");
CREATE INDEX "topics_is_active_display_order_idx" ON "topics"("is_active", "display_order");
ALTER TABLE "topics" ADD CONSTRAINT "topics_color_chk" CHECK ("color" IS NULL OR "color" ~ '^#[0-9A-Fa-f]{6}$');

INSERT INTO "topics" ("id","name","slug","color","icon","display_order") VALUES
  ('<TOPIC_PROGRAMMING_ID>','Lập trình','lap-trinh','#1D5E8C','code',0),
  ('<TOPIC_DATABASE_ID>','Cơ sở dữ liệu','co-so-du-lieu','#37474F','database',1),
  ('<TOPIC_WEB_ID>','Web','web','#00796B','globe',2),
  ('<TOPIC_SOFTWARE_ENGINEERING_ID>','Công nghệ phần mềm','cong-nghe-phan-mem','#2E7D32','bug',3);

ALTER TABLE "courses" ADD COLUMN "topic_id" UUID;
UPDATE "courses" c SET "topic_id" = t."id" FROM "topics" t
 WHERE t."slug" = CASE c."topic"
   WHEN 'PROGRAMMING' THEN 'lap-trinh'   WHEN 'DATABASE' THEN 'co-so-du-lieu'
   WHEN 'WEB' THEN 'web'                 WHEN 'SOFTWARE_ENGINEERING' THEN 'cong-nghe-phan-mem' END;

ALTER TABLE "courses" ALTER COLUMN "topic_id" SET NOT NULL;   -- lỗi ở đây = còn khóa có mã lạ, sửa tay rồi chạy lại
ALTER TABLE "courses" ADD CONSTRAINT "courses_topic_id_fkey"
  FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "courses_topic_id_idx" ON "courses"("topic_id");
ALTER TABLE "courses" DROP COLUMN "topic";
```
3. Thay `<TOPIC_*_ID>` bằng UUID thật trong `seed-ids.ts`, rồi áp dụng: `cd backend && npx prisma migrate dev`.
4. Kiểm: `SELECT count(*) FROM courses WHERE topic_id IS NULL;` = 0; `SELECT slug, is_active, display_order FROM topics ORDER BY display_order;` đủ 4 dòng.
5. `npm run db:seed` để thêm chủ đề ẩn mẫu và các dữ liệu khác (seed dùng upsert nên chạy lại an toàn).

## Sau migration
- `npx prisma generate` (tự chạy khi `migrate dev`); khởi động lại backend.
- Không sửa migration đã áp dụng. Nếu hỏng giữa chừng ở môi trường dev ⇒ Cách A.
- Cập nhật code theo [[plan-phase-02-course-catalog]] (mục P02-T).
