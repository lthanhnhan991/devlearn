import Link from 'next/link';
import type { CourseCardDto } from '@/types';
import { LABELS } from '@/types';
import { cn } from '@/lib/cn';

export interface CourseCardProps {
  course: CourseCardDto;
}

const TOPIC_BANNER_BG: Record<string, string> = {
  PROGRAMMING: 'bg-[#1D5E8C]',
  DATABASE: 'bg-[#37474F]',
  WEB: 'bg-[#00796B]',
  SOFTWARE_ENGINEERING: 'bg-[#4A148C]',
};

export function CourseCard({ course }: CourseCardProps) {
  const bgClass = TOPIC_BANNER_BG[course.topic] ?? 'bg-client-primary';
  const durationText =
    course.totalDurationMinutes >= 60
      ? `${Math.round(course.totalDurationMinutes / 60)} giờ`
      : `${course.totalDurationMinutes} phút`;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Banner top */}
      <div className={cn('relative flex h-36 w-full items-start p-4', bgClass)}>
        <span className="rounded bg-white/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-800 shadow-sm">
          {LABELS.level[course.level] ?? course.level}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {LABELS.topic[course.topic] ?? course.topic}
          </span>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-client-primary">
            {course.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600">GV: {course.teacher.fullName}</p>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>{course.lessonCount} bài học</span>
          <span>·</span>
          <span>{durationText}</span>
          <span>·</span>
          <span>{course.enrollmentCount} học viên</span>
        </div>
      </div>
    </Link>
  );
}
