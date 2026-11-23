---
id: PROGRESS
title: PROGRESS — Nhật ký làm việc & bảng tiến độ phase
type: log
status: living
tags: [progress, log, memory]
related: [agent-rules, FILE_MAPPING, FILE_MAPPING_ADMIN, plan-00-overview, OPEN_QUESTIONS]
source: "Nhật ký"
updated: 2026-11-15
---
# PROGRESS

> Agent: thêm **một mục ngắn** lên đầu "Nhật ký" sau mỗi tác vụ ([[agent-rules]] §6). Không xóa mục cũ (các mục cũ nhắc mock/Review là lịch sử).

## Bảng tiến độ theo phase
Quy trình 3 bước ([[workflow-solo-dev]]): **Bước 1** DTO + UI + gọi API · **Bước 2** Backend (+DB) · **Bước 3** Tech Lead tự test.
| Phase | Nội dung | Bước 1 UI & Wire | Bước 2 Backend (+DB) | Bước 3 Test (Tech Lead) | Ghi chú |
|---|---|---|---|---|---|
| P00 | [[plan-phase-00-foundation]] | — | — | ✅ | Hoàn thành thực tế; spike Cloudinary/Gemini hoãn (Q-09/Q-10) |
| P01 | [[plan-phase-01-auth]] | ✅ | ✅ | ✅ | Hoàn tất — test DB thực tế thành công |
| P02 | [[plan-phase-02-course-catalog]] | ✅ | ✅ | ✅ | Hoàn tất toàn diện (P02 gốc + P02b topics + fix runtime) — test thực tế thành công |
| P03 | [[plan-phase-03-learning-progress]] | ✅ | ✅ | ✅ | Hoàn tất toàn diện — Tech Lead test thực tế thành công |
| P04 | [[plan-phase-04-admin-content]] | ✅ | ✅ | ⬜ | Đã hoàn thành UI & BE (A02, A03, Preview, upload Cloudinary), chờ Tech Lead test |
| P05 | [[plan-phase-05-exam-student]] | ⬜ | ⬜ | ⬜ | |
| P06 | [[plan-phase-06-exam-admin-stats]] | ⬜ | ⬜ | ⬜ | |
| P07 | [[plan-phase-07-rag-service]] | — | ⬜ | ⬜ | không có UI; spike Gemini trước |
| P08 | [[plan-phase-08-ai-chat-and-docs]] | ⬜ | ⬜ | ⬜ | |
| P09 | [[plan-phase-09-admin-dashboard-users]] | ⬜ | ⬜ | ⬜ | |
| P10 | [[plan-phase-10-hardening-release]] | — | — | ⬜ | |

Ký hiệu: ⬜ chưa · 🟡 đang làm · ✅ xong · ⛔ bị chặn (ghi lý do ở Ghi chú).

## Quyết định/nợ kỹ thuật đang mở
Xem [[OPEN_QUESTIONS]]. Ghi nợ kỹ thuật mới theo dạng `TD-xx: <mô tả> — <ảnh hưởng> — <đề xuất>`.

- TD-01: Cần xóa các file Mock và biến môi trường NEXT_PUBLIC_MOCK_FEATURES còn sót lại — ảnh hưởng: codebase dư thừa — đề xuất: chạy lệnh xóa thủ công

## Nhật ký (mới nhất trên cùng)

### 2026-11-23 · Hoàn thành UI & Backend Phase 04 (Quản lý khóa học & Soạn nội dung) · Agent
- **Tác vụ**: Triển khai trọn vẹn Phase 04 theo `plan-phase-04-admin-content.md` (phạm vi A02, A03, AD-03…AD-06, IN-09).
- **Đã làm**:
  - **DTO & Types**: Bổ sung `admin-course.ts`, `admin-content.ts` tại `backend/src/types/dto/` và `frontend/src/types/dto/`, export tại `index.ts`. Thêm mã lỗi `EXAM_HAS_ATTEMPTS`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`, `AI_UNAVAILABLE` tại `errors.ts`, enum `DOC_STATUSES` tại `constants.ts`.
  - **Backend & Cloudinary**:
    - Thư viện `cloudinary.ts`: Tích hợp upload stream / destroy file Cloudinary với chế độ giả lập graceful khi thiếu credentials (không làm crash app).
    - Middleware `upload.ts`: Giới hạn dung lượng (video ≤ 100 MB, PDF ≤ 10 MB) và MIME types qua multer ghi đĩa tạm.
    - Module Courses (`admin-courses.service.ts`, `controller`, `routes`): Danh sách khóa học (phân trang, lọc, tìm kiếm), tạo/sửa khóa học (kiểm tra `TOPIC_INACTIVE`), chuyển trạng thái xuất bản (kiểm tra `COURSE_NOT_READY` có ≥ 1 bài học xuất bản), xóa khóa học (chặn khi có học viên `COURSE_HAS_ENROLLMENTS`).
    - Module Content (`admin-content.service.ts`, `controller`, `routes`): Cấu trúc khóa học, CRUD module và reorder trong transaction (chặn xóa module có attempt bài thi `EXAM_HAS_ATTEMPTS`), CRUD bài học và reorder trong transaction, upload tệp bài học (tự động upsert `AiDocument` trạng thái `PENDING` khi upload PDF, cập nhật thời lượng video).
    - Gắn routers vào `app.ts` tại `/api/v1/admin/courses` và `/api/v1/admin`.
  - **Frontend Services**: `admin-course.http.ts` và `admin-content.http.ts` (upload tệp kèm báo cáo tiến trình phần trăm qua XHR).
  - **Frontend UI**:
    - Component `InfoBanner`: Banner xanh hiển thị liên kết "Quản lý nội dung hiển thị ở CLIENT · ...".
    - Màn A02 (`/admin/courses`): Bảng danh sách khóa học, tìm kiếm, lọc trạng thái, phân trang, chip chủ đề động (kèm chấm màu và nhãn `(đã ẩn)` nếu inactive), công tắc đổi trạng thái xuất bản, modal tạo/sửa khóa học (select chủ đề động), modal xác nhận xóa khóa học có cảnh báo chặn xóa khi đã có học viên.
    - Màn A03 (`/admin/lessons`): Dropdown chọn khóa học, cây cấu trúc `StructureTree` (thêm/sửa/xóa/đổi thứ tự module và bài học), form soạn bài `LessonForm` (tiêu đề, loại nội dung VIDEO/PDF, nhập link YouTube hoặc vùng kéo thả tải tệp Cloudinary có thanh tiến trình XHR, checkbox xuất bản bài học).
    - Màn Xem trước (`/admin/lessons/[lessonId]/preview`): Tái sử dụng `LessonViewer` cho phép Giảng viên/Quản trị viên xem trực tiếp nội dung video/PDF mà không cần ghi danh hay tính tiến độ học tập.
- **Tiếp theo**: Chờ Tech Lead chạy `./sync-types.sh`, `typecheck` và kiểm thử thủ công trên trình duyệt.

### 2026-11-23 · Chốt Phase 03 (Tiến độ học tập & Khóa học của tôi) · Agent & Tech Lead
- **Tác vụ**: Tech Lead hoàn tất kiểm thử thực tế toàn bộ Phase 03 (Màn C08 `/my-courses`, màn C05 `/learn/...`, tính tiến độ chuẩn hoá `computeProgress`, hoàn thành bài học idempotent, chặn khóa chưa đăng ký, sửa Instant Navigation Next.js 16).
- **Kết quả**: Toàn bộ checklist kiểm thử đã đạt [x]. Đóng Phase 03, sẵn sàng mở Phase 04 ([[plan-phase-04-admin-content]]).

### 2026-11-23 · Fix Instant Navigation Phase 03 · Agent
- **Tác vụ**: Sửa lỗi segment instant navigation tại `src/app/(learn)/learn/[courseId]/lessons/[lessonId]/page.tsx` và cấu trúc hóa Server Component + Client View cho Phase 03.
- **Đã làm**:
  - Chuyển `(learn)/learn/[courseId]/lessons/[lessonId]/page.tsx` thành Server Component có `export const instant = false;` và bọc `<Suspense>` xung quanh Client View `LearnLessonView`.
  - Tương tự, chuyển `(client)/my-courses/page.tsx` thành Server Component có `export const instant = false;` và bọc `<Suspense>` xung quanh Client View `MyCoursesView` (kèm logic bảo vệ auth chuyển hướng về `/login?next=`).
  - Giữ `export const instant = false;` ở `(learn)/layout.tsx` đảm bảo tính tương thích đồng bộ cho toàn bộ phân hệ học tập.

### 2026-11-23 · Fix Typecheck Progress Repository · Agent
- **Tác vụ**: Sửa lỗi kiểu `TS2353` tại `progress.repository.ts:173` do truy vấn model `Attempt` sai tên trường (`userId` → `studentId`).
- **Đã làm**: Cập nhật hàm `findUserAttempts` dùng đúng trường `where: { studentId }` theo đúng Prisma schema.

### 2026-11-22 · Phase 03 — Tiến độ học tập & Khóa học của tôi (C05 & C08) · Agent
- **Tác vụ**: Triển khai toàn bộ Phase 03 theo `plan-phase-03-learning-progress.md` (phạm vi C05 Giao diện học tập, C08 Khóa học của tôi, CL-07…CL-09).
- **Đã làm**:
  - **DTO & Types**: Bổ sung `dto/learning.ts` (`LearnStructureDto`, `LessonContentDto`, `CompleteResultDto`, `MyCourseDto`, `LearningSummaryDto`), cập nhật `constants.ts` (thêm `ContentType`, `ExamStatus`) và `labels.ts` (thêm `examStatus`). Đồng bộ types sang `frontend/src/types/`.
  - **Database & Seed**: Tận dụng model `LessonProgress` đã sẵn sàng trong `schema.prisma`. Cập nhật `seed.ts` để nạp dữ liệu tiến độ mẫu cho sinh viên Lê Thanh Nhàn (Python ~35%, PostgreSQL ~70%, Next.js 0%).
  - **Backend Modules**: Tạo `modules/progress` gồm repository, service (hàm `computeProgress` duy nhất chuẩn hoá phần trăm tiến độ và điểm tiếp tục học `resumeLessonId`), controller và router (`/courses/:courseId/learn`, `/lessons/:id`, `/lessons/:id/complete` idempotent, `/me/courses`, `/me/learning-summary`). Mount routers tại `app.ts`.
  - **Frontend Services & UI**:
    - `learning.http.ts`: Tạo trọn bộ API gọi backend.
    - Layout `(learn)`: Đặt `export const instant = false;` và bọc `StudentGuard`.
    - Màn C05 (`/learn/[courseId]/lessons/[lessonId]`): `LearnHeader` (logo, tên khóa, thanh tiến độ %, nút Thoát), `LessonSidebar` (danh sách module, tiến độ từng module, trạng thái bài học, hàng kiểm tra), `LessonViewer` (xem video Cloudinary/YouTube, xem PDF, trạng thái lỗi + Thử lại), các nút điều hướng Bài trước/Tiếp theo và nút Hoàn thành bài học kèm banner chúc mừng hoàn thành 100%.
    - Màn C08 (`/my-courses`): Tab Đang học / Đã hoàn thành, danh sách `MyCourseRow` (màu theo `topic.color`, tên, thanh tiến độ, nút Bắt đầu / Tiếp tục học) và thẻ `LearningSummaryCard` (tổng quan số lượng và điểm trung bình).

### 2026-11-22 · Chốt Phase 02 (Catalog, Enroll & Dynamic Topics P02b) · Agent & Tech Lead
- **Tác vụ**: Tech Lead hoàn tất kiểm thử thực tế toàn bộ Phase 02 (Client C02/C03/C04, luồng đăng ký học, chủ đề động topics P02b, màn A09 quản trị chủ đề `/admin/topics`). Đã vá sạch các lỗi runtime Next.js 16.4.6 (`UserMenu` hydration mismatch, instant navigation validation tại `/admin`).
- **Kết quả**: Tất cả checklist kiểm thử đã đạt [x]. Đóng Phase 02, sẵn sàng mở Phase 03 ([[plan-phase-03-learning-progress]]).

### 2026-11-22 · Fix Hydration & Instant Navigation Next.js 16.4.6 · Agent
- **Tác vụ**: Sửa lỗi hydration mismatch tại `UserMenu.tsx` khi tải trang chủ `/` và lỗi segment validation `instant navigation` tại segment `/admin` (`page.tsx` bị dropped).
- **Đã làm**:
  - Dùng cờ `mounted` kết hợp `status === 'loading'` trong `Navbar.tsx` (và `AdminShell.tsx`) đảm bảo HTML render từ SSR và lần hydrate đầu tiên ở Client đồng nhất 100%, không lệch DOM giữa skeleton và UserMenu/nút đăng nhập.
  - Bổ sung `suppressHydrationWarning` phòng vệ tại `UserMenu.tsx` và Topbar `AdminShell.tsx`.
  - Chuyển `admin/(panel)/layout.tsx` sang Server Component layout và khai báo `export const instant = false;` tập trung ở layout chung (đã gỡ ở `page.tsx`) theo chuẩn Next.js 16.4.6 để áp dụng cho toàn bộ nhánh phân hệ `/admin/(panel)` được bảo vệ bởi auth guard (`StaffGuard`).

### 2026-11-22 · Fix Typecheck Frontend Topics · Agent
- **Tác vụ**: Sửa lỗi kiểu `TS2379` (`exactOptionalPropertyTypes: true`) và `TS2322` (`ButtonProps` không nhận `className`) tại `frontend/src/app/admin/(panel)/topics/page.tsx`.
- **Đã làm**:
  - Bổ sung biến thể `'admin-danger'` chuẩn design system vào `ButtonVariant` và `VARIANT_CLASSES` tại `frontend/src/components/ui/Button.tsx`.
  - Cập nhật nút xóa trong modal xác nhận tại `topics/page.tsx` sang `variant="admin-danger"`, bỏ prop `className`.
  - Sửa `listAdminTopics(query ? { q: query } : undefined)` tương thích chuẩn `exactOptionalPropertyTypes: true`.

### 2026-11-22 · P02b & P04-Topics · Agent — Hoàn tất chuyển đổi Chủ đề động (ADR-018) cho Client & Quản trị Admin A09
- **Tác vụ**: Triển khai toàn diện chủ đề động (`topics`) cho Phase 02b (Client) và hoàn thành trước phân hệ Quản lý chủ đề A09 (Phase 04) theo các tài liệu ADR-018, concept-topics, api-catalog, api-admin-topics và bộ ảnh UI `ADMIN · 09..12`.
- **Đã làm**:
  - **DTO & Types**: Thêm `dto/topic.ts` (`TopicRefDto`, `TopicDto`), `dto/admin-topic.ts` (`AdminTopicDto`, `CreateTopicReq`, `UpdateTopicReq`, `ReorderTopicsReq`). Cập nhật `dto/catalog.ts` (`topic` chuyển sang `TopicRefDto`, query `topic` nhận mảng slug). Cập nhật `constants.ts` (thêm `TOPIC_ICON_KEYS`, `TOPIC_COLOR_REGEX`, bỏ `COURSE_TOPICS`), `labels.ts` (bỏ nhãn topic cứng), `errors.ts` (thêm các mã lỗi `TOPIC_*`), `seed-ids.ts` (thêm 5 UUID cố định). Đồng bộ types sang `frontend/src/types/`.
  - **Database & Migration & Seed**: Cập nhật `schema.prisma` (thêm model `Topic`, cập nhật `Course.topicId` tham chiếu `Topic` với `onDelete: Restrict`). Tạo migration `20261122000000_p02b_topics/migration.sql` kèm backfill SQL an toàn. Cập nhật `seed.ts` upsert 4 chủ đề hoạt động + 1 chủ đề ẩn mẫu và gán `topicId` cho các khóa học.
  - **Backend Modules**: Tạo `modules/topics` với repository, service (kèm helper `slugify`), controller và routes (hỗ trợ `GET /topics` công khai và các API quản trị `/admin/topics`). Cập nhật `modules/courses` lọc `topic` theo slug và mapper trả về `TopicRefDto`. Mount routers tại `app.ts`.
  - **Frontend Services & UI**:
    - `catalog.http.ts`: thêm `listTopics()`.
    - `admin-topic.http.ts`: tạo trọn bộ API quản trị chủ đề.
    - Client UI: `CourseCard`, `CourseInfoCard`, `CourseDetailPage` hiển thị tên và màu từ `topic.color`. `TopicTile` và trang chủ nạp chủ đề động từ `listTopics()`. `CourseFilterSidebar` lọc theo slug động kèm số lượng khóa học.
    - Admin UI: Thêm mục "Chủ đề" vào `AdminShell`. Xây dựng màn A09 `/admin/topics` (quản lý danh sách, tìm kiếm, đổi thứ tự sắp xếp, toggle hoạt động, modal thêm/sửa với palette màu và icon, modal xóa an toàn chống xóa chủ đề đang dùng).
- **Tiếp theo**: Bàn giao Tech Lead chạy `./sync-types.sh`, migrate/seed DB, typecheck và kiểm thử trên dev server.

### 2026-11-21 · KB · SA — Bổ sung chủ đề động (`topics`, ADR-018)
- **Tác vụ**: Đồng bộ KB với thiết kế mới: bảng `topics` + `courses.topic_id` (Đồ án bản `_1` §3.1) thay cho chủ đề cố định.
- **Đã làm**: thêm [[adr-018-dynamic-topics]], [[concept-topics]], [[api-admin-topics]], [[database-migration-topics]]; cập nhật ERD, Prisma schema, seed, hợp đồng API (66 endpoint công khai), UI (C02/C03/C08, màn A09), design system, ma trận quyền, [[delta-vs-thesis]], plan P02 (mục P02-T) và P04 (A09).
- **Ảnh hưởng tiến độ**: Phase 02 vẫn ✅ theo thiết kế cũ; phần điều chỉnh topics là việc mới **P02-T1…T10** ⬜ ([[plan-phase-02-course-catalog]]). Bảng tiến độ ở trên **không đổi**.
- **Lệch/Quyết định**: thêm Q-16 (quyền quản lý/xóa chủ đề), Q-17 (chủ đề ẩn: khóa có còn hiện không) ở [[OPEN_QUESTIONS]].
- **Tiếp theo**: P02-T (DTO → UI → http → Backend → DB `p02b_topics`).

### 2026-11-19 · Hoàn tất Phase 02 · Agent — Fix `usePathname()` Suspense & Đóng Phase 02 (Catalog & Enroll)
- **Tác vụ**: Xử lý cảnh báo `blocking-prerender-client-hook` (`usePathname()`) trong `Navbar` khi bật `cacheComponents` và chính thức hoàn tất Phase 02 sau khi Tech Lead test tay thành công.
- **Đã làm**:
  - **FE — Navbar & ClientShell**: Tách `NavLinks` (chứa `usePathname()`) ra khỏi root của `Navbar`, bọc trong `<Suspense fallback={<NavLinksFallback />}>`. Đồng thời bọc `<Navbar />` trong `<Suspense fallback={<NavbarShellFallback />}>` tại `ClientShell.tsx` để bảo vệ toàn bộ nhánh client routes.
  - **Rà soát hooks**: Đảm bảo toàn bộ các hook router/searchParams/pathname trong Phase 02 đều nằm an toàn bên trong `<Suspense>`.
  - **Tài liệu**: Đánh dấu hoàn thành toàn bộ checklist test tay trong `plan-phase-02-course-catalog.md`. Cập nhật `FILE_MAPPING.md` (CL-03..CL-06 chuyển sang `✅ Tested`). Đóng Phase 02, sẵn sàng bước sang Phase 03.
- **Tiếp theo**: Chờ lệnh của Tech Lead để bắt đầu Phase 03 (Màn học & Tiến độ - UC04).

### 2026-11-19 · Next.js 16 PPR Fix · Agent — Xử lý lỗi `blocking-prerender-dynamic` cho các trang Phase 02
- **Tác vụ**: Đóng gói các lệnh fetch dữ liệu động và `searchParams` vào bên trong các ranh giới `<Suspense fallback={...}>` theo đúng cơ chế Partial Prerendering (PPR / `cacheComponents: true`) của Next.js 16.
- **Đã làm**:
  - **FE — CourseSkeletons.tsx**: Tạo các component fallback chuẩn design system: `StatStripSkeleton`, `CourseCardSkeleton`, `CourseGridSkeleton`, `CourseCatalogGridSkeleton`, `CourseCatalogSkeleton`, `CourseDetailSkeleton`.
  - **FE — app/(client)/page.tsx (C02)**: Tách `StatStripData` và `PopularCoursesData` thành các async component độc lập, bọc trong `<Suspense>`, giúp shell trang chủ tĩnh được prerender trước và dữ liệu động stream vào.
  - **FE — app/(client)/courses/page.tsx (C03)**: Giữ layout và sidebar tĩnh; bọc toàn bộ phần tiêu thụ `searchParamsPromise` và `listCourses` trong `CoursesResults` với `<Suspense fallback={<CourseCatalogSkeleton />}>`.
  - **FE — app/(client)/courses/[courseId]/page.tsx (C04)**: Tách `CourseDetailContent` và bọc trong `<Suspense fallback={<CourseDetailSkeleton />}>`, giải quyết triệt để lỗi dynamic fetch chặn prerender.
- **Tiếp theo**: Tech Lead kiểm tra lại trên trình duyệt và `npm run dev`.

### 2026-11-19 · Phase 02 Fixes · Agent — Khắc phục lỗi Typecheck & Next.js cacheComponents
- **Tác vụ**: Sửa lỗi TS2379 tại backend và xung đột `force-dynamic` tại frontend theo phản hồi từ Tech Lead sau khi chạy migrate/seed DB.
- **Đã làm**:
  - **BE — courses.service.ts & courses.repository.ts**: Cập nhật `ListCoursesParams` và khai báo đối tượng tham số khớp `exactOptionalPropertyTypes: true`, chỉ gán thuộc tính khi khác `undefined`. Làm rõ kiểu `userId?: string | undefined` trong `getCourseDetail`. Rà soát các module `courses/`, `enrollments/`, `public/`.
  - **FE — App Routes (C02, C03, C04)**: Gỡ bỏ `export const dynamic = 'force-dynamic';` tại `(client)/page.tsx`, `(client)/courses/page.tsx`, `(client)/courses/[courseId]/page.tsx` để tương thích cấu hình `cacheComponents: true` (Next.js 16).
  - **FE — CourseFilterSidebar**: Bọc `<CourseFilterSidebar />` trong `<Suspense>` để đảm bảo Next.js client-side de-opt và streaming hoạt động trơn tru khi dùng `useSearchParams()`.
  - **Tài liệu**: Cập nhật hoàn thành mục chạy migrate/seed trong `plan-phase-02-course-catalog.md`.
- **Tiếp theo**: Tech Lead chạy lại typecheck và khởi động backend/frontend để kiểm thử chức năng.

### 2026-11-19 · Phase 02 · Agent — Danh mục khóa học & Ghi danh (UC03, UC04)
- **Tác vụ**: Hoàn thành Bước 1 (DTO + UI + Wire) và Bước 2 (Backend + DB) theo quy trình Solo Dev (`workflow-solo-dev.md`).
- **Đã làm**:
  - **DTO & Types**: Tạo `types/dto/catalog.ts` (`CourseCardDto`, `CourseDetailDto`, `PublicStatsDto`, `EnrollResultDto`, `ListCoursesQuery`), cập nhật `labels.ts`, `errors.ts`, `seed-ids.ts`.
  - **FE — Components & Pages**: Tạo `CourseCard`, `TopicTile`, `StatStrip`, `Pagination`, `CourseFilterSidebar`, `CourseInfoCard`, `ModuleAccordion`, `EnrollPanel`, `CourseDetailTabs`. Xây dựng C02 Trang chủ (`/`), C03 Danh mục khóa học (`/courses`), C04 Chi tiết khóa học (`/courses/[courseId]`).
  - **FE — Wire API**: Tạo `services/http/catalog.http.ts` (`getPublicStats`, `listCourses`, `getCourseDetail`, `enrollCourse`), re-export qua `services/index.ts`. Hỗ trợ envelope `{ data, meta }` trong `api-client.ts`.
  - **BE — Modules**: Xây dựng `modules/public` (`GET /public/stats` kèm cache 60s), `modules/courses` (`GET /courses`, `GET /courses/:id` bảo mật `fileUrl` và `optionalAuthenticate`), `modules/enrollments` (`POST /courses/:courseId/enroll`).
  - **BE — Database & Seed**: Cập nhật `prisma/seed.ts` với 6 khóa học `PUBLISHED` + 1 `DRAFT`, đầy đủ module, bài học, bài kiểm tra và dữ liệu ghi danh mẫu.
- **Tiếp theo**: Bàn giao Tech Lead chạy migrate, seed và kiểm thử Bước 3.

### 2026-11-19 · Cleanup · Agent — Dọn dẹp codebase chuyển sang quy trình Solo Dev
- **Tác vụ**: Xoá toàn bộ hạ tầng Mock, gộp thư mục middleware, dọn test sample, sửa typecheck errors.
- **Đã làm**:
  - **FE — Xoá Mock**: Xóa `frontend/src/services/mock/`, `frontend/src/mocks/fixtures/auth.ts`, `frontend/src/lib/mock.ts`.
  - **FE — services/index.ts**: Viết lại — chỉ export từ `./http/auth.http`; `authService = authHttp` trực tiếp, không còn phụ thuộc mock.
  - **FE — env**: Xóa dòng `NEXT_PUBLIC_MOCK_FEATURES` khỏi `frontend/.env.local` và `frontend/.env.example`.
  - **FE — Typecheck fix**: Sửa `src/lib/api-client.ts` — tách `body` khỏi spread để thoả `exactOptionalPropertyTypes`.
  - **BE — Middleware gộp**: Di chuyển `backend/src/middleware/error-handler.ts` vào `backend/src/middlewares/`; xóa thư mục `backend/src/middleware/` (số ít); cập nhật import trong `app.ts`.
  - **BE — Typecheck fix**: Sửa `backend/src/lib/jwt.ts` — tránh cast `expiresIn` thành `undefined` với `exactOptionalPropertyTypes`.
  - **FE — Test sample**: Xóa `frontend/src/__tests__/sample.test.tsx`.
  - **Kiểm tra**: `typecheck` frontend ✅ · `typecheck` backend ✅.
- **Lệch/Quyết định**: TD-01 đã xử lý xong, đóng nợ kỹ thuật.
- **Tiếp theo**: Phase 02 — Course Catalog.

### 2026-11-19 · KB · Tech Lead — Chuyển sang quy trình Solo Dev (ADR-017)
- **Tác vụ**: Bỏ Mock/Review; quy trình 3 bước (UI & Wire API → Backend → Tech Lead test). Agent không chạy lint/typecheck/test, không in code ra chat.
- **Đã làm**: cập nhật KB ([[workflow-solo-dev]], [[adr-017-solo-dev-workflow]]) và các file log/plan.
- **Lệch/Quyết định**: còn nợ TD-01 (dọn mock trong code).
- **Tiếp theo**: Phase 02.

### 2026-11-17 · P01 · Tech Lead — Đóng Phase 01 Auth (test DB thực tế thành công)
- **Tác vụ**: Đóng toàn bộ Phase 01 (A→B→C→D→E).
- **Đã làm**: Test thực tế với PostgreSQL: đăng ký, đăng nhập (CLIENT & ADMIN), đăng xuất, GET /auth/me; xác nhận đủ nhánh lỗi INVALID_CREDENTIALS, ACCOUNT_LOCKED, WRONG_PORTAL, EMAIL_TAKEN, STUDENT_CODE_TAKEN; cookie httpOnly devlearn_token đặt/xóa đúng; rate limit hoạt động.
- **Lệch/Quyết định**: Không.
- **Tiếp theo**: Phase 02 — Course Catalog (DTO → UI → gọi API → Backend → DB; Tech Lead test).

### 2026-11-17 · P01 · Giai đoạn A hoàn thành (UI + Mock Auth)
- **Tác vụ**: Sửa lỗi hiển thị Tailwind CSS, hoàn thiện ClientShell, Navbar, AdminShell, StaffGuard layout cho admin/(panel).
- **Đã làm**:
  - Khắc phục `@theme` Tailwind CSS v4 trong `globals.css`: bổ sung tokens và utility fallbacks cho các màu `client-primary`, `admin-navy`, `admin-primary`, v.v. Khớp 100% thiết kế giao diện (chia đôi màn hình client `/login`, full navy cho admin `/admin/login`).
  - Tạo `Navbar` và `ClientShell` (`(client)/layout.tsx`) tích hợp `UserMenu`, tìm kiếm, trạng thái phiên đăng nhập.
  - Tạo `AdminShell` (Sidebar navy + Topbar) và layout `app/admin/(panel)/layout.tsx` bảo vệ bởi `StaffGuard`.
  - Hoàn thành đầy đủ các task P01-A1 đến P01-A6 trong `plan-phase-01-auth.md`.
- **Lệch/Quyết định**: Không
- **Tiếp theo**: Giai đoạn B (Review gate C01, A00) & Giai đoạn C (Wire).

### 2026-11-16 · P00 · Agent: Kilo — Design tokens + spikes
- **Tác vụ**: P00-FE9..FE14 design tokens & _design; spikes P00-BE20/BE21
- **Đã làm**: thêm @theme client/admin colors; trang _design cơ bản. Spikes bỏ qua vì chưa có API key Cloudinary/Gemini (Q-09/Q-10 vẫn mở).
- **Lệch/Quyết định**: không
- **Tiếp theo**: Phase 01

### 2026-11-16 · P00 · Agent: Kilo — Nhóm B Frontend setup
- **Tác vụ**: P00-FE1..FE14 setup frontend
- **Đã làm**: create-next-app (TS/Tailwind/src/App Router), cài zod/vitest/jsdom/testing-library, tsconfig strict, vitest.config.ts, .env.local/.env.example, sync-types.sh copy types, sample test pass.
- **Types**: sync-types --check ✅
- **Kiểm tra**: typecheck ✅ · test ✅
- **Lệch/Quyết định**: không
- **Tiếp theo**: Review gate (spikes Cloudinary/Gemini) & design tokens

### 2026-11-16 · P00 · Agent: Kilo — A2 migration init
- **Tác vụ**: P00-BE9/B10 migration init (sau quyết định Q-15 Phương án B)
- **Đã làm**: xóa prisma.config.ts, xóa src/generated, viết schema.prisma theo KB (enum multiline), chạy `npx prisma migrate dev --name init` thành công — DB devlearn tạo, migration 20261116155447_init applied, Prisma Client generated. Seed chưa có (P00-BE11 sẽ tạo).
- **Lệch/Quyết định**: seed.ts chưa tồn tại (dự kiến).
- **Tiếp theo**: A3 types + A4 Express frame.

### 2026-11-16 · P00 · Agent: Kilo — A2 Prisma init
- **Tác vụ**: P00-BE8 npx prisma init
- **Đã làm**: sinh prisma/schema.prisma + prisma.config.ts. Phát hiện Q-15: generator `prisma-client` (output ../src/generated/prisma) và prisma.config.ts (Prisma 6.19).
- **Lệch/Quyết định**: DỪNG theo P00-BE8/Q-15. Chưa ghép schema. Cần người dùng quyết định cách xử lý (ghim cú pháp Prisma 6 classic vs nâng cấp).
- **Tiếp theo**: chờ chỉ thị người dùng

### 2026-11-16 · P00 · Agent: Kilo — Nhóm A A1 khung backend
- **Tác vụ**: P00-BE1..BE7 khung backend (package.json, tsconfig, eslint, prettier, .env, env.ts)
- **Đã làm**: backend/package.json (scripts), tsconfig strict, eslint.config.js, .prettierrc, .env/.env.test/.env.example, src/config/env.ts (zod fail-fast); npm install runtime+dev; approve install scripts prisma/esbuild.
- **File**: backend/package.json (+), backend/tsconfig.json (+), backend/eslint.config.js (+), backend/.prettierrc (+), backend/.env* (+), backend/src/config/env.ts (+)
- **Types**: không đụng types
- **Kiểm tra**: npm install ✅ (0 vuln runtime, 10 vuln dev)
- **Lệch/Quyết định**: không
- **Tiếp theo**: A2 Prisma (npx prisma init) — cần xin phép chạy lệnh

### 2026-11-15 · KB · SA — CHUYỂN SANG QUY TRÌNH SOLO DEV (ADR-017)
- **Tác vụ**: Viết lại KB theo hướng tinh gọn cho Solo Dev sau khi Tech Lead hoàn thành Phase 01 (UI → Backend → DB thật).
- **Đã làm**: bỏ mock (xóa `adr-015`, mọi tài liệu mock); `workflow-ui-mock-wire-backend` → `workflow-solo-dev` (3 bước); thêm ADR-017; viết lại `agent-rules` (mục "Quy tắc giao tiếp", cấm Agent chạy lint/typecheck/test, không viết file test), `definition-of-done`, `testing-strategy`, `git-workflow`, `plan-00-overview`, phase 00–10; cập nhật `architecture-frontend`, `architecture-deployment-env`, tài liệu DB (migrate dần theo phase), FILE_MAPPING ×2, PROGRESS.
- **Trạng thái**: P00 + P01 ghi ✅ theo báo cáo của Tech Lead (**SA chưa đối chiếu mã nguồn**). DB thực tế mới có `User` (+ enum `Role`, `UserStatus`); các bảng còn lại thêm theo phase ([[database-erd]]).
- **Việc dọn**: xóa `frontend/src/services/mock/`, `frontend/src/mocks/`, biến `NEXT_PUBLIC_MOCK_FEATURES` ([[plan-00-overview]]).
- **Tiếp theo**: Phase 02 — Danh mục & ghi danh ([[plan-phase-02-course-catalog]]).

### 2026-11-15 · KB · Agent: Claude (System Architect) — ĐƠN GIẢN HÓA CÔNG CỤ (ADR-016)
- **Tác vụ**: Viết lại KB theo cấu trúc mới sau khi chủ dự án thử Phase 00: chỉ `npm`, 3 thư mục độc lập `backend/` `frontend/` `rag-service/` + `docs/`; bỏ pnpm, monorepo, `packages/contracts`, Docker.
- **Đã làm**: ADR-016 mới; ADR-014 → `superseded`; viết lại `architecture-repo-structure`, `architecture-deployment-env`, `plan-phase-00-foundation`, `agent-rules` (mục 2b), `workflow-ui-mock-wire-backend`, `definition-of-done`, `testing-strategy`, `git-workflow`, `FILE_MAPPING` ×2; thêm `tools/sync-types.sh`; vá đường dẫn/lệnh ở các file còn lại.
- **Types**: nguồn `backend/src/types/` → `./sync-types.sh` → bản copy `frontend/src/types/` (luật S1–S8 ở [[agent-rules]]).
- **Lệch/Quyết định**: thêm Q-14 (PostgreSQL local hay đám mây), Q-15 (phiên bản Prisma). Backend import tương đối (không alias); hash mật khẩu dùng `bcryptjs`; `frontend/.env.local` thay `frontend/.env`; bỏ husky/CI khỏi Phase 00 (tùy chọn Phase 10).
- **Tiếp theo**: làm lại Phase 00 theo [[plan-phase-00-foundation]] (Bước 0 → Nhóm A → Nhóm B).

### 2026-11-15 · KB · Agent: Claude (System Architect)
- **Tác vụ**: Khởi tạo Knowledge Base DevLearn từ Đồ án chuyên ngành (Chương 1–3), 19 màn thiết kế UI và 10 sơ đồ drawio.
- **Đã làm**: tạo 7 thư mục KB; 13 concept; kiến trúc, ERD + Prisma schema, hợp đồng API (60 endpoint công khai + 5 nội bộ + 1 callback); 15 ADR; luật code/agent; kế hoạch 11 phase.
- **Lệch/Quyết định**: ghi ở [[delta-vs-thesis]] (mâu thuẫn trong Đồ án, bổ sung schema, giả định, khoảng trống UI). Các câu hỏi cần người phụ trách xác nhận: [[OPEN_QUESTIONS]].
- **Tiếp theo**: P00 Foundation — bắt đầu bằng spike Cloudinary PDF + Gemini model name.
