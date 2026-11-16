---
id: api-admin-exams
title: API — Admin: Bài kiểm tra & câu hỏi
type: api
status: stable
tags: [api, admin, exam, question]
related: [api-contracts, concept-exam-lifecycle, api-admin-exam-stats, plan-phase-06-exam-admin-stats]
source: "UC10; UI A04"
updated: 2026-11-15
---
# API — Admin / Exams

Quyền: owner (👤) / ADMIN (🌐) của khóa.

## DTO
```ts
interface AdminExamRowDto { id: string; title: string; moduleId: string | null; moduleTitle: string | null;
  status: 'DRAFT'|'OPEN'|'CLOSED'; durationMinutes: number; passScore: number; questionCount: number; attemptCount: number }
interface AdminOptionDto { id: string; position: number; content: string; isCorrect: boolean }
interface AdminQuestionDto { id: string; position: number; content: string; options: AdminOptionDto[] }   // đúng 4 option
interface AdminExamDto extends AdminExamRowDto { courseId: string; courseTitle: string; questions: AdminQuestionDto[] }
```

## Bài kiểm tra
### `GET /admin/courses/:courseId/exams` ⇒ `200 { data: AdminExamRowDto[] }`
Thứ tự: theo vị trí module, bài cuối khóa ở cuối.

### `POST /admin/courses/:courseId/exams`
```json
{ "title": "Kiểm tra Module 1", "moduleId": "m-1", "durationMinutes": 15, "passScore": 5 }
```
`moduleId: null` ⇒ cuối khóa. `201 AdminExamDto` (`DRAFT`, 0 câu). Lỗi `409 EXAM_DUPLICATE` (module/khóa đã có bài), `400` (module không thuộc khóa).

### `GET /admin/exams/:examId` ⇒ `200 AdminExamDto` (có `isCorrect`)
### `PATCH /admin/exams/:examId`
Tập con `{ title, durationMinutes, passScore }` ⇒ `200`. (Cho phép khi `OPEN`.)
### `PATCH /admin/exams/:examId/status`
```json
{ "status": "OPEN" }
```
`200 AdminExamDto`. Chuyển trạng thái theo [[concept-exam-lifecycle]]: `409 EXAM_EMPTY`, `409 EXAM_HAS_ATTEMPTS`.
### `DELETE /admin/exams/:examId` ⇒ `204`; `409 EXAM_HAS_ATTEMPTS`

## Câu hỏi (chỉ khi bài `DRAFT`, ngược lại `409 EXAM_NOT_EDITABLE`)
### `POST /admin/exams/:examId/questions`
```json
{ "content": "Kết quả của 3 // 2 là gì?",
  "options": [ { "content": "1", "isCorrect": true }, { "content": "1.5", "isCorrect": false },
               { "content": "2", "isCorrect": false }, { "content": "0", "isCorrect": false } ] }
```
Validate: `content` 1–2000; `options` đúng 4 phần tử (thứ tự = A..D), mỗi `content` 1–1000, **đúng 1** `isCorrect: true`. `201 AdminQuestionDto` (đặt cuối).
### `PUT /admin/questions/:questionId` — cùng body, thay thế toàn bộ ⇒ `200 AdminQuestionDto`
### `DELETE /admin/questions/:questionId` ⇒ `204` (FE hỏi xác nhận)
### `PUT /admin/exams/:examId/questions/order` — `{ "orderedIds": [...] }` ⇒ `200`
