---
id: git-workflow
title: Quy trình Git & Commit (Solo Dev)
type: workflow
status: stable
tags: [git, commit, types-sync, solo-dev]
related: [definition-of-done, agent-rules, coding-standards, adr-016-manual-type-sync, architecture-repo-structure]
source: "Đồ án §2.2.4; cập nhật theo ADR-016, ADR-017"
updated: 2026-11-15
---
# Git

Một repo Git ở thư mục gốc `devlearn/` chứa `backend/`, `frontend/`, `rag-service/`, `docs/`, `sync-types.sh`, `.gitignore` ([[architecture-repo-structure]]). Tech Lead làm một mình ⇒ **không bắt buộc PR/review**.

- **Nhánh**: `main` luôn chạy được. Làm việc trên `feat/p<phase>-<slug>` (vd `feat/p02-course-catalog`) rồi merge khi Tech Lead đã test xong (bước 3 của [[workflow-solo-dev]]).
- **Commit** (Conventional Commits), scope ∈ `backend | frontend | rag | types | kb`:
  `feat(frontend): C03 danh mục khóa học` · `feat(backend): GET /courses` · `feat(types): thêm CourseCardDto` · `fix(rag): filter course_id` · `docs(kb): cập nhật FILE_MAPPING`.
- Commit nhỏ theo tính năng; một tính năng thường gồm: types → UI+http → backend.

## Khi đụng types (BẮT BUỘC)
1. Sửa `backend/src/types/` ⇒ `./sync-types.sh` ⇒ **commit cả `backend/src/types/` và `frontend/src/types/` trong CÙNG một commit** (scope `types`).
2. Không commit thay đổi chỉ ở `frontend/src/types/`.

## Trước khi commit
Tech Lead tự chạy lint/typecheck/test và `./sync-types.sh --check` khi muốn ([[testing-strategy]]). **Agent không chạy các lệnh này.** Không có CI bắt buộc.

## Tệp không được commit
- `.env`, `.env.test`, `.env.local` (chỉ commit `.env.example`); `node_modules/`, `dist/`, `.next/`, `rag-service/.venv/`, `rag-service/data/` — đã có trong `.gitignore`.
- **Có** commit `package-lock.json` của `backend/` và `frontend/`.
- Không commit file > 5 MB (video/PDF mẫu dùng URL).
- Migration Prisma: mỗi phase một migration, **không** sửa migration đã áp dụng.
- Khi đổi KB: commit `docs(kb)`; thêm/xóa file ⇒ chạy `python docs/kb/tools/build_index.py`.
