---
id: architecture-backend-layers
title: Backend — Kiến trúc phân lớp (Express)
type: architecture
status: stable
tags: [backend, express, layered, middleware]
related: [adr-002-express-layered-backend, coding-standards-backend, error-handling-conventions, concept-auth, concept-roles-permissions, api-contracts]
source: "Đồ án §2.2.5.2"
updated: 2026-11-15
---
# Backend — phân lớp

```
HTTP ─► Route ─► [middleware] ─► Controller ─► Service ─► Repository ─► Prisma/DB
                  authenticate      (mỏng)      (nghiệp vụ)  (truy vấn)
                  requireRole
                  validate(zod)
```
| Lớp | Trách nhiệm | Được phép | Cấm |
|---|---|---|---|
| Route | Gắn path + middleware + controller | khai báo | logic |
| Controller | Lấy `req` → gọi service → `res.json` | map DTO, set status | gọi Prisma, nghiệp vụ |
| Service | Nghiệp vụ, kiểm quyền sở hữu, transaction, gọi `rag-client`/`cloudinary` | ném `AppError` | `req/res`, Prisma trực tiếp |
| Repository | **Duy nhất** import Prisma client; truy vấn, `groupBy`, `$queryRaw` tham số hóa | trả entity/POJO | nghiệp vụ |
| Mapper | Entity → DTO (loại `passwordHash`, đổi `Decimal` → `number`) | thuần hàm | I/O |

## Middleware (thứ tự toàn cục)
1. `helmet`, `cors({ origin: CORS_ORIGINS, credentials: true })`, `cookie-parser`, `express.json({ limit: '1mb' })`
2. request-id + logger (`pino`)
3. Routers `/api/v1/*`
4. `notFoundHandler` → `errorHandler` (định dạng lỗi chuẩn — [[error-handling-conventions]])

Middleware theo route: `rateLimit(...)`, `authenticate`, `optionalAuthenticate`, `requireRole(...)`, `validate({ params, query, body })` (zod, trả `400 VALIDATION_ERROR`), `upload.single('file')`.

## Mẫu một module (courses)
```ts
// courses.routes.ts
router.get('/', validate({ query: listCoursesQuery }), ctrl.list);                    // public
router.get('/:courseId', optionalAuthenticate, validate({ params: courseIdParam }), ctrl.detail);
router.post('/:courseId/enroll', authenticate, requireRole('STUDENT'), ctrl.enroll);

// courses.service.ts
async enroll(userId: string, courseId: string): Promise<EnrollmentDto> {
  const course = await this.repo.findPublishedById(courseId);
  if (!course) throw new AppError('NOT_FOUND', 404, 'Không tìm thấy khóa học');
  if (await this.enrollRepo.exists(userId, courseId)) throw new AppError('ALREADY_ENROLLED', 409, '…');
  return toEnrollmentDto(await this.enrollRepo.create(userId, courseId));
}
```

## Kiểm quyền sở hữu (ownership)
Helper `assertCourseOwner(user, course)` trong service: `ADMIN` ⇒ pass (trừ **exam-stats**: dùng `assertCourseOwnerStrict`, không có ngoại lệ Admin — [[adr-013-exam-stats-owner-only]]); `TEACHER` ⇒ `course.teacherId === user.id`, nếu không `403 FORBIDDEN`.

## Transaction
`prisma.$transaction(async (tx) => …)`; repository nhận `tx` tùy chọn (`repo.create(data, tx?)`). Dùng cho: nộp bài (attempt + answers), sắp xếp lại `position`, xóa khóa.

## Gọi dịch vụ ngoài
- `lib/rag-client.ts`: axios/`fetch` + `AbortSignal.timeout(RAG_TIMEOUT_MS)`, gắn `X-Internal-Key`, ánh xạ lỗi → `AI_UNAVAILABLE`/`AI_TIMEOUT`.
- `lib/cloudinary.ts`: `uploadStream`, `destroy` (best-effort).
- Tất cả `async/await`; không chặn event loop (không đọc file đồng bộ).

## Job nền
`jobs/stuck-document-sweeper.ts` chạy mỗi 5 phút (`setInterval` khi khởi động) — [[concept-rag-ingestion]].

## Cấu hình
`config/env.ts` parse `process.env` bằng zod, **fail-fast** khi thiếu biến. Danh sách biến: [[architecture-deployment-env]].

## Tài liệu API
Sinh OpenAPI từ zod (`zod-to-openapi`) phục vụ Swagger UI ở `/api/docs` (dev). Nguồn sự thật vẫn là [[api-contracts]].
