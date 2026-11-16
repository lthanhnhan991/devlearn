---
id: definition-of-done
title: Definition of Done (DoD)
type: rule
status: stable
tags: [dod, quality, checklist, npm]
related: [agent-rules, workflow-ui-mock-wire-backend, testing-strategy, coding-standards, git-workflow, adr-016-manual-type-sync]
source: "Thiết kế của Tech Lead; cập nhật theo ADR-016"
updated: 2026-11-15
---
# Definition of Done

## Bộ lệnh kiểm tra chuẩn
Chạy ở dự án bạn đã sửa (cả hai nếu đụng `src/types/`). Phải **xanh** trước khi tick `[x]`.
```
cd backend  && npm run lint && npm run typecheck && npm run test
cd frontend && npm run lint && npm run typecheck && npm run test
./sync-types.sh --check            # từ thư mục gốc devlearn/ (lỗi ⇒ chạy ./sync-types.sh rồi commit cả hai types/)
cd rag-service && ruff check . && mypy . && pytest      # chỉ khi sửa rag-service
```

## Cho một giai đoạn UI+Mock (A)
- [ ] Khớp thiết kế; đủ `loading/empty/error/forbidden`; responsive
- [ ] DTO/kiểu từ `src/types/` (FE: `@/types`); fixtures parse được bằng zod
- [ ] Nếu sửa `backend/src/types/`: đã chạy `./sync-types.sh`, **cả hai** thư mục `types/` cùng một commit
- [ ] `cd frontend && npm run lint && npm run typecheck && npm run test` xanh; không `any`/hex/inline style
- [ ] Ảnh chụp trạng thái đính kèm PR; ghi PROGRESS; hàng FILE_MAPPING → `🎨 UI+Mock`

## Cho giai đoạn Wire (C)
- [ ] `services/http/` cùng chữ ký `services/mock/`; lỗi ánh xạ đúng [[error-handling-conventions]]
- [ ] Không còn import `mocks/` trong component; `cd frontend && npm run typecheck && npm run test` xanh
- [ ] FILE_MAPPING → `🔌 Wired`

## Cho giai đoạn Backend (D)
- [ ] Mỗi endpoint khớp ví dụ JSON ở `api-*.md` (đã kiểm bằng test parse zod)
- [ ] Phân lớp đúng; chỉ repository dùng Prisma; validate zod; kiểm quyền ở service
- [ ] Test: thành công + 401 + 403 + 400 + nhánh nghiệp vụ; ca bắt buộc liên quan ở [[testing-strategy]]
- [ ] `cd backend && npm run db:reset` chạy sạch từ DB trống (migrate + seed)
- [ ] `cd backend && npm run lint && npm run typecheck && npm run test` xanh
- [ ] `backend/src/types/` vẫn **tự đủ** (chỉ import `zod` + chính nó) và `./sync-types.sh --check` ✅
- [ ] FILE_MAPPING → `🛠 BE done`

## Cho giai đoạn Test & đóng (E)
- [ ] Gỡ mock khỏi `NEXT_PUBLIC_MOCK_FEATURES`, chạy tay luồng liên quan với backend thật (`cd backend && npm run dev` + `cd frontend && npm run dev`)
- [ ] Không còn `TODO` không có ticket; không `console.log`
- [ ] Checklist `plan-phase-XX` đã tick; FILE_MAPPING → `✅ Tested`
- [ ] [[PROGRESS]] có mục mới; `python docs/kb/tools/kb_lint.py` xanh (nếu đụng KB)

## Cho tài liệu KB
- [ ] Frontmatter đủ; `id` = tên file; link `[[…]]` không gãy; ≤ 300 dòng; được liệt kê trong [[00_INDEX]] (`python docs/kb/tools/build_index.py`)
- [ ] Không nhắc `pnpm`, monorepo, `packages/`, Docker bắt buộc ([[adr-016-manual-type-sync]])
