---
id: concept-exam-lifecycle
title: Vòng đời bài kiểm tra trắc nghiệm
type: concept
status: stable
tags: [exam, question, f3]
related: [concept-exam-scoring-attempts, concept-exam-statistics, api-admin-exams, api-exam-student, plan-phase-06-exam-admin-stats]
source: "Đồ án §2.3.1.4, UC05, UC10; UI ADMIN 04, CLIENT 06"
updated: 2026-11-15
---
# Vòng đời bài kiểm tra

## Loại bài kiểm tra
| Loại | `exams.module_id` | Nhãn UI |
|---|---|---|
| Kiểm tra Module | = id module | "Kiểm tra Module N" |
| Kiểm tra cuối khóa | `NULL` | "Kiểm tra cuối khóa" |

Ràng buộc (kiểm ở **service**, không ở DB — giả định, xem [[delta-vs-thesis]] U-05): tối đa **1 bài/module** và **1 bài cuối khóa/khóa**.

## Trạng thái
```
        publish (≥1 câu hỏi)            close
DRAFT ───────────────────────► OPEN ───────────► CLOSED
  ▲                              │  ▲                │
  └──── chỉ khi 0 lượt làm ──────┘  └──── reopen ────┘
```
| Trạng thái | Nhãn UI | SV thấy? | SV làm bài? | GV sửa câu hỏi? |
|---|---|---|---|---|
| `DRAFT` | Nháp | ❌ | ❌ | ✅ |
| `OPEN` | Đang mở | ✅ | ✅ | ❌ (khóa sửa) |
| `CLOSED` | Đã đóng | ✅ (xem kết quả) | ❌ (`403 EXAM_NOT_OPEN`) | ❌ |

- `DRAFT → OPEN` cần ≥ 1 câu hỏi hợp lệ (`409 EXAM_EMPTY`).
- `OPEN → DRAFT` chỉ khi **chưa có lượt làm** (`409 EXAM_HAS_ATTEMPTS`).
- Sửa/xóa **câu hỏi & lựa chọn** chỉ khi `DRAFT` (`409 EXAM_NOT_EDITABLE`) — bảo toàn tính đúng đắn của kết quả đã chấm. Sửa `title`, `durationMinutes`, `passScore` khi `OPEN` vẫn được (không ảnh hưởng đáp án; `passScore` đổi sẽ ảnh hưởng nhãn Đạt/Chưa đạt tính lúc đọc).
- Xóa bài kiểm tra có lượt làm → `409 EXAM_HAS_ATTEMPTS`.

## Câu hỏi (UC10)
- Mỗi câu: `content` (1–2000 ký tự) + **đúng 4 lựa chọn A–D**, **đúng 1** lựa chọn đúng.
- Thiếu nội dung/chưa chọn đáp án đúng → `400 VALIDATION_ERROR`, **không lưu**.
- Xóa câu hỏi cần xác nhận ở UI (modal).
- Thứ tự câu theo `questions.position`; thứ tự A–D theo `options.position` (0–3) — **cần cột `options.position`**, xem [[delta-vs-thesis]] D-03.
- Không xáo trộn câu/đáp án (giữ đơn giản; có thể mở rộng sau).

## Thuộc tính
| Trường | Quy tắc |
|---|---|
| `title` | 1–200 ký tự |
| `durationMinutes` | số nguyên 1–300 |
| `passScore` | 0–10, 2 chữ số thập phân; mặc định `5.00` |

## Phía SV
1. Màn học/chi tiết khóa hiển thị bài kiểm tra (nếu `OPEN|CLOSED`) cuối mỗi module / cuối khóa.
2. Điều kiện làm: đã ghi danh + `OPEN` ([[concept-roles-permissions]]).
3. Màn làm bài: header "Kiểm tra Module 1" + đồng hồ **Còn lại mm:ss**; lưới số câu (1..N, câu hiện tại tô xanh); radio A–D; nút **Câu trước**, **Nộp bài**.
4. Hết giờ → FE tự gọi nộp với các đáp án đã chọn. Đồng hồ chạy ở FE; **backend không áp thời hạn cứng** (chống gian lận nâng cao ngoài phạm vi) — ghi nhận ở [[delta-vs-thesis]] U-07.
5. Đáp án đúng **không bao giờ** có trong response lấy đề ([[api-exam-student]]).

Chấm điểm & lượt làm: [[concept-exam-scoring-attempts]].
