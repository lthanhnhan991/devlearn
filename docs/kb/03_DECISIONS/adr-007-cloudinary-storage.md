---
id: adr-007-cloudinary-storage
title: ADR-007 — Cloudinary lưu video & PDF
type: decision
status: accepted
tags: [adr, cloudinary, storage]
related: [concept-file-storage, api-admin-content]
source: "Đồ án §2.2.2 (7)"
updated: 2026-11-15
---
# ADR-007 — Cloudinary

## Quyết định
Cloudinary lưu video/PDF (phục vụ video tốt). Giới hạn **video ≤ 100 MB, PDF ≤ 10 MB** (form + backend). Upload đi **qua Backend** (đúng sơ đồ Hình 3-3) bằng stream từ file tạm. Lưu thêm `file_public_id` để xóa.

## Phương án
- Upload trực tiếp từ trình duyệt (signed upload): nhẹ cho server nhưng lệch sơ đồ đã duyệt và khó kiểm quyền/kích thước.
- Video lớn: nhúng **YouTube không công khai** (nhập link).

## Hệ quả
- (+) Không tự vận hành lưu trữ/streaming.
- (−) URL công khai không ký; có thể bị chặn PDF mặc định — **spike ở Phase 00** ([[concept-file-storage]]).
