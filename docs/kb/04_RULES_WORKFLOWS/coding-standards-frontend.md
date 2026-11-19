---
id: coding-standards-frontend
title: Luật code Frontend (Next.js, Tailwind, services/http)
type: rule
status: stable
tags: [rules, frontend, tailwind, nextjs]
related: [coding-standards, architecture-frontend, ui-design-system, workflow-solo-dev, error-handling-conventions]
source: "Đồ án §2.2.5.1"
updated: 2026-11-15
---
# Luật Frontend

## Component
- Function component + hooks; **export có tên** (trừ `page.tsx`/`layout.tsx`/`error.tsx` của Next). Props có kiểu `interface XProps`.
- Mặc định **Server Component**; thêm `'use client'` chỉ khi cần state/effect/event/browser API. Đẩy `'use client'` xuống lá cây component.
- Một component ≤ 300 dòng; tách phần logic ra `features/<x>/use-<x>.ts`.
- **Không gọi `fetch`/`apiClient` trong component**; chỉ gọi hàm ở `services/` (qua hook).

## Tailwind
- **Chỉ Tailwind**; cấm `style={{}}` (trừ giá trị động không biểu diễn được, vd `width: ${percent}%` ⇒ dùng CSS variable), cấm CSS Modules/styled-components. `globals.css` chỉ chứa `@tailwind` + biến.
- Màu/bo góc/bóng lấy từ **token** ở `tailwind.config.ts` (hoặc `@theme` trong `globals.css` nếu Tailwind v4) ([[ui-design-system]]); cấm hex/`[#abc]` tự do.
- Dùng `cn()` (clsx + tailwind-merge) để ghép class; class điều kiện theo biến thể bằng `cva` (hoặc map object).
- Mobile-first: viết class mặc định cho mobile, thêm `sm:/md:/lg:`.
- Trợ năng: `<button>` cho hành động, `<a>/<Link>` cho điều hướng; `label` ↔ `input`; `aria-*` cho tabs/accordion/dialog; focus ring không bị tắt.

## Dữ liệu & state
- Dùng kiểu từ `@/types/...` (bản copy — **không sửa**, xem [[adr-016-manual-type-sync]]); parse form bằng schema trong `@/types` (`safeParse`).
- Hook dữ liệu trả `{ data, error, status, refetch }`; **mọi** trang dữ liệu xử lý `loading | empty | error | forbidden`.
- State toàn cục chỉ `AuthContext`; còn lại cục bộ. Không Redux/Zustand.
- Bộ lọc/phân trang ⇒ lưu trong URL (`useSearchParams`).
- Không lưu token/PII vào `localStorage`.

## Role-based UI
Ẩn/hiện bằng `<RoleGuard roles={['ADMIN']}>`; **không** coi là bảo mật. Mọi điều hướng bảo vệ dùng guard layout.

## Văn bản & nhãn
Chuỗi UI tiếng Việt viết trong component; **nhãn enum** (Đạt, Bản nháp, Đang xử lý…) chỉ lấy từ `labels.ts` qua `StatusLabel`. Định dạng ngày `dd/MM/yyyy HH:mm` (múi giờ `Asia/Ho_Chi_Minh`) bằng helper `formatDateTime`.

## Services (gọi API — không mock) — xem [[workflow-solo-dev]]
- Mọi lời gọi API nằm ở `services/http/<x>.http.ts`; `services/index.ts` chỉ `export * from './http/...'`. Component/hook import từ `@/services`.
- **Cấm** tạo `services/mock/`, `mocks/fixtures/`, công tắc `?mock=`, độ trễ giả, biến `NEXT_PUBLIC_MOCK_FEATURES` ([[adr-017-solo-dev-workflow]]).
- Dữ liệu mẫu chỉ đến từ seed DB; trang phải xử lý tốt khi API lỗi (`ErrorState`).

## Hiệu năng
`next/image` cho ảnh tĩnh; lazy-load trình xem PDF/video; không tải toàn bộ danh sách (luôn phân trang); `key` ổn định trong danh sách.

## Test
Agent **không** viết file test và **không** chạy lint/typecheck/test; Tech Lead tự làm ([[testing-strategy]]).
