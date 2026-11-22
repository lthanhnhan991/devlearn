# DevLearn — Knowledge Base

Bộ tài liệu "kim chỉ nam" cho Dev và AI Agent của dự án **DevLearn** (Next.js · Express · FastAPI RAG · PostgreSQL/Prisma).

## Cách dùng
1. Đặt thư mục này vào repo tại `devlearn/docs/kb/`. Dự án gồm `backend/` (npm), `frontend/` (npm), `rag-service/` (Python), `docs/` — **không monorepo, không pnpm, không Docker** (xem ADR-016).
2. **Mở `00_INDEX/00_INDEX.md` đầu tiên**, rồi `04_RULES_WORKFLOWS/agent-rules.md`.
3. Đọc `00_INDEX/delta-vs-thesis.md` trước khi code: đó là nơi KB khác Đồ án (mâu thuẫn, giả định, khoảng trống UI). **KB thắng Đồ án.**
4. Làm theo `06_EXECUTION_PLAN/plan-00-overview.md`: quy trình **Solo Dev 3 bước** (UI & Wire API → Backend → Tech Lead tự test), **không mock**; Phase 00–01 đã xong.

## Cấu trúc
```
00_INDEX/            bản đồ, thuật ngữ, lệch-so-với-đồ-án
01_CONCEPTS/         14 khái niệm nghiệp vụ (auth, course, exam, RAG…)
02_ARCHITECTURE/     kiến trúc, DB (ERD + Prisma), API contracts (14 file), UI specs, design system
03_DECISIONS/        17 ADR (ADR-014 superseded bởi ADR-016; ADR-015 đã xóa, thay bằng ADR-017; ADR-018: chủ đề động)
04_RULES_WORKFLOWS/  luật code, luật Agent (không in code, không tự test), workflow-solo-dev, testing, git, DoD
05_MEMORY_LOGS/      PROGRESS, FILE_MAPPING (client/admin), OPEN_QUESTIONS
06_EXECUTION_PLAN/   11 phase, checklist [ ]: DTO → UI → http → Backend → DB (+ test tay của Tech Lead)
tools/               kb_lint.py (kiểm KB), build_index.py (sinh lại mục lục), sync-types.sh (copy vào thư mục gốc repo)
```

## Quy ước KB
- Mỗi file: frontmatter YAML + một chủ đề + ≤ 300 dòng; liên kết chéo bằng `[[id]]` (id = tên file không `.md`).
- Sau khi thêm/xóa/đổi tên file (chạy từ thư mục gốc `devlearn/`): `python docs/kb/tools/build_index.py && python docs/kb/tools/kb_lint.py`.
- Ảnh thiết kế UI **không** nằm trong KB; các file `ui-screens-*.md` trỏ tới tên file ảnh trong `Design_ui_devlearn/`.
