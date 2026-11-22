---
id: architecture-frontend
title: Frontend — Next.js App Router, state, guard, services
type: architecture
status: stable
tags: [frontend, nextjs, tailwind, state, guard]
related: [adr-001-nextjs-app-router, adr-017-solo-dev-workflow, coding-standards-frontend, ui-design-system, ui-screens-client, ui-screens-admin, workflow-solo-dev]
source: "Đồ án §2.2.5.1"
updated: 2026-11-21
---
# Frontend

## Nguyên tắc
- **Component-based** (Header, Sidebar, CourseCard…); **Role-based UI** dựa trên `AuthContext`; **React Hooks + Context** cho state dùng chung (không thêm Redux/Zustand).
- **Server Component** cho trang công khai lấy dữ liệu (Trang chủ, Danh mục, Chi tiết khóa — phần không phụ thuộc người dùng). **Client Component** cho trang cần phiên/tương tác (học, thi, chat, admin).
- Ẩn/hiện nút theo vai trò chỉ để UX; quyền thật ở backend ([[concept-roles-permissions]]).
- Responsive bằng Tailwind (mobile-first).

## Route groups
| Group | Layout | Guard | Trang |
|---|---|---|---|
| `(client)` | `ClientShell` (Navbar: Khám phá · Danh mục · Khóa học của tôi · Trợ lý AI · ô tìm · avatar) | công khai / `StudentGuard` | `/`, `/courses`, `/courses/[id]`, `/my-courses`, `/my-results`, `/my-results/[attemptId]`, `/ai` |
| `(learn)` | header riêng (logo + tên khóa + tiến độ + Thoát) | `StudentGuard` | `/learn/[courseId]`, `/learn/[courseId]/lessons/[lessonId]`, `/exams/[examId]` |
| `(auth)` | split-screen xanh | khách | `/login` (`?tab=register`, `?next=`) |
| `admin/login` | nền navy | khách | `/admin/login` |
| `admin/(panel)` | `AdminShell` (Sidebar + Topbar) | `StaffGuard` | `/admin`, `/admin/courses`, `/admin/lessons`, `/admin/exams`, `/admin/exam-stats`, `/admin/ai-documents`, `/admin/users` (`AdminOnlyGuard`) |

Chọn ngữ cảnh khóa ở admin bằng query: `?courseId=…` (và `&examId=…`). Chi tiết từng màn: [[ui-screens-client]], [[ui-screens-admin]].

## Lớp services (gọi API — không mock)
```
components/pages ─► features/*/hooks ─► services/index.ts ─► services/http/<x>.http.ts ─► apiClient ─► backend /api/v1
```
- **`services/index.ts` chỉ re-export từ `./http/*`** (ví dụ `export * from './http/catalog.http'`). Không chọn nguồn dữ liệu, không biến môi trường bật/tắt mock.
- Mỗi hàm trong `services/http/<x>.http.ts` trả `Promise<T>` với `T` suy ra từ zod ở `@/types` (bản copy của `backend/src/types/`); ném `ApiError` khi lỗi.
- `apiClient` (`lib/api-client.ts`): `fetch` + `credentials: 'include'`, base `NEXT_PUBLIC_API_BASE_URL`, parse envelope `{data,meta}` / `{error}`. Ở dev có thể `parse` response bằng zod để bắt lệch hợp đồng.
- **Không có** `services/mock/`, `mocks/fixtures/`, `NEXT_PUBLIC_MOCK_FEATURES`, độ trễ giả hay công tắc `?mock=`. Dữ liệu mẫu duy nhất là **seed của DB** ([[database-seed-data]]).
- Quy trình viết một tính năng: DTO → UI → thêm hàm `http` → backend ([[workflow-solo-dev]]). Backend chưa xong thì trang hiện trạng thái lỗi — bình thường.

## Kiểu dùng chung (`src/types/`)
`frontend/src/types/` là **bản copy** của `backend/src/types/` ([[adr-016-manual-type-sync]]): **không sửa tay**; cần đổi ⇒ sửa ở backend rồi chạy `./sync-types.sh` (từ thư mục gốc). Import bằng `@/types/...`. Cần `zod` trong `frontend/package.json`.

## State
| Phạm vi | Cách |
|---|---|
| Người dùng/phiên | `AuthContext` + `useAuth()` |
| Dữ liệu trang | hook `useAsync`/`useQuery`-style tự viết nhỏ (`{ data, error, status, refetch }`) |
| Form | state cục bộ + zod `safeParse` dùng lại schema trong `@/types` |
| Bộ lọc danh mục | đồng bộ vào URL (`?topic=<slug>&level=&q=&page=`; danh sách chủ đề lấy từ `GET /topics`) |
| Đồng hồ thi | `useExamTimer(durationMinutes, onExpire)` — tính từ mốc `Date.now()` lúc vào bài (không tin `setInterval` thuần) |

## Trạng thái giao diện bắt buộc cho mỗi trang dữ liệu
`loading` (skeleton) · `empty` · `error` (kèm **Thử lại**) · `forbidden` (403 → thông báo + điều hướng). Thiếu một trạng thái = chưa xong bước 1 của [[workflow-solo-dev]].

## Xử lý lỗi toàn cục
`401` → xóa `AuthContext`, chuyển trang đăng nhập đúng cổng kèm `next`. `403 NOT_ENROLLED` → về trang chi tiết khóa. Còn lại hiển thị toast/inline theo [[error-handling-conventions]].

## Upload
`FileDropzone` kiểm tra loại/cỡ ở client trước; gửi `FormData`; hiển thị tiến trình bằng `XMLHttpRequest.upload.onprogress` (fetch chưa hỗ trợ tiến trình upload).
