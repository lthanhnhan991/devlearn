---
id: agent-rules
title: Luật làm việc cho AI Agent (Solo Dev)
type: rule
status: stable
tags: [agent, rules, communication, types-sync, solo-dev]
related: [00_INDEX, PROGRESS, FILE_MAPPING, FILE_MAPPING_ADMIN, OPEN_QUESTIONS, definition-of-done, workflow-solo-dev, testing-strategy, api-contracts, adr-016-manual-type-sync, adr-017-solo-dev-workflow]
source: "Yêu cầu dự án; cập nhật theo ADR-016, ADR-017"
updated: 2026-11-15
---
# Luật cho AI Agent

Người dùng = **Tech Lead, làm một mình (Solo Dev)**. Mục tiêu: làm đúng, làm gọn, **tiết kiệm token**.

## 0. Mệnh lệnh
1. **Đọc [[00_INDEX]] trước** mọi việc, rồi chỉ đọc đúng file cần cho tác vụ (đi theo link).
2. **Contract-first**: [[api-contracts]] + `api-*.md` là nguồn sự thật. Không bịa endpoint/trường. Cần đổi ⇒ sửa tài liệu, rồi `backend/src/types/`, rồi `./sync-types.sh`, rồi mới code.
3. Làm theo **[[workflow-solo-dev]] (3 bước)**: UI & Wire API → Backend → Tech Lead tự test. **Không mock.**
4. Làm đúng **một tác vụ** trong một phase ([[plan-00-overview]]); không sửa ngoài phạm vi.
5. **Chỉ `npm`**, không monorepo, không Docker ([[adr-016-manual-type-sync]]).
6. Xong việc ⇒ **cập nhật log** (mục 6).

## 1. Quy trình bắt đầu một tác vụ
```
□ 00_INDEX → file plan-phase-XX → danh sách việc [ ]
□ concept liên quan (01_CONCEPTS) + api-*.md (02_ARCHITECTURE)
□ ui-screens-*.md (+ ảnh thiết kế) nếu có UI
□ coding-standards (+ -frontend / -backend / -rag-python)
□ FILE_MAPPING: hàng của tính năng → file cần tạo/sửa
□ Mơ hồ? → delta-vs-thesis / OPEN_QUESTIONS; chưa có đáp án ⇒ DỪNG & HỎI (mục 7)
```

## 2. Quy tắc giao tiếp (BẮT BUỘC)
- **Tuyệt đối KHÔNG in code ra chat** (không đoạn code, không diff, không nội dung file). Mọi code chỉ nằm **trong file**.
- Chỉ báo **trạng thái file** bằng đúng các dòng sau, mỗi file một dòng:

| Dòng báo cáo | Khi nào |
|---|---|
| `✅ Đã tạo xong auth.controller.ts` | tạo file mới |
| `✅ Đã sửa xong auth.service.ts` | sửa file có sẵn |
| `🗑️ Đã xóa xong old.http.ts` | xóa file |
| `▶️ Tech Lead chạy: cd backend && npm run prisma:migrate -- --name p02_catalog` | cần Tech Lead chạy lệnh (migrate, seed, restart…) |
| `⚠️ Cần xác nhận: <một câu hỏi ngắn>` | bị chặn / mơ hồ |

- Không giải thích dài, không tóm tắt lại thay đổi, không khen/xin lỗi. Cuối cùng tối đa **một dòng**: `➡️ Tiếp theo: <việc kế tiếp>`.
- Chỉ nói thêm khi Tech Lead hỏi trực tiếp.

## 3. Lệnh Agent KHÔNG được chạy
**Tech Lead (User) sẽ tự chạy các lệnh này. Agent không cần quan tâm** kết quả của chúng:
- `npm run lint`, `npm run typecheck`, `npm run test` (cả `backend/` và `frontend/`), `tsc --noEmit`, `eslint`, `vitest`
- `ruff`, `mypy`, `pytest` (rag-service)
- `./sync-types.sh --check`, `python docs/kb/tools/kb_lint.py`
- Khởi động server (`npm run dev`, `uvicorn`), `prisma migrate`, `db:seed`, `db:reset` — Tech Lead chạy (Agent chỉ **sửa file**, và nhắc bằng dòng `▶️`).

**Được chạy**: `./sync-types.sh` (chỉ là lệnh `cp`) sau khi sửa `backend/src/types/`.

### Không viết file test
Không tạo `.test.ts` / `.test.tsx` / `pytest`. **Ngoại lệ duy nhất**: logic **cực kỳ phức tạp** *và* Tech Lead đồng ý (ví dụ: nộp bài đồng thời nhiều request). Các test đã có sẵn được giữ nguyên. Chi tiết: [[testing-strategy]].

## 4. Quy tắc đồng bộ types (BẮT BUỘC)
Nguồn sự thật **`backend/src/types/`**; frontend dùng **bản copy** `frontend/src/types/` ([[adr-016-manual-type-sync]]).

| # | Quy tắc |
|---|---|
| S1 | **Chỉ sửa ở `backend/src/types/`.** Cấm sửa `frontend/src/types/`. |
| S2 | Sau **mỗi** lần sửa `backend/src/types/` ⇒ chạy `./sync-types.sh` (thư mục gốc `devlearn/`). |
| S3 | Commit cả hai thư mục `types/` trong **cùng một commit**. |
| S4 | `backend/src/types/` **tự đủ**: chỉ `import` từ `zod` và chính `types/` (không Express, Prisma, Node API, React, `process.env`). |
| S5 | Frontend không import từ `backend/`; chỉ dùng `@/types/...`. |
| S6 | DTO mới ⇒ làm ở **bước 1** của workflow, trước khi viết UI/http. |
| S7 | Sửa/xóa trường đã có ⇒ cập nhật `api-*.md` và mọi nơi dùng (UI, `http/`, mapper). |

(`./sync-types.sh --check` là lệnh của Tech Lead.) Script: `docs/kb/tools/sync-types.sh`.

## 5. Trong khi làm
- [[coding-standards]]: TS strict, **cấm `any`**, Tailwind + token, phân lớp BE, file ≤ 300 dòng.
- Gọi API **chỉ qua `frontend/src/services/http/`**; `services/index.ts` chỉ re-export. Không mock/fixture.
- Tái dùng: DTO/nhãn/`computeScore` từ `src/types/`; component từ [[ui-design-system]].
- Mỗi trang dữ liệu có đủ `loading / empty / error / forbidden` ([[architecture-frontend]]).
- Dữ liệu mẫu = seed DB ([[database-seed-data]]). Không commit `.env*` (trừ `.env.example`).

## 6. Cập nhật log sau khi xong
- Sửa trạng thái hàng tương ứng ở [[FILE_MAPPING]] / [[FILE_MAPPING_ADMIN]] (`🎨 UI+Wire` sau bước 1, `🛠 BE done` sau bước 2; **`✅ Đã test` chỉ Tech Lead đặt**).
- Tick `[x]` việc đã làm trong `plan-phase-XX`.
- Thêm **một mục ngắn** lên đầu "Nhật ký" của [[PROGRESS]]:
```md
### 2026-11-15 · P02 · Agent
- Đã làm: <1 dòng> · File chính: <vài tên file> · Types: có/không (đã sync) · Tiếp theo: <1 dòng>
```
- Các thao tác sửa log cũng chỉ báo bằng dòng `✅ Đã sửa xong PROGRESS.md`.

## 7. Cấm & phải dừng hỏi
**Cấm**: `any`, `@ts-ignore`, `!`, hex tự do, inline style, import Prisma ngoài repository, bỏ validate zod; sửa `frontend/src/types/`; tạo mock/fixture; dùng `pnpm`/monorepo/Docker; trả `isCorrect` trong đề thi hoặc `passwordHash`; truy vấn Chroma không lọc `course_id`; gọi Gemini/Chroma từ Express hoặc gọi RAG từ trình duyệt; tự xóa ADR.
**Dừng hỏi** (`⚠️ Cần xác nhận`): tài liệu mâu thuẫn ([[delta-vs-thesis]]); cần đổi hợp đồng/schema ảnh hưởng rộng; thêm thư viện lớn/đổi kiến trúc (⇒ ADR); schema thực tế khác KB (Q-15 ở [[OPEN_QUESTIONS]]).

## 8. Viết/sửa tài liệu KB
Frontmatter bắt buộc (`id` = tên file, `title`, `type`, `status`, `tags`, `related`, `updated`); liên kết `[[id]]`; mỗi ghi chú một chủ đề, ≤ 300 dòng. Thêm/xóa file KB ⇒ nhắc Tech Lead chạy `python docs/kb/tools/build_index.py` và `kb_lint.py`.

## 9. Mẫu prompt giao việc
> "Đọc `docs/kb/00_INDEX/00_INDEX.md`. Làm **P02 — C03 Danh mục khóa học** theo `plan-phase-02-course-catalog.md` (workflow-solo-dev: DTO → UI → http → Backend → DB). Tuân thủ `agent-rules.md`: không in code, chỉ báo `✅` từng file, không chạy lint/typecheck/test."
