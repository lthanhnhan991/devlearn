---
id: api-admin-exam-stats
title: API — Admin: Thống kê bài kiểm tra (owner-only)
type: api
status: stable
tags: [api, admin, statistics, exam]
related: [api-contracts, concept-exam-statistics, adr-013-exam-stats-owner-only, plan-phase-06-exam-admin-stats]
source: "UC12, F3.5; UI A07, A08"
updated: 2026-11-15
---
# API — Admin / Exam stats

**Quyền: chỉ chủ khóa** (`course.teacher_id = caller.id`), kể cả ADMIN. Khác ⇒ `403 FORBIDDEN` ([[adr-013-exam-stats-owner-only]]). Chọn khóa/bài dùng `GET /admin/courses` và `GET /admin/courses/:id/exams` ([[api-admin-courses]], [[api-admin-exams]]).

## `GET /admin/exam-stats/exams/:examId`
Query tùy chọn: `page`, `pageSize` (mặc định 50), `sort=lastSubmittedAt|bestScore|fullName` (mặc định `lastSubmittedAt` giảm dần).
```json
{ "data": {
  "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "courseId": "c-1", "courseTitle": "Nhập môn Python", "passScore": 5, "status": "OPEN" },
  "summary": { "enrolledCount": 40, "submittedCount": 25, "completionRate": 62.5, "averageScore": 6.84 },
  "students": [ { "studentId": "u-1", "studentCode": "DH52301350", "fullName": "Lê Thanh Nhàn", "attemptCount": 2,
                  "bestScore": 8, "lastSubmittedAt": "2026-11-15T08:30:00.000Z", "passed": true } ]
}, "meta": { "page": 1, "pageSize": 50, "total": 25, "totalPages": 1 } }
```
`averageScore: null` khi chưa ai nộp; `completionRate = 0` nếu `enrolledCount = 0`. Định nghĩa: [[concept-exam-statistics]].

## `GET /admin/exam-stats/exams/:examId/students/:studentId/attempts`
Danh sách lượt của một SV (cho dropdown **Lần làm**).
```json
{ "data": { "student": { "id": "u-1", "studentCode": "DH52301350", "fullName": "Lê Thanh Nhàn" },
            "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "passScore": 5 },
            "attempts": [ { "id": "a-2", "attemptNo": 2, "score": 8, "correctCount": 8, "totalQuestions": 10, "passed": true,
                            "submittedAt": "…", "isBest": true },
                          { "id": "a-1", "attemptNo": 1, "score": 6, "correctCount": 6, "totalQuestions": 10, "passed": true,
                            "submittedAt": "…", "isBest": false } ] } }
```
Sắp `attemptNo` giảm dần. SV chưa nộp bài này ⇒ `404`.

## `GET /admin/exam-stats/attempts/:attemptId`
`AttemptReviewDto` ([[api-contracts]] §3) cộng thông tin SV:
```json
{ "data": { "student": { "id": "u-1", "studentCode": "DH52301350", "fullName": "Lê Thanh Nhàn" },
            "attempt": { "id": "a-2", "attemptNo": 2, "score": 8, "correctCount": 8, "totalQuestions": 10, "passed": true, "submittedAt": "…" },
            "exam": { "id": "e-1", "title": "Kiểm tra Module 1", "passScore": 5, "courseTitle": "Nhập môn Python" },
            "questions": [ { "id": "q-2", "position": 1, "content": "…", "selectedOptionId": "o-6", "isCorrect": false,
                             "options": [ { "id": "o-5", "position": 0, "content": "…", "isCorrect": false },
                                          { "id": "o-6", "position": 1, "content": "…", "isCorrect": false },
                                          { "id": "o-7", "position": 2, "content": "…", "isCorrect": true },
                                          { "id": "o-8", "position": 3, "content": "…", "isCorrect": false } ] } ] } }
```
Kiểm quyền qua `attempt → exam → course.teacherId`.
