import Link from 'next/link';
import { CourseFilterSidebar } from '@/components/client/CourseFilterSidebar';
import { CourseCard } from '@/components/client/CourseCard';
import { Pagination } from '@/components/ui/Pagination';
import { listCourses } from '@/services';
import type { CourseCardDto } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string | string[];
    level?: string | string[];
    sort?: 'newest' | 'popular';
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CoursesPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const q = searchParams.q;
  const sort = searchParams.sort ?? 'newest';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 12;

  let courses: CourseCardDto[] = [];
  let totalPages = 1;
  let total = 0;

  try {
    const res = await listCourses({
      q,
      topic: searchParams.topic,
      level: searchParams.level,
      sort,
      page,
      pageSize,
    });
    courses = res.data ?? [];
    totalPages = res.meta?.totalPages ?? 1;
    total = res.meta?.total ?? 0;
  } catch {
    // Xử lý lỗi kết nối
  }

  function createPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);

    if (searchParams.topic) {
      const topics = Array.isArray(searchParams.topic)
        ? searchParams.topic
        : [searchParams.topic];
      topics.forEach((t) => params.append('topic', t));
    }

    if (searchParams.level) {
      const levels = Array.isArray(searchParams.level)
        ? searchParams.level
        : [searchParams.level];
      levels.forEach((l) => params.append('level', l));
    }

    params.set('page', targetPage.toString());
    return `/courses?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-client-primary">
          Trang chủ
        </Link>
        <span>›</span>
        <span className="font-semibold text-slate-800">Danh mục khóa học</span>
      </nav>

      {/* Header & Search */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Danh mục khóa học</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hiển thị {courses.length} / {total} khóa học phù hợp
          </p>
        </div>

        {/* Thanh tìm kiếm & Sắp xếp */}
        <form method="GET" action="/courses" className="flex items-center gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên khóa học…"
            className="h-10 w-56 rounded-lg border border-slate-300 bg-white px-3.5 text-sm placeholder:text-slate-400 focus-visible:border-client-primary focus-visible:outline-none sm:w-64"
          />
          <select
            name="sort"
            defaultValue={sort}
            aria-label="Sắp xếp khóa học"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus-visible:border-client-primary focus-visible:outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-lg bg-client-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-client-primary-hover"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Main Layout: Sidebar + Course Grid */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Bộ lọc Sidebar */}
        <CourseFilterSidebar />

        {/* Lưới khóa học */}
        <main className="flex-1">
          {courses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Phân trang */}
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  createPageUrl={createPageUrl}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Không có khóa học phù hợp
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn một số bộ lọc chủ đề/cấp độ.
              </p>
              <Link
                href="/courses"
                className="mt-6 rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Xóa tất cả bộ lọc
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
