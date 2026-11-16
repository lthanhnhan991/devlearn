---
id: api-exam-student
title: API — Làm bài kiểm tra & Kết quả (phía SV)
type: api
status: stable
tags: [api, exam, attempts]
related: [api-contracts, concept-exam-lifecycle, concept-exam-scoring-attempts, plan-phase-05-exam-student]
source: "UC05, UC06, UC16; UI C06, C09"
updated: 2026-11-15
---
# API — Exam (SV)

Mọi endpoint yêu cầu đã ghi danh khóa chứa bài. SV **không** thấy bài `DRAFT` (`404`).

## `GET /exams/:examId` 🎓
```json
{ "data": { "id": "e-1", "title": "Kiểm tra Module 1", "courseId": "c-1", "courseTitle": "Nhập môn Python", "moduleId": "m-1",
            "status": "OPEN", "durationMinutes": 15, "passScore": 5, "questionCount": 10,
            "myAttempts": [ { "id": "a-1", "attemptNo": 1, "score": 6, "correctCount": 6, "totalQuestions": 10, "passed": true, "submittedAt": "2026-11-10T02:00:00.000Z" } ] } }
```
`passed` tính theo `passScore` hiện tại.

## `GET /exams/:examId/questions` 🎓
Yêu cầu `status = OPEN` (ngược lại `403 EXAM_NOT_OPEN`). **Không có `isCorrect`.**
```json
{ "data": { "examId": "e-1", "durationMinutes": 15,
  "questions": [ { "id": "q-1", "position": 0, "content": "Kết quả của 3 // 2 là gì?",
      "options": [ { "id": "o-1", "position": 0, "content": "1" }, { "id": "o-2", "position": 1, "content": "1.5" },
                   { "id": "o-3", "position": 2, "content": "2" }, { "id": "o-4", "position": 3, "content": "0" } ] } ] } }
```

## `POST /exams/:examId/attempts` 🎓
Nộp bài (cũng dùng khi hết giờ). Chỉ gửi câu đã trả lời.
```json
// Request
{ "answers": [ { "questionId": "q-1", "optionId": "o-1" }, { "questionId": "q-2", "optionId": "o-7" } ] }
```
```json
// 201
{ "data": { "attemptId": "a-2", "attemptNo": 2, "correctCount": 8, "totalQuestions": 10, "score": 8,
            "passScore": 5, "passed": true, "submittedAt": "2026-11-15T08:30:00.000Z" } }
```
Validate: `answers` mảng (có thể rỗng), `questionId` thuộc bài, `optionId` thuộc đúng câu, không trùng `questionId`; sai ⇒ `400`.
Lỗi: `403 NOT_ENROLLED`, `403 EXAM_NOT_OPEN`, `404`. Thuật toán: [[concept-exam-scoring-attempts]].

## `GET /me/exam-results` 🎓
Một dòng/bài đã làm; sắp theo `lastSubmittedAt` giảm dần.
```json
{ "data": [ { "course": { "id": "c-1", "title": "Nhập môn Python" },
              "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "passScore": 5 },
              "attemptCount": 2, "bestScore": 8, "passed": true,
              "lastSubmittedAt": "2026-11-15T08:30:00.000Z", "bestAttemptId": "a-2" } ] }
```

## `GET /me/attempts/:attemptId` 🎓
Chỉ lượt của chính SV (người khác ⇒ `404`). Trả `AttemptReviewDto` ([[api-contracts]] §3).
```json
{ "data": { "attempt": { "id": "a-2", "attemptNo": 2, "score": 8, "correctCount": 8, "totalQuestions": 10, "passed": true, "submittedAt": "…" },
  "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "passScore": 5, "courseTitle": "Nhập môn Python" },
  "questions": [ { "id": "q-1", "position": 0, "content": "…", "selectedOptionId": "o-1", "isCorrect": true,
      "options": [ { "id": "o-1", "position": 0, "content": "1", "isCorrect": true } ] } ] } }
```
Câu bỏ trống: `selectedOptionId: null`, `isCorrect: false`.
