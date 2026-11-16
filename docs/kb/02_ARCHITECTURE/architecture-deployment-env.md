---
id: architecture-deployment-env
title: Chạy cục bộ (không Docker) & Biến môi trường
type: architecture
status: stable
tags: [env, local-dev, postgres, ports, setup]
related: [architecture-repo-structure, system-overview, concept-file-storage, architecture-rag-service, plan-phase-00-foundation, plan-phase-10-hardening-release, adr-016-manual-type-sync]
source: "Đồ án §2.2.4; cập nhật theo ADR-016"
updated: 2026-11-15
---
# Chạy cục bộ & Biến môi trường

**Không dùng Docker.** Ba dịch vụ chạy trực tiếp trên máy bằng 3 terminal. Docker chỉ là **tùy chọn cho Phase 10** ([[plan-phase-10-hardening-release]]), không bắt buộc.

## Cần cài trước
| Công cụ | Dùng cho | Ghi chú |
|---|---|---|
| Node.js (bản LTS) + npm | backend, frontend | `node -v`, `npm -v` |
| PostgreSQL | CSDL | xem "Cách có PostgreSQL" |
| Python ≥ 3.11 | rag-service (Phase 07) | `python --version` |
| Git (Windows: kèm **Git Bash**) | quản lý mã, chạy `sync-types.sh` | |

## Cổng
| Dịch vụ | Địa chỉ | Lệnh |
|---|---|---|
| frontend | `http://localhost:3000` | `cd frontend && npm run dev` |
| backend | `http://localhost:4000` (prefix `/api/v1`) | `cd backend && npm run dev` |
| rag-service | `http://127.0.0.1:8000` | `cd rag-service && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` |
| PostgreSQL | `localhost:5432` | dịch vụ nền của máy |

ChromaDB **nhúng** trong rag-service, dữ liệu ở `rag-service/data/chroma/` (không commit). Phase đầu có thể **chưa bật rag-service** (frontend dùng mock).

## Cách có PostgreSQL (chọn 1)
1. **Cài trên máy** (trình cài đặt chính thức): nhớ mật khẩu user `postgres`. Tạo 2 database `devlearn` và `devlearn_test` (pgAdmin hoặc `psql -U postgres -c "CREATE DATABASE devlearn;"`).
2. **Postgres miễn phí trên đám mây** (ví dụ Neon, Supabase — kiểm tra điều khoản hiện hành): lấy chuỗi kết nối bỏ vào `DATABASE_URL`; tạo thêm một database/nhánh riêng cho test.
Prisma chỉ cần `DATABASE_URL`, hai cách dùng như nhau. Ghi lựa chọn vào [[OPEN_QUESTIONS]] Q-14.

## Tạo file môi trường (mỗi dự án một file)
Chép `.env.example` thành file thật; **không commit** file thật (`.gitignore` đã chặn).
| Dự án | File thật | Mẫu (commit) |
|---|---|---|
| backend | `backend/.env` (+ `backend/.env.test` cho test) | `backend/.env.example` |
| frontend | `frontend/.env.local` (cách Next.js đọc biến cục bộ) | `frontend/.env.example` |
| rag-service | `rag-service/.env` | `rag-service/.env.example` |

### `backend/.env`
| Biến | Ví dụ / mặc định | Mô tả |
|---|---|---|
| `NODE_ENV` | `development` | |
| `PORT` | `4000` | |
| `DATABASE_URL` | `postgresql://postgres:<mật_khẩu>@localhost:5432/devlearn` | Prisma |
| `JWT_SECRET` | ≥ 32 ký tự ngẫu nhiên | bắt buộc |
| `JWT_EXPIRES_IN` | `7d` | |
| `COOKIE_NAME` | `devlearn_token` | |
| `CORS_ORIGINS` | `http://localhost:3000` | phân tách bằng dấu phẩy |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | | |
| `MAX_VIDEO_MB` / `MAX_PDF_MB` | `100` / `10` | |
| `RAG_BASE_URL` | `http://127.0.0.1:8000` | |
| `RAG_INTERNAL_KEY` | chuỗi ngẫu nhiên | trùng `INTERNAL_KEY` của rag-service |
| `RAG_TIMEOUT_MS` | `15000` | |

`backend/.env.test`: giống trên nhưng `DATABASE_URL` trỏ `devlearn_test`, `NODE_ENV=test`.

### `frontend/.env.local`
| Biến | Ví dụ | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000/api/v1` | dùng cả ở trình duyệt lẫn Server Components |
| `NEXT_PUBLIC_MOCK_FEATURES` | `auth,catalog,learning,exam` | tính năng còn dùng mock; rỗng = tất cả thật |

### `rag-service/.env`
| Biến | Mặc định |
|---|---|
| `INTERNAL_KEY` | (bắt buộc) |
| `API_CALLBACK_BASE_URL` | `http://localhost:4000` |
| `GEMINI_API_KEY` | (bắt buộc) |
| `GEMINI_EMBED_MODEL`, `GEMINI_CHAT_MODEL` | điền theo model hiện hành |
| `CHROMA_PERSIST_DIR` | `./data/chroma` |
| `CHUNK_SIZE`, `CHUNK_OVERLAP`, `TOP_K`, `MIN_RELEVANCE` | `1000`, `150`, `5`, `0.35` |
| `RAG_FAKE_PROVIDER` | `false` (`true` ⇒ dùng Gemini giả khi test) |

## Python (rag-service)
```
cd rag-service
python -m venv .venv                 # tạo môi trường ảo (một lần)
.venv\Scripts\activate               # Windows   |   source .venv/bin/activate   (macOS/Linux)
pip install -r requirements.txt      # ghim phiên bản trong file này
```

## Quy tắc
- `.env*` không commit (trừ `.env.example` chỉ chứa giá trị giả) — xem `.gitignore` ở [[architecture-repo-structure]].
- Cookie `Secure` bật khi `NODE_ENV=production` (cần HTTPS). Ở dev, `localhost:3000` và `localhost:4000` cùng *site* nên cookie `SameSite=Lax` + `credentials: 'include'` hoạt động.
- rag-service chạy `--host 127.0.0.1` (chỉ máy local gọi được) và **một worker** ([[adr-005-chromadb-embedded]]).
- Migration trước khi chạy backend lần đầu: `cd backend && npm run prisma:migrate`; nạp mẫu: `npm run db:seed`.
- Thứ tự bật: PostgreSQL → backend → (rag-service) → frontend.

## Docker (tùy chọn — Phase 10)
Chỉ cân nhắc khi cần đóng gói để triển khai/demo trên máy khác **sau khi** hệ thống đã ổn định. Không phải điều kiện của bất kỳ phase nào trước đó.
