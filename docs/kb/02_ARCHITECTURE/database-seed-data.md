---
id: database-seed-data
title: Dữ liệu seed & ID cố định (nguồn dữ liệu mẫu duy nhất)
type: database
status: stable
tags: [seed, sample-data]
related: [adr-018-dynamic-topics, concept-topics, database-migration-topics, workflow-solo-dev, adr-017-solo-dev-workflow, database-erd, plan-phase-00-foundation]
source: "Thiết kế của Tech Lead; tên khóa học lấy từ file UI"
updated: 2026-11-21
---
# Dữ liệu seed

**Mục tiêu**: không còn mock ⇒ **seed là nguồn dữ liệu mẫu duy nhất** để Tech Lead dùng thử UI/API. Seed **mở rộng dần theo phase** (P01: tài khoản; P02: khóa học…; xem cuối file).

## ID cố định
`backend/src/types/seed-ids.ts` xuất hằng UUID cố định (ví dụ `COURSE_PYTHON_ID`, `USER_STUDENT_NA_ID`, `TOPIC_PROGRAMMING_ID`) để `backend/prisma/seed.ts` tạo dữ liệu **lặp lại được** và URL test không đổi sau mỗi lần `db:reset`. Frontend không dùng file này.

## Tài khoản (chỉ môi trường dev/demo)
| Email | Vai trò | Mật khẩu | Ghi chú |
|---|---|---|---|
| `admin@edu.vn` | ADMIN | `Passw0rd!` | khớp placeholder ADMIN·00 |
| `teacher@edu.vn` | TEACHER | `Passw0rd!` | chủ khóa Python, SQL, Next.js |
| `teacher2@edu.vn` | TEACHER | `Passw0rd!` | chủ khóa Java, PostgreSQL, Kiểm thử — dùng test `403` owner-only |
| `na@stu.edu.vn` | STUDENT | `Passw0rd!` | avatar "NA"; MSSV `DH52301350`; ghi danh Python (35%), SQL (70%), Next.js (0%) |
| `sv02…sv12@stu.edu.vn` | STUDENT | `Passw0rd!` | 11 SV để thống kê có số liệu |
| `locked@stu.edu.vn` | STUDENT, `LOCKED` | `Passw0rd!` | test `ACCOUNT_LOCKED` |

## Chủ đề (`topics`, từ P02b — [[concept-topics]])
| Tên | `slug` | `color` | `icon` | Thứ tự | `is_active` | Ghi chú |
|---|---|---|---|---|---|---|
| Lập trình | `lap-trinh` | `#1D5E8C` | `code` | 0 | ✅ | |
| Cơ sở dữ liệu | `co-so-du-lieu` | `#37474F` | `database` | 1 | ✅ | |
| Web | `web` | `#00796B` | `globe` | 2 | ✅ | |
| Công nghệ phần mềm | `cong-nghe-phan-mem` | `#2E7D32` | `bug` | 3 | ✅ | |
| Trí tuệ nhân tạo | `tri-tue-nhan-tao` | `#6A1B9A` | `cpu` | 4 | ❌ (ẩn) | chưa có khóa; dùng test "chủ đề ẩn không hiện ở Client", xóa được (không dùng) |
`seed.ts` tạo bằng upsert theo `slug` với `id` = `TOPIC_*_ID`. Khóa học tham chiếu chủ đề bằng `topicId`.

## Khóa học (khớp màn UI)
| Khóa | Chủ đề (`slug`) | Cấp độ | Trạng thái | GV |
|---|---|---|---|---|
| Nhập môn Python | lap-trinh | BEGINNER | PUBLISHED | teacher |
| Java hướng đối tượng | lap-trinh | INTERMEDIATE | PUBLISHED | teacher2 |
| SQL cơ bản | co-so-du-lieu | BEGINNER | **DRAFT** (khớp A02) → seed thêm bản PUBLISHED để SV `na` học; xem ghi chú | teacher |
| Next.js thực chiến | web | INTERMEDIATE | PUBLISHED | teacher |
| PostgreSQL nâng cao | co-so-du-lieu | INTERMEDIATE | PUBLISHED | teacher2 |
| Kiểm thử phần mềm | cong-nghe-phan-mem | BEGINNER | PUBLISHED | teacher2 |

> Ghi chú: UI A02 minh họa "SQL cơ bản" là Bản nháp nhưng C08 cho SV đang học 70% khóa này. Seed dùng **SQL cơ bản = PUBLISHED**, và thêm khóa phụ "Git và GitHub cơ bản" = `DRAFT` để có ví dụ bản nháp.

## Cấu trúc mỗi khóa
3 module × 4–6 bài (xen VIDEO/PDF, link video mẫu công khai / YouTube không công khai giả; PDF mẫu nhỏ). Bài số 5 của Module 3 `is_published = false` (test lọc). Mỗi khóa có `description` 2–3 câu.

## Bài kiểm tra
| Bài | Trạng thái | Nội dung |
|---|---|---|
| Python · Kiểm tra Module 1 | `OPEN` | 10 câu, 15 phút, `passScore = 5` — khớp C06 ("Câu 4/10", "12:45") |
| Python · Kiểm tra Module 2 | `OPEN` | 10 câu |
| SQL · Kiểm tra cuối khóa | `OPEN` | 10 câu |
| Next.js · Kiểm tra Module 1 | `DRAFT` | 3 câu |
| Java · Kiểm tra Module 1 | `CLOSED` | 5 câu |

## Lượt làm (để màn kết quả/thống kê có dữ liệu)
- `na`: Python M1 — 2 lượt (6/10 rồi **8/10 → Đạt**), Python M2 — 1 lượt **4/10 → Chưa đạt**, SQL cuối khóa — **7/10 → Đạt** (khớp C09).
- 10 SV còn lại: 6 người nộp Python M1 với điểm 3–10, một số làm 2–3 lần; 1 bài có câu **bỏ trống** (test "Chưa trả lời").

## Tài liệu AI
| File | Khóa | Trạng thái |
|---|---|---|
| `python-co-ban.pdf` | Python | `READY` |
| `sql-co-ban.pdf` | SQL | `PROCESSING` (khớp A05) |
| `scan-ghi-chu.pdf` | Python | `FAILED` / `NO_TEXT_LAYER` |

## Lịch sử AI
3 lượt hỏi mẫu của `na` ở khóa Python, trong đó có 1 câu `found=false`.

## Lệnh
`cd backend && npm run db:reset` (xóa, migrate lại & seed) — **chỉ dev**. Seed **không** chạy ở production (`NODE_ENV` guard).

## Seed theo phase
| Phase | Dữ liệu thêm vào `seed.ts` |
|---|---|
| P01 ✅ | tài khoản: admin, teacher, teacher2, SV `na` + các SV mẫu, 1 tài khoản `LOCKED` |
| P02 | 6 khóa + module/bài/bài kiểm tra; ghi danh cho `na` |
| P02b | 4 chủ đề hoạt động + 1 chủ đề ẩn mẫu; gán `topicId` cho các khóa |
| P03 | tiến độ bài học (Python 35%, SQL 70%, Next.js 0%) |
| P05 | lượt làm bài của `na` |
| P06 | lượt làm của ~10 SV (có câu bỏ trống) cho thống kê |
| P08 | tài liệu AI (READY / PROCESSING / FAILED) + lịch sử hỏi AI |
| P09 | thêm người dùng mẫu |
Lệnh chạy do Tech Lead: `cd backend && npm run db:seed` / `npm run db:reset` ([[architecture-deployment-env]]).
