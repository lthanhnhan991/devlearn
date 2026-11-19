import Link from 'next/link';
import { buttonStyles } from '@/components/ui/Button';
import { StatStrip } from '@/components/client/StatStrip';
import { TopicTile } from '@/components/client/TopicTile';
import { CourseCard } from '@/components/client/CourseCard';
import { getPublicStats, listCourses } from '@/services';
import type { CourseCardDto, CourseTopic, PublicStatsDto } from '@/types';

export const dynamic = 'force-dynamic';

const FEATURED_TOPICS: { topic: CourseTopic; description: string }[] = [
  { topic: 'PROGRAMMING', description: 'Python, Java, thuật toán và cấu trúc dữ liệu' },
  { topic: 'DATABASE', description: 'SQL, PostgreSQL, thiết kế cơ sở dữ liệu' },
  { topic: 'WEB', description: 'HTML/CSS, JavaScript, Next.js hiện đại' },
  { topic: 'SOFTWARE_ENGINEERING', description: 'Kiểm thử, Git, quy trình phát triển phần mềm' },
];

export default async function HomePage() {
  let stats: PublicStatsDto | null = null;
  let popularCourses: CourseCardDto[] = [];

  try {
    stats = await getPublicStats();
  } catch {
    // Bỏ qua lỗi kết nối khi SSR
  }

  try {
    const res = await listCourses({ sort: 'popular', pageSize: 4 });
    popularCourses = res.data ?? [];
  } catch {
    // Bỏ qua lỗi kết nối khi SSR
  }

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Nền tảng học tập Khoa CNTT
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Xây kỹ năng.{' '}
              <span className="text-client-primary">Xây tương lai.</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Khóa học lập trình, cơ sở dữ liệu và công nghệ phần mềm của Khoa CNTT, học theo tốc độ
              của bạn cùng trợ lý AI thông minh.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/courses"
                className={buttonStyles({ variant: 'client-primary', size: 'lg' })}
              >
                Khám phá khóa học
              </Link>
              <Link
                href="/ai"
                className={buttonStyles({ variant: 'client-outline', size: 'lg' })}
              >
                Trợ lý AI
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Visual card placeholder */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="size-3 rounded-full bg-rose-400" />
                <div className="size-3 rounded-full bg-amber-400" />
                <div className="size-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-auto">devlearn.edu.vn</span>
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs text-slate-700">
                <p className="text-client-primary font-semibold">// Trợ lý AI học tập</p>
                <p className="rounded bg-slate-50 p-2.5 text-slate-600">
                  &gt; def solve_problem(student):<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;skills = learn_by_doing()<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;return skills.level_up()
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800 font-sans">
                  <span>💡</span>
                  <span className="text-xs font-medium">Hỏi AI về tài liệu và bài giảng 24/7!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Container chung cho các section nội dung */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6">
        {/* StatStrip */}
        <section aria-label="Thống kê hệ thống">
          <StatStrip stats={stats} />
        </section>

        {/* Chủ đề nổi bật */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Chủ đề nổi bật
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lộ trình học theo từng chuyên ngành cốt lõi
              </p>
            </div>
            <Link
              href="/courses"
              className="text-sm font-semibold text-client-primary hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_TOPICS.map((item) => (
              <TopicTile
                key={item.topic}
                topic={item.topic}
                description={item.description}
              />
            ))}
          </div>
        </section>

        {/* Khóa học phổ biến */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Khóa học phổ biến
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Được nhiều sinh viên Khoa CNTT đăng ký nhất
              </p>
            </div>
            <Link
              href="/courses?sort=popular"
              className="text-sm font-semibold text-client-primary hover:underline"
            >
              Xem tất cả ({popularCourses.length}) →
            </Link>
          </div>

          {popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <p>Chưa có khóa học nào được xuất bản.</p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Link
              href="/courses"
              className={buttonStyles({ variant: 'client-outline', size: 'lg' })}
            >
              Xem tất cả khóa học
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          <p>© 2026 DevLearn — Khoa Công nghệ Thông tin.</p>
          <p className="mt-1 text-xs text-slate-400">
            Hệ thống đào tạo trực tuyến và trợ lý AI cho sinh viên ngành CNTT.
          </p>
        </div>
      </footer>
    </div>
  );
}
