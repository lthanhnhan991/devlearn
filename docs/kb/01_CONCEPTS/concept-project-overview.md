---
id: concept-project-overview
title: Tổng quan dự án DevLearn
type: concept
status: stable
tags: [overview, scope, actors, nfr]
related: [concept-roles-permissions, system-overview, concept-rag-overview, plan-00-overview]
source: "Đồ án §1.1–1.3, §2.3.2, §2.3.3"
updated: 2026-11-15
---
# Tổng quan dự án DevLearn

**DevLearn** = nền tảng học tập & quản lý khóa học phát triển phần mềm cho Khoa CNTT (Trường ĐH Công nghệ Sài Gòn). Web app, 2 khu vực: **CLIENT** (sinh viên) và **ADMIN** (giảng viên/quản trị).

## 1. Giá trị cốt lõi
1. Tập trung hóa học liệu: khóa học → module → bài học (video / PDF).
2. Trắc nghiệm trực tuyến, **chấm điểm tự động**, thống kê cho giảng viên.
3. **Trợ lý AI (RAG)** trả lời dựa trên PDF của khóa học, kèm nguồn trích dẫn.
4. Theo dõi tiến độ & kết quả minh bạch.

## 2. Trong phạm vi / Ngoài phạm vi
| Trong phạm vi | Ngoài phạm vi (KHÔNG làm) |
|---|---|
| Quản lý khóa học, module, bài học (video on-demand, PDF) | Thanh toán / học phí (mọi khóa **Miễn phí**) |
| Trắc nghiệm 4 đáp án, chấm tự động, thống kê | Chống gian lận nâng cao (webcam, khóa trình duyệt) |
| Hỏi đáp AI dựa trên PDF của khóa | Livestream |
| Theo dõi tiến độ, kết quả | Mobile app (chỉ responsive web) |

## 3. Tác nhân (Actors)
| Actor | Vai trò hệ thống | Khu vực |
|---|---|---|
| Sinh viên | `STUDENT` | CLIENT |
| Giảng viên | `TEACHER` | ADMIN |
| Quản trị viên | `ADMIN` (kế thừa quyền GV) | ADMIN |
| Trợ lý AI / Hệ thống | tác nhân tự động (UC15, UC16) | RAG service |
| Lãnh đạo Khoa | chỉ đọc số liệu — **không có tài khoản riêng**, dùng Dashboard của Admin | — |

Chi tiết quyền: [[concept-roles-permissions]].

## 4. Nhóm chức năng (F1–F5)
| Mã | Nhóm | Concept |
|---|---|---|
| F1 | Người dùng & phân quyền | [[concept-auth]], [[concept-admin-users-dashboard]] |
| F2 | Khóa học, tiến độ | [[concept-course-structure]], [[concept-enrollment-progress]] |
| F3 | Trắc nghiệm | [[concept-exam-lifecycle]], [[concept-exam-scoring-attempts]], [[concept-exam-statistics]] |
| F4 | Trợ lý AI | [[concept-rag-overview]], [[concept-rag-ingestion]], [[concept-rag-query]] |
| F5 | Quản trị & thống kê | [[concept-admin-users-dashboard]] |

## 5. Use case
| UC | Tên | Actor | Phase |
|---|---|---|---|
| UC01 | Đăng ký tài khoản | SV | [[plan-phase-01-auth]] |
| UC02 | Đăng nhập/đăng xuất | Tất cả | [[plan-phase-01-auth]] |
| UC03 | Tìm kiếm, xem khóa học | SV | [[plan-phase-02-course-catalog]] |
| UC04 | Học & theo dõi tiến độ | SV | [[plan-phase-03-learning-progress]] |
| UC05 | Làm bài kiểm tra | SV | [[plan-phase-05-exam-student]] |
| UC06 | Xem kết quả, xem lại đáp án | SV | [[plan-phase-05-exam-student]] |
| UC07 | Hỏi đáp Trợ lý AI | SV | [[plan-phase-08-ai-chat-and-docs]] |
| UC08 | Quản lý khóa học | GV | [[plan-phase-04-admin-content]] |
| UC09 | Soạn module, bài học | GV | [[plan-phase-04-admin-content]] |
| UC10 | Quản lý bài kiểm tra | GV | [[plan-phase-06-exam-admin-stats]] |
| UC11 | Nạp tài liệu cho Trợ lý AI | GV | [[plan-phase-08-ai-chat-and-docs]] |
| UC12 | Xem thống kê bài kiểm tra | GV | [[plan-phase-06-exam-admin-stats]] |
| UC13 | Quản lý người dùng, phân quyền | Admin | [[plan-phase-09-admin-dashboard-users]] |
| UC14 | Xem Dashboard | Admin | [[plan-phase-09-admin-dashboard-users]] |
| UC15 | Xử lý tài liệu cho AI | Hệ thống | [[plan-phase-07-rag-service]] |
| UC16 | Chấm điểm tự động | Hệ thống | [[plan-phase-05-exam-student]] |

## 6. Yêu cầu phi chức năng (NFR)
- AI trả lời **≤ 5 giây** (mục tiêu p95); timeout cứng cấu hình `RAG_TIMEOUT_MS`.
- Upload: **video ≤ 100 MB, PDF ≤ 10 MB** (kiểm tra ở form **và** ở backend).
- Responsive (Tailwind) — dùng được trên điện thoại.
- Phân quyền **luôn kiểm ở backend**; ẩn nút ở UI chỉ để cải thiện UX.
- TypeScript strict toàn bộ FE/BE; Python type-hinted cho RAG ([[coding-standards]]).
- Dịch vụ RAG **không mở ra Internet**; khóa Gemini chỉ nằm ở môi trường RAG ([[adr-003-fastapi-separate-rag-service]]).
