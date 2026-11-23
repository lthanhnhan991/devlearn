'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

export interface LearnHeaderProps {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
}

export function LearnHeader({
  courseId,
  courseTitle,
  progressPercent,
}: LearnHeaderProps) {
  const safePercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left: Logo & Course Title */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/"
          aria-label="DevLearn Trang chủ"
          className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-primary"
        >
          <Logo tone="client" />
        </Link>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        <h1 className="truncate text-sm sm:text-base font-semibold text-slate-800" title={courseTitle}>
          {courseTitle}
        </h1>
      </div>

      {/* Right: Progress bar & Exit Button */}
      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-medium text-slate-500">Tiến độ</span>
            <span className="ml-1.5 text-xs font-bold text-client-primary">{safePercent}%</span>
          </div>

          <div className="h-2 w-20 sm:w-32 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-client-primary transition-all duration-300"
              style={{ width: `${safePercent}%` }}
            />
          </div>
        </div>

        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-client-primary"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Thoát
        </Link>
      </div>
    </header>
  );
}
