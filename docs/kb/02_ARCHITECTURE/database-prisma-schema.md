---
id: database-prisma-schema
title: Prisma schema (1/2) — enum, người dùng, khóa học, tiến độ
type: database
status: stable
tags: [prisma, schema, postgres]
related: [database-erd, database-prisma-schema-exam-ai, delta-vs-thesis]
source: "Đồ án §3.1.2 (mức luận lý + vật lý)"
updated: 2026-11-15
---
# Prisma schema — phần 1/2

> **Thiết kế đích đầy đủ** — ghép dần với [[database-prisma-schema-exam-ai]] thành `backend/prisma/schema.prisma` theo phase. Lịch migrate và quy tắc "bỏ quan hệ tới model chưa có": [[database-erd]].

| Model / enum trong file này | Phase | Trạng thái |
|---|---|---|
| enum `Role`, `UserStatus`; model `User` | P01 | ✅ Đã áp dụng (chỉ cột scalar; thêm trường quan hệ ngược ở các phase sau) |
| enum `CourseStatus`, `ContentType`; `Course`, `Module`, `Lesson`, `Enrollment` | P02 | ⬜ |
| `LessonProgress` | P03 | ⬜ |
| enum `ExamStatus`, `DocStatus` | P02 / P04 | ⬜ |

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────── Enums ─────────────
enum Role         { STUDENT TEACHER ADMIN }
enum UserStatus   { ACTIVE LOCKED }
enum CourseStatus { DRAFT PUBLISHED }
enum ContentType  { VIDEO PDF }
enum ExamStatus   { DRAFT OPEN CLOSED }
enum DocStatus    { PENDING PROCESSING READY FAILED }

// ───────────── Users ─────────────
model User {
  id           String     @id @default(uuid()) @db.Uuid
  studentCode  String?    @unique @map("student_code") @db.VarChar(20)
  fullName     String     @map("full_name") @db.VarChar(100)
  email        String     @unique @db.VarChar(150)            // lưu lowercase
  passwordHash String     @map("password_hash") @db.VarChar(255)
  role         Role       @default(STUDENT)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)

  coursesTaught  Course[]         @relation("CourseTeacher")
  enrollments    Enrollment[]
  lessonProgress LessonProgress[]
  attempts       Attempt[]
  aiDocuments    AiDocument[]
  aiMessages     AiMessage[]

  @@map("users")
}

// ───────────── Courses ─────────────
model Course {
  id          String       @id @default(uuid()) @db.Uuid
  title       String       @db.VarChar(200)
  description String       @default("") @db.Text
  topic       String       @db.VarChar(100)                    // mã: PROGRAMMING | DATABASE | WEB | SOFTWARE_ENGINEERING
  level       String       @db.VarChar(20)                     // mã: BEGINNER | INTERMEDIATE | ADVANCED
  status      CourseStatus @default(DRAFT)
  teacherId   String       @map("teacher_id") @db.Uuid
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)

  teacher     User         @relation("CourseTeacher", fields: [teacherId], references: [id])
  modules     Module[]
  enrollments Enrollment[]
  exams       Exam[]
  aiDocuments AiDocument[]
  aiMessages  AiMessage[]

  @@index([teacherId])
  @@index([status])
  @@map("courses")
}

model Module {
  id       String @id @default(uuid()) @db.Uuid
  courseId String @map("course_id") @db.Uuid
  title    String @db.VarChar(200)
  position Int

  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons Lesson[]
  exams   Exam[]

  @@index([courseId, position])
  @@map("modules")
}

model Lesson {
  id              String      @id @default(uuid()) @db.Uuid
  moduleId        String      @map("module_id") @db.Uuid
  title           String      @db.VarChar(200)
  contentType     ContentType @map("content_type")
  fileUrl         String?     @map("file_url") @db.Text               // null đến khi tải lên / nhập link
  filePublicId    String?     @map("file_public_id") @db.VarChar(255) // + Cloudinary public_id (để xóa)
  durationSeconds Int?        @map("duration_seconds")                // + từ Cloudinary (video)
  position        Int
  isPublished     Boolean     @default(false) @map("is_published")

  module      Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress    LessonProgress[]
  aiDocument  AiDocument?

  @@index([moduleId, position])
  @@map("lessons")
}

// ───────────── Enrollment & Progress ─────────────
model Enrollment {
  userId      String    @map("user_id") @db.Uuid
  courseId    String    @map("course_id") @db.Uuid
  enrolledAt  DateTime  @default(now()) @map("enrolled_at") @db.Timestamptz(6)
  completedAt DateTime? @map("completed_at") @db.Timestamptz(6)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Restrict)

  @@id([userId, courseId])
  @@index([courseId])
  @@map("enrollments")
}

model LessonProgress {
  userId      String   @map("user_id") @db.Uuid
  lessonId    String   @map("lesson_id") @db.Uuid
  completedAt DateTime @default(now()) @map("completed_at") @db.Timestamptz(6)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@id([userId, lessonId])
  @@index([lessonId])
  @@map("lesson_progress")
}
```

## Ghi chú
- `Enrollment → Course` dùng `Restrict`: khóa có ghi danh không xóa được (khớp `409 COURSE_HAS_ENROLLMENTS`).
- `topic`/`level` là `VarChar` (đúng Đồ án) nhưng **giá trị là mã** được kiểm bằng zod ở `backend/src/types/constants.ts` — thêm chủ đề mới không cần migration.
- Trường đánh dấu `+` là bổ sung so với Đồ án — xem [[delta-vs-thesis]].
- **Phiên bản Prisma**: schema viết theo cú pháp **Prisma 6** (`url = env("DATABASE_URL")` trong `datasource`, generator `prisma-client-js`). Cài `prisma@6` và `@prisma/client@6`; nếu `npx prisma init` sinh cấu trúc khác (ví dụ `prisma.config.ts`) thì dừng và hỏi ([[OPEN_QUESTIONS]] Q-15).
