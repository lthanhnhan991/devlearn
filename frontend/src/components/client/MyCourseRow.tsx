'use client';

import Link from 'next/link';
import { buttonStyles } from '@/components/ui/Button';
import type { MyCourseDto } from '@/types';

export interface MyCourseRowProps {
  item: MyCourseDto;
}

export function MyCourseRow({ item }: MyCourseRowProps) {
  const { course, progressPercent, resumeLessonId } = item;
  const safePercent = Math.min(100, Math.max(0, progressPercent));

  const learnHref = resumeLessonId
    ? `/learn/${course.id}/lessons/${resumeLessonId}`
    : `/courses/${course.id}`;

  const buttonText = safePercent === 0 ? 'Bắt đầu học' : 'Tiếp tục học';
  const customColor = course.topic.color ?? '#37474F';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        {/* Square Topic Badge */}
        <div
          className="flex size-14 flex-shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg shadow-sm"
          style={{ backgroundColor: customColor }}
        >
          {course.title.slice(0, 2).toUpperCase()}
        </div>

        {/* Course Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold"
              style={{ color: customColor }}
            >
              {course.topic.name}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">GV: {course.teacher.fullName}</span>
          </div>

          <Link
            href={`/courses/${course.id}`}
            className="block text-base font-bold text-slate-900 hover:text-client-primary truncate"
          >
            {course.title}
          </Link>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 w-32 sm:w-48 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-client-primary transition-all duration-300"
                style={{ width: `${safePercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600">
              Tiến độ {safePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0">
        <Link
          href={learnHref}
          className={buttonStyles({ variant: 'client-primary', size: 'md' })}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
