---
id: definition-of-done
title: Definition of Done (Solo Dev)
type: rule
status: stable
tags: [dod, quality, checklist, solo-dev]
related: [agent-rules, workflow-solo-dev, testing-strategy, coding-standards, adr-016-manual-type-sync, adr-017-solo-dev-workflow]
source: "Thiết kế Tech Lead; cập nhật theo ADR-017"
updated: 2026-11-15
---
# Definition of Done

> **Tech Lead (User) sẽ tự chạy các lệnh kiểm tra. Agent không cần quan tâm.** Agent chỉ phải hoàn thành phần *code + cập nhật log* dưới đây.

## Phần của Agent — một tác vụ được coi là xong khi
### Bước 1 — UI & Wire API
- [ ] DTO ở `backend/src/types/dto/` đã tạo/sửa và đã chạy `./sync-types.sh` (hai thư mục `types/` khớp)
- [ ] UI khớp thiết kế; đủ `loading / empty / error / forbidden`; responsive
- [ ] Gọi API qua `frontend/src/services/http/<x>.http.ts`; không mock/fixture; không gọi `fetch` trong component
- [ ] Không `any`, hex tự do, inline style
- [ ] Hàng FILE_MAPPING → `🎨 UI+Wire`

### Bước 2 — Backend (+ DB)
- [ ] Khớp ví dụ JSON ở `api-*.md` và DTO trong `src/types/`
- [ ] Phân lớp đúng (route → controller → service → repository → mapper); **chỉ repository dùng Prisma**
- [ ] Validate zod ở route; kiểm quyền/ownership ở service; không lộ `passwordHash`, `isCorrect` (đề thi)
- [ ] Nếu phase có model mới: `schema.prisma` + `seed.ts` đã sửa đúng lịch ở [[database-erd]]; đã nhắc `▶️` lệnh migrate/seed
- [ ] `backend/src/types/` vẫn **tự đủ** (chỉ `zod` + chính nó)
- [ ] Hàng FILE_MAPPING → `🛠 BE done`

### Log
- [ ] Tick `[x]` trong `plan-phase-XX`; thêm mục ngắn vào [[PROGRESS]]
- [ ] Báo cáo cuối chỉ gồm các dòng `✅ …` ([[agent-rules]] mục 2)

## Phần của Tech Lead — Bước 3 (Agent bỏ qua)
Bật PostgreSQL + 2 terminal: `cd backend && npm run dev` và `cd frontend && npm run dev` ([[architecture-deployment-env]]), rồi:
```
cd backend  && npm run lint && npm run typecheck && npm run test    # test: chỉ khi có
cd frontend && npm run lint && npm run typecheck && npm run test    # test: chỉ khi có
./sync-types.sh --check                                             # từ thư mục gốc devlearn/
```
- [ ] Dùng thử theo checklist của phase ở `06_EXECUTION_PLAN/` ([[testing-strategy]])
- [ ] Đặt hàng FILE_MAPPING → `✅ Đã test`

## Tài liệu KB (khi có sửa KB)
- [ ] Frontmatter đủ; `id` = tên file; link `[[…]]` không gãy; ≤ 300 dòng; có trong [[00_INDEX]] — Tech Lead chạy `python docs/kb/tools/build_index.py && python docs/kb/tools/kb_lint.py`
