---
id: git-workflow
title: Quy trình Git & Commit
type: workflow
status: stable
tags: [git, commit, pr, types-sync]
related: [definition-of-done, agent-rules, coding-standards, adr-016-manual-type-sync, architecture-repo-structure]
source: "Đồ án §2.2.4 (Git/GitHub); cập nhật theo ADR-016"
updated: 2026-11-15
---
# Git

Một repo Git ở thư mục gốc `devlearn/` chứa `backend/`, `frontend/`, `rag-service/`, `docs/`, `sync-types.sh`, `.gitignore` ([[architecture-repo-structure]]).

- **Nhánh**: `main` (ổn định) ← `feat/p<phase>-<slug>` (vd `feat/p05-exam-student`), `fix/<slug>`, `docs/<slug>`. Không commit thẳng `main`.
- **Commit** theo Conventional Commits, scope ∈ `backend | frontend | rag | types | kb`:
  `feat(frontend): C03 catalog mock UI` · `feat(backend): GET /courses` · `fix(rag): filter course_id` · `feat(types): thêm CourseCardDto` · `docs(kb): update FILE_MAPPING` · `test(backend): attempts concurrency` · `chore: …`.
- Commit nhỏ, theo giai đoạn của workflow: `…UI+mock`, `…wire`, `…backend`, `…tests` ([[workflow-ui-mock-wire-backend]]).

## Quy tắc commit khi đụng types (BẮT BUỘC)
1. Sửa `backend/src/types/` ⇒ chạy `./sync-types.sh` ⇒ **commit `backend/src/types/` và `frontend/src/types/` trong CÙNG một commit** (scope `types`).
2. Trước khi commit/PR: `./sync-types.sh --check` phải ✅.
3. Không commit thay đổi chỉ ở `frontend/src/types/` (luôn là dấu hiệu sửa tay sai luật).

## Trước khi tạo PR (chạy thủ công — chưa bắt buộc có CI)
```
cd backend  && npm run lint && npm run typecheck && npm run test
cd frontend && npm run lint && npm run typecheck && npm run test
./sync-types.sh --check
python docs/kb/tools/kb_lint.py          # nếu có sửa KB
```
CI (GitHub Actions) là **tùy chọn**, thêm ở [[plan-phase-10-hardening-release]] nếu muốn.

## PR
- Tiêu đề `[P05][B] Wire C06` (phase + giai đoạn); mô tả: liên kết file plan/mapping, ảnh chụp (UI), kết quả các lệnh trên, thay đổi hợp đồng/types (nếu có).
- Một PR = một giai đoạn của một tính năng (tránh PR khổng lồ). Merge bằng squash.
- Migration Prisma: mỗi PR tối đa một migration; **không** sửa migration đã merge.

## Tệp không được commit
- `.env`, `.env.test`, `.env.local` (chỉ commit `.env.example`); `node_modules/`, `dist/`, `.next/`, `rag-service/.venv/`, `rag-service/data/` — đã nằm trong `.gitignore`.
- **Có** commit `package-lock.json` của `backend/` và `frontend/` (khóa phiên bản thư viện).
- Cấm commit file > 5 MB (video/PDF mẫu để ngoài repo, dùng URL).
- Khi đổi KB: commit `docs(kb)` kèm `python docs/kb/tools/build_index.py` nếu thêm/xóa file.
