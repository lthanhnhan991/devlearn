-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_is_active_display_order_idx" ON "topics"("is_active", "display_order");

-- Add Check Constraint for color
ALTER TABLE "topics" ADD CONSTRAINT "topics_color_chk" CHECK ("color" IS NULL OR "color" ~ '^#[0-9A-Fa-f]{6}$');

-- Insert seed topics with UUIDs from seed-ids.ts
INSERT INTO "topics" ("id", "name", "slug", "color", "icon", "display_order") VALUES
  ('20000000-0000-0000-0000-000000000001', 'Lập trình', 'lap-trinh', '#1D5E8C', 'code', 0),
  ('20000000-0000-0000-0000-000000000002', 'Cơ sở dữ liệu', 'co-so-du-lieu', '#37474F', 'database', 1),
  ('20000000-0000-0000-0000-000000000003', 'Web', 'web', '#00796B', 'globe', 2),
  ('20000000-0000-0000-0000-000000000004', 'Công nghệ phần mềm', 'cong-nghe-phan-mem', '#2E7D32', 'bug', 3);

-- Add topic_id column to courses
ALTER TABLE "courses" ADD COLUMN "topic_id" UUID;

-- Backfill topic_id from existing topic column (if courses exist)
UPDATE "courses" c SET "topic_id" = t."id" FROM "topics" t
 WHERE t."slug" = CASE c."topic"
   WHEN 'PROGRAMMING' THEN 'lap-trinh'
   WHEN 'DATABASE' THEN 'co-so-du-lieu'
   WHEN 'WEB' THEN 'web'
   WHEN 'SOFTWARE_ENGINEERING' THEN 'cong-nghe-phan-mem'
   ELSE 'lap-trinh'
 END;

-- Set topic_id to NOT NULL
ALTER TABLE "courses" ALTER COLUMN "topic_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "courses" ADD CONSTRAINT "courses_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create index on topic_id
CREATE INDEX "courses_topic_id_idx" ON "courses"("topic_id");

-- Drop old topic column
ALTER TABLE "courses" DROP COLUMN "topic";
