---
id: ui-design-system
title: Design system — màu, kiểu chữ, component (rút từ file thiết kế)
type: ui
status: stable
tags: [ui, tailwind, tokens, components]
related: [ui-screens-client, ui-screens-admin, coding-standards-frontend, architecture-frontend]
source: "Design_ui_devlearn (19 màn hình); màu lấy mẫu từ ảnh"
updated: 2026-11-15
---
# Design system

Hai "giao diện" khác nhau nhưng dùng chung kiểu chữ: **CLIENT** (xanh lá, nút bo tròn) và **ADMIN** (navy + xanh dương, nút bo vuông nhẹ). Định nghĩa token trong `tailwind.config.ts` (hoặc `@theme` trong `globals.css` nếu Tailwind v4); **cấm hardcode hex trong component**.

## Màu (lấy mẫu từ ảnh thiết kế)
| Token Tailwind | Hex | Dùng cho |
|---|---|---|
| `client.primary` | `#2E7D32` | nút chính, logo, thanh tiến độ, tab active, avatar |
| `client.blue` | `#1D5E8C` | thẻ khóa (Lập trình), khung "Thông tin khóa học" |
| `client.slate` | `#37474F` | thẻ khóa (Cơ sở dữ liệu) |
| `client.teal` | `#00796B` | thẻ khóa (Web) |
| `client.surface` | `#F5F5F5` | nền section xám |
| `admin.navy` | `#0F1B2D` | sidebar, nền trang đăng nhập admin |
| `admin.primary` | `#2563EB` | nút chính, mục sidebar active, cột biểu đồ |
| `admin.bg` | `#F1F5F9` | nền trang |
| `admin.banner` | `#EFF6FF` | InfoBanner "Quản lý nội dung hiển thị ở CLIENT · …" |
| `status.success` | nền `#DCFCE7` / chữ xanh đậm | Đã xuất bản, Đạt, Hoạt động, Đã nạp, Đúng |
| `status.warning` | nền vàng nhạt / chữ nâu | Bản nháp, Chưa đạt, Đang xử lý, Khóa, Chưa trả lời |
| `status.danger` | nền `#FEE2E2` / chữ đỏ | Sai, nút Xóa (viền đỏ) |

> Màu trạng thái vàng/ xanh nhạt phía CLIENT là xấp xỉ theo ảnh; Tech Lead chốt giá trị cuối khi dùng thử.

## Chữ & hình khối
- Font: **Inter** (`next/font/google`). Tiêu đề lớn dùng `font-light`; nhãn/nút `font-semibold`.
- Container nội dung: `max-w-6xl mx-auto px-6`. Navbar cao ~64 px, viền dưới mảnh.
- Thẻ: viền `#E0E0E0` (CLIENT) / `slate-200` (ADMIN), `rounded-lg`, nền trắng.
- Nút CLIENT: `rounded-full`, chính = nền xanh chữ trắng, phụ = viền xanh chữ xanh. Nút ADMIN: `rounded-lg`, chính = `#2563EB`.
- Badge cấp độ trên thẻ khóa: chữ HOA nhỏ, nền trắng, chữ xanh, góc trên-trái ảnh.

## Bộ component (tên chuẩn — dùng đúng tên khi code)
| Nhóm | Component |
|---|---|
| `ui/` (nguyên tử) | `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Tabs`, `Badge`, `StatusChip`, `ProgressBar`, `Modal`, `ConfirmDialog`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `Pagination`, `DataTable`, `FileDropzone` |
| `client/` | `ClientShell`, `Navbar`, `CourseCard`, `CourseFilterSidebar`, `StatStrip`, `TopicTile`, `ModuleAccordion`, `EnrollPanel`, `CourseInfoCard`, `LessonSidebar`, `LessonViewer` (video/PDF), `LearnHeader`, `ExamHeader`+`ExamTimer`, `QuestionNavigator`, `OptionRadio`, `ChatPanel`, `MessageBubble`, `SourceLine`, `MyCourseRow`, `LearningSummaryCard`, `ResultsTable` |
| `admin/` | `AdminShell`, `AdminSidebar`, `AdminTopbar`, `InfoBanner`, `StatCard`, `BarChart` (CSS/SVG thuần, không thêm thư viện), `ActivityTable`, `CourseTable`, `StructureTree`, `LessonForm`, `ExamList`, `QuestionEditor`, `ExamStatsHeader`, `StudentResultTable`, `AttemptReview`, `AiDocumentTable`, `UserTable` |
| `shared/` | `Logo`, `RoleGuard`, `StatusLabel` (map enum → nhãn+màu từ `@/types/labels`) |

## Nhãn trạng thái (một nguồn: `backend/src/types/labels.ts`, FE: `@/types/labels`)
| Enum | Nhãn |
|---|---|
| `CourseStatus` | DRAFT "Bản nháp" · PUBLISHED "Đã xuất bản" |
| `ExamStatus` | DRAFT "Nháp" · OPEN "Đang mở" · CLOSED "Đã đóng" |
| `DocStatus` | PENDING/PROCESSING "Đang xử lý" · READY "Đã nạp" · FAILED "Lỗi" |
| `UserStatus` | ACTIVE "Hoạt động" · LOCKED "Khóa" |
| Kết quả | passed "Đạt" · !passed "Chưa đạt" |
| `Level` | BEGINNER "Nhập môn" · INTERMEDIATE "Trung cấp" · ADVANCED "Nâng cao" |
| `Topic` | PROGRAMMING "Lập trình" · DATABASE "Cơ sở dữ liệu" · WEB "Web" · SOFTWARE_ENGINEERING "Công nghệ phần mềm" |

## Trợ năng & responsive
Nhãn form liên kết `htmlFor`; tương phản chữ/nền ≥ 4.5:1; focus ring rõ; lưới thẻ khóa `grid-cols-1 sm:2 lg:3(4)`; sidebar admin thu gọn thành drawer dưới `lg`.
