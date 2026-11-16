---
id: concept-file-storage
title: Lưu trữ file (Cloudinary) & Giới hạn upload
type: concept
status: stable
tags: [cloudinary, upload, video, pdf]
related: [adr-007-cloudinary-storage, concept-course-structure, concept-rag-ingestion, api-admin-content, api-admin-ai-docs]
source: "Đồ án §2.2.2 (mục 7), §2.3.1.2"
updated: 2026-11-15
---
# Lưu trữ file

## Giới hạn
| Loại | Tối đa | MIME chấp nhận | Resource type Cloudinary |
|---|---|---|---|
| Video bài giảng | **100 MB** | `video/mp4`, `video/webm` | `video` |
| PDF | **10 MB** | `application/pdf` | `raw` (hoặc `image` — xem rủi ro) |

Kiểm tra **cả hai nơi**: FE chặn sớm (form), BE chặn thật bằng `multer` `limits.fileSize` + kiểm magic bytes (PDF `%PDF-`). Quá cỡ ⇒ `413 FILE_TOO_LARGE`; sai loại ⇒ `415 UNSUPPORTED_FILE_TYPE`.

## Luồng upload (qua Backend, đúng Hình 3-3)
```
FE (multipart) ─► Backend (multer ghi file tạm trên đĩa, KHÔNG giữ trong RAM)
                  └► cloudinary.uploader.upload_stream ─► { secure_url, public_id, duration? }
                  └► xóa file tạm ─► ghi DB (file_url, file_public_id, duration_seconds)
```
- Thư mục Cloudinary: `devlearn/{env}/courses/{courseId}/lessons/` và `.../ai-docs/`.
- Tên file lưu theo `public_id` ngẫu nhiên; **không** dùng tên gốc làm đường dẫn (giữ `file_name` gốc ở DB để hiển thị).
- Video: lấy `duration` từ phản hồi Cloudinary ⇒ `lessons.duration_seconds`.

## Phương án video lớn
Video > 100 MB: GV nén trước, hoặc nhập **link YouTube không công khai** vào `file_url` (JSON, không upload). FE nhận biết `youtube.com|youtu.be` ⇒ nhúng `<iframe>`; còn lại ⇒ `<video controls>`.

## Dọn dẹp
- Xóa bài/khóa/tài liệu ⇒ gọi `cloudinary.uploader.destroy(public_id, {resource_type})` **best-effort** (lỗi chỉ log, không chặn).
- Thay file của bài học ⇒ xóa file cũ sau khi file mới lưu thành công.

## Rủi ro cần kiểm tra sớm (Phase 00)
- Tài khoản Cloudinary mới có thể **chặn phân phối PDF công khai** theo mặc định; cần bật trong cài đặt bảo mật của Cloudinary (kiểm tra mục cho phép PDF/ZIP). RAG tải PDF bằng URL nên đây là điểm có thể làm `DOWNLOAD_FAILED`. **Làm spike 30 phút trước khi code upload** ([[plan-phase-00-foundation]]).
- URL file là công khai (không ký) — chấp nhận trong phạm vi đồ án; không lưu tài liệu nhạy cảm.
