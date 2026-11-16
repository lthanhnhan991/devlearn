---
id: database-prisma-schema-exam-ai
title: Prisma schema (2/2) — kiểm tra, lượt làm, tài liệu AI, lịch sử AI
type: database
status: stable
tags: [prisma, schema, exam, ai]
related: [database-erd, database-prisma-schema, concept-exam-scoring-attempts, concept-rag-ingestion, adr-010-unify-documents-into-ai-documents]
source: "Đồ án §3.1.2"
updated: 2026-11-15
---
# Prisma schema — phần 2/2

> Nối tiếp [[database-prisma-schema]] (cùng một file `schema.prisma`).

```prisma
// ───────────── Exams ─────────────
model Exam {
  id              String     @id @default(uuid()) @db.Uuid
  courseId        String     @map("course_id") @db.Uuid
  moduleId        String?    @map("module_id") @db.Uuid          // null = kiểm tra cuối khóa
  title           String     @db.VarChar(200)
  durationMinutes Int        @map("duration_minutes")
  passScore       Decimal    @default(5) @map("pass_score") @db.Decimal(4, 2)
  status          ExamStatus @default(DRAFT)

  course    Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module    Module?    @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  questions Question[]
  attempts  Attempt[]

  @@index([courseId])
  @@index([moduleId])
  @@map("exams")
}

model Question {
  id       String @id @default(uuid()) @db.Uuid
  examId   String @map("exam_id") @db.Uuid
  content  String @db.Text
  position Int

  exam    Exam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  options Option[]
  answers Answer[]

  @@index([examId, position])
  @@map("questions")
}

model Option {
  id         String  @id @default(uuid()) @db.Uuid
  questionId String  @map("question_id") @db.Uuid
  content    String  @db.Text
  isCorrect  Boolean @default(false) @map("is_correct")
  position   Int                                                  // + 0..3 ⇒ A..D

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers  Answer[]

  @@index([questionId, position])
  @@map("options")
}

// ───────────── Attempts ─────────────
model Attempt {
  id             String   @id @default(uuid()) @db.Uuid
  examId         String   @map("exam_id") @db.Uuid
  studentId      String   @map("student_id") @db.Uuid
  attemptNo      Int      @map("attempt_no")
  correctCount   Int      @map("correct_count")
  totalQuestions Int      @map("total_questions")
  score          Decimal  @db.Decimal(4, 2)
  submittedAt    DateTime @default(now()) @map("submitted_at") @db.Timestamptz(6)

  exam    Exam     @relation(fields: [examId], references: [id], onDelete: Restrict)
  student User     @relation(fields: [studentId], references: [id], onDelete: Restrict)
  answers Answer[]

  @@unique([examId, studentId, attemptNo])
  @@index([examId])
  @@index([studentId])
  @@map("attempts")
}

model Answer {
  id         String @id @default(uuid()) @db.Uuid
  attemptId  String @map("attempt_id") @db.Uuid
  questionId String @map("question_id") @db.Uuid
  optionId   String @map("option_id") @db.Uuid

  attempt  Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Restrict)
  option   Option   @relation(fields: [optionId], references: [id], onDelete: Restrict)

  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@map("answers")
}

// ───────────── AI ─────────────
model AiDocument {
  id           String    @id @default(uuid()) @db.Uuid
  courseId     String    @map("course_id") @db.Uuid
  lessonId     String?   @unique @map("lesson_id") @db.Uuid       // + null = tải riêng ở màn Tài liệu AI
  uploadedBy   String    @map("uploaded_by") @db.Uuid
  fileName     String    @map("file_name") @db.VarChar(255)
  fileUrl      String    @map("file_url") @db.Text
  filePublicId String?   @map("file_public_id") @db.VarChar(255)  // + Cloudinary public_id
  status       DocStatus @default(PENDING)
  errorMessage String?   @map("error_message") @db.VarChar(100)   // + mã lỗi (NO_TEXT_LAYER…)
  uploadedAt   DateTime  @default(now()) @map("uploaded_at") @db.Timestamptz(6)

  course   Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lesson   Lesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  uploader User    @relation(fields: [uploadedBy], references: [id])

  @@index([courseId])
  @@index([uploadedBy])
  @@map("ai_documents")
}

model AiMessage {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  courseId  String   @map("course_id") @db.Uuid
  question  String   @db.Text
  answer    String   @db.Text
  sources   Json?                                                  // + [{documentId,fileName,page,snippet}]
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@index([userId, courseId, createdAt])
  @@map("ai_messages")
}
```

## Ghi chú
- Dùng `Restrict` ở `Attempt → Exam/User` và `Answer → Question/Option` để **không mất lịch sử** (xem [[database-erd]]).
- `Option.isCorrect` **không bao giờ** được select khi phục vụ đề thi cho SV — repository có hai hàm riêng: `findQuestionsForTaking()` (loại `isCorrect`) và `findQuestionsWithKey()`.
- Ràng buộc CHECK và chỉ mục unique từng phần (`options_one_correct_per_question`) thêm bằng SQL thô trong migration — Prisma chưa mô tả được.
- `AiDocument.lessonId @unique`: mỗi bài học PDF tối đa một tài liệu AI ([[adr-010-unify-documents-into-ai-documents]]).
