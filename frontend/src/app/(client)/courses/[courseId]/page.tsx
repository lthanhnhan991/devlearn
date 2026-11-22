import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourseInfoCard } from '@/components/client/CourseInfoCard';
import { EnrollPanel } from '@/components/client/EnrollPanel';
import { CourseDetailTabs } from '@/components/client/CourseDetailTabs';
import { CourseDetailSkeleton } from '@/components/client/CourseSkeletons';
import { getCourseDetail } from '@/services';
import { LABELS } from '@/types';
import type { CourseDetailDto } from '@/types';

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

async function CourseDetailContent({
  paramsPromise,
}: {
  paramsPromise: PageProps['params'];
}) {
  const { courseId } = await paramsPromise;

  let course: CourseDetailDto | null = null;
  try {
    course = await getCourseDetail(courseId);
  } catch {
    notFound();
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-client-primary">
          Trang chủ
        </Link>
        <span>›</span>
        <Link href="/courses" className="hover:text-client-primary">
          Danh mục khóa học
        </Link>
        <span>›</span>
        <span className="font-semibold text-slate-800 line-clamp-1">{course.title}</span>
      </nav>

      {/* Course Header Banner */}
      <div className="mb-10 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Khoa CNTT · Khóa học
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-client-primary">
            {course.topic.name}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {course.title}
        </h1>

        <p className="max-w-3xl text-base text-slate-600">
          {course.description}
        </p>

        <p className="text-sm font-medium text-slate-700 pt-1">
          Giảng viên phụ trách: <span className="font-bold text-foreground">{course.teacher.fullName}</span>
        </p>
      </div>

      {/* Main Grid: Left Tabs & Right Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left (8 cols): Tabs (Curriculum & Overview) */}
        <div className="lg:col-span-8">
          <CourseDetailTabs course={course} />
        </div>

        {/* Right (4 cols): Sticky Sidebar with Enroll & Info */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
          <EnrollPanel
            courseId={course.id}
            enrollmentCount={course.enrollmentCount}
            initialEnrollment={course.enrollment}
          />
          <CourseInfoCard course={course} />
        </aside>
      </div>
    </div>
  );
}

export default function CourseDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetailContent paramsPromise={props.params} />
    </Suspense>
  );
}
