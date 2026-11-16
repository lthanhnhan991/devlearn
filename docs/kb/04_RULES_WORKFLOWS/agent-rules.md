---
id: agent-rules
title: Luật làm việc cho AI Agent & Dev
type: rule
status: stable
tags: [agent, workflow, rules, logging, types-sync]
related: [00_INDEX, PROGRESS, FILE_MAPPING, FILE_MAPPING_ADMIN, OPEN_QUESTIONS, definition-of-done, workflow-ui-mock-wire-backend, api-contracts, adr-016-manual-type-sync]
source: "Yêu cầu dự án; cập nhật theo ADR-016"
updated: 2026-11-15
---
# Luật cho AI Agent (và Dev)

## 0. Mệnh lệnh
1. **LUÔN đọc [[00_INDEX]] trước** mọi việc. Sau đó đi theo link tới đúng file cần cho tác vụ — đọc **đủ** nhưng **không đọc tràn lan**.
2. **Contract-first**: [[api-contracts]] + `api-*.md` là nguồn sự thật. Không bịa endpoint/trường. Cần thay đổi ⇒ sửa tài liệu **trước**, rồi sửa `backend/src/types/` và chạy `./sync-types.sh`, rồi mới code.
3. **LUÔN cập nhật log sau khi làm xong**: [[PROGRESS]] (nhật ký) + [[FILE_MAPPING]]/[[FILE_MAPPING_ADMIN]] (trạng thái cột). Không cập nhật = chưa xong.
4. Làm đúng **một tác vụ** trong một phase ([[plan-00-overview]]); không "tiện tay" sửa ngoài phạm vi.
5. **Chỉ dùng `npm`** (không `pnpm`/`yarn`), **không monorepo**, **không Docker** — xem [[adr-016-manual-type-sync]]. Lệnh luôn viết dạng `cd backend && npm run …` / `cd frontend && npm run …`.

## 1. Quy trình bắt đầu một tác vụ
```
□ Đọc 00_INDEX → file plan-phase-XX của tác vụ → mục tiêu + checklist
□ Đọc concept liên quan (01_CONCEPTS) và api-*.md (02_ARCHITECTURE)
□ Đọc ui-screens-*.md + ảnh thiết kế (nếu có UI)
□ Đọc coding-standards (+ -frontend/-backend/-rag-python)
□ Xem FILE_MAPPING: hàng của tính năng → file cần tạo/sửa
□ Có điểm mơ hồ? → xem OPEN_QUESTIONS / delta-vs-thesis; nếu chưa có câu trả lời ⇒ DỪNG & HỎI (mục 5)
```

## 2. Trong khi làm
- Theo đúng **[[workflow-ui-mock-wire-backend]]**: UI + Mock → Review → Wire → Backend → Test. **Không nhảy bước**; không code backend cho tính năng chưa qua Review UI (trừ phase RAG độc lập).
- Tuân thủ [[coding-standards]]: TS strict, **cấm `any`**, Tailwind + token, phân lớp BE, file ≤ 300 dòng.
- Tái dùng, không nhân bản: DTO/công thức/nhãn lấy từ `src/types/` (`computeScore`, `labels.ts`); component từ [[ui-design-system]].
- Mỗi commit nhỏ, đúng [[git-workflow]]. Không commit `.env*` (trừ `.env.example`), secret, file build.
- Dữ liệu mẫu dùng `seed-ids` ([[database-seed-data]]).

## 2b. Quy tắc đồng bộ types (BẮT BUỘC)
Thay cho package `contracts` cũ. Nguồn sự thật là **`backend/src/types/`**; frontend dùng **bản copy** `frontend/src/types/` ([[adr-016-manual-type-sync]]).

| # | Quy tắc |
|---|---|
| S1 | **Chỉ sửa ở `backend/src/types/`.** Cấm sửa trực tiếp `frontend/src/types/` (kể cả "sửa nhanh cho chạy"). |
| S2 | Sau **mỗi** lần sửa `backend/src/types/` ⇒ chạy `./sync-types.sh` (ở thư mục gốc `devlearn/`). |
| S3 | **Commit cả hai thư mục `types/` trong cùng một commit.** |
| S4 | Trước khi báo xong tác vụ hoặc mở PR: chạy `./sync-types.sh --check`. Báo "❌ LỆCH" ⇒ chạy `./sync-types.sh` rồi commit. |
| S5 | `backend/src/types/` **tự đủ**: chỉ `import` từ `zod` và từ chính `types/`. Cấm import Express, Prisma, Node API, React, `process.env`. |
| S6 | Frontend **không** import đường dẫn `../../backend/...`; chỉ dùng `@/types/...`. |
| S7 | Thêm DTO mới cho tính năng ⇒ làm ở **giai đoạn A** của workflow, trước khi viết mock. Ghi tên file vào PROGRESS. |
| S8 | Sửa/xóa trường **đã có** trong DTO ⇒ phải cập nhật `api-*.md` và kiểm cả mock, `http`, backend mapper (tìm bằng `tsc --noEmit` ở cả hai dự án). |

Lệnh: `./sync-types.sh` (copy) · `./sync-types.sh --check` (kiểm, thoát mã 1 nếu lệch). Không chạy được? Dùng `bash sync-types.sh` (Windows: Git Bash). Nội dung script: `docs/kb/tools/sync-types.sh`.

## 3. Khi xong (Definition of Done — [[definition-of-done]])
1. Chạy kiểm tra ở **dự án bạn đã sửa** (cả hai nếu đụng `types/`):
   - `cd backend && npm run lint && npm run typecheck && npm run test`
   - `cd frontend && npm run lint && npm run typecheck && npm run test`
   - `./sync-types.sh --check`
   Dán kết quả ngắn vào log.
2. Tick `[x]` đúng mục trong file `plan-phase-XX`.
3. Cập nhật cột **Trạng thái** của hàng tương ứng ở FILE_MAPPING.
4. **Thêm một mục vào [[PROGRESS]]** theo mẫu dưới.
5. Nếu thêm/đổi/xóa file `.md` trong KB: chạy `python docs/kb/tools/build_index.py` rồi `python docs/kb/tools/kb_lint.py` (từ thư mục gốc `devlearn/`).

### Mẫu mục nhật ký (đặt **trên cùng** PROGRESS.md, mới nhất trước)
```md
### 2026-11-15 14:30 · P02 · feat/p02-course-catalog · Agent: <tên>
- **Tác vụ**: Wire C03 Danh mục khóa học
- **Đã làm**: catalog.http.ts, đổi NEXT_PUBLIC_MOCK_FEATURES bỏ `catalog`
- **File**: frontend/src/services/http/catalog.http.ts (+), …
- **Types**: có sửa backend/src/types/dto/catalog.ts → đã sync-types ✅ | không đụng types
- **Kiểm tra**: backend lint/typecheck/test ✅ · frontend lint/typecheck/test ✅ · sync-types --check ✅
- **Lệch/Quyết định**: không | hoặc "đã thêm Q-07 vào OPEN_QUESTIONS"
- **Tiếp theo**: Backend GET /courses (P02-D2)
```

## 4. Cấm
- ❌ `any`, `@ts-ignore`, `!`, hex tự do, inline style, import Prisma ngoài repository, bỏ validate zod.
- ❌ **Sửa `frontend/src/types/`**; import từ `backend/` trong frontend; để `types/` phụ thuộc thư viện ngoài `zod`.
- ❌ Dùng `pnpm`, tạo `pnpm-workspace.yaml`/`packages/`/`docker-compose.yml`; thêm Docker như yêu cầu bắt buộc.
- ❌ Trả `isCorrect` trong đề thi; trả `passwordHash`; truy vấn Chroma không lọc `course_id`.
- ❌ Gọi Gemini/Chroma từ Express; gọi RAG từ trình duyệt.
- ❌ Viết lại công thức chấm điểm/tiến độ ở nhiều nơi.
- ❌ Xóa/sửa ADR cũ — tạo ADR mới ghi đè (`status: superseded`).
- ❌ File KB > 300 dòng: **tách** thành ghi chú nguyên tử + liên kết.

## 5. Khi PHẢI dừng và hỏi
- Tài liệu mâu thuẫn nhau hoặc với thiết kế UI (kiểm [[delta-vs-thesis]] trước).
- Cần đổi hợp đồng API/schema DB ảnh hưởng nơi khác.
- Cần thêm thư viện lớn, đổi kiến trúc (⇒ ADR). `npx prisma init` sinh cấu trúc khác KB (Q-15).
- Yêu cầu chạm dữ liệu thật/bí mật/hạ tầng.
Cách hỏi: ghi vào [[OPEN_QUESTIONS]] (ID `Q-xx`, bối cảnh, đề xuất mặc định) rồi báo người phụ trách; **không đoán**.

## 6. Cách viết/sửa tài liệu KB
- Frontmatter YAML bắt buộc: `id` (= tên file), `title`, `type`, `status`, `tags`, `related`, `updated`.
- Liên kết kiểu wikilink `[[id]]`; mỗi file nên liên kết ≥ 2 file khác (đồ thị, không cô lập).
- Mỗi ghi chú **một chủ đề** (atomic). Dài quá ⇒ tách.
- Kiểm tra bằng `python docs/kb/tools/kb_lint.py` (frontmatter, link gãy, > 300 dòng, file mồ côi).

## 7. Mẫu prompt giao việc cho Agent
> "Đọc `docs/kb/00_INDEX/00_INDEX.md`. Thực hiện **P03 / Giai đoạn A (UI+Mock) cho C05 Giao diện học tập** theo `plan-phase-03-learning-progress.md`. Tuân thủ `agent-rules.md` (đặc biệt mục 2b đồng bộ types). Dừng ở Review gate, cập nhật PROGRESS + FILE_MAPPING."
