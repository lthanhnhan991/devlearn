'use client';

import { useState } from 'react';
import type { CourseModuleDetailDto, CourseExamOutlineDto } from '@/types';
import { cn } from '@/lib/cn';

export interface ModuleAccordionProps {
  modules: CourseModuleDetailDto[];
  finalExam?: CourseExamOutlineDto | null;
}

export function ModuleAccordion({ modules, finalExam }: ModuleAccordionProps) {
  // Mặc định mở module đầu tiên
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (modules.length > 0 && modules[0]) {
      initial[modules[0].id] = true;
    }
    return initial;
  });

  function toggleModule(id: string) {
    setOpenModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="space-y-4">
      {modules.map((mod, index) => {
        const isOpen = openModules[mod.id] ?? false;
        const examCount = mod.exam ? 1 : 0;

        return (
          <div
            key={mod.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Header Module */}
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left transition-colors hover:bg-slate-100/80"
              aria-expanded={isOpen}
            >
              <div>
                <h4 className="font-bold text-foreground">
                  Module {index + 1}: {mod.title}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  {mod.lessons.length} bài học {examCount > 0 && `· ${examCount} bài kiểm tra`}
                </p>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn(
                  'size-5 text-slate-500 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Danh sách bài học & bài kiểm tra */}
            {isOpen && (
              <div className="divide-y divide-slate-100 border-t border-slate-200">
                {mod.lessons.map((lesson, lIdx) => {
                  const duration = lesson.durationSeconds
                    ? `${Math.round(lesson.durationSeconds / 60)} phút`
                    : null;

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                          {lesson.contentType === 'VIDEO' ? '▶' : '📄'}
                        </span>
                        <span className="font-medium text-slate-800">
                          Bài {lIdx + 1}: {lesson.title}
                        </span>
                      </div>
                      {duration && <span className="text-xs text-slate-500">{duration}</span>}
                    </div>
                  );
                })}

                {/* Hàng bài kiểm tra Module (Gap G-08) */}
                {mod.exam && (
                  <div className="flex items-center justify-between bg-emerald-50/40 px-5 py-3 text-sm font-semibold text-client-primary">
                    <div className="flex items-center gap-3">
                      <span>📝</span>
                      <span>{mod.exam.title}</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-800">
                      {mod.exam.durationMinutes} phút · {mod.exam.questionCount} câu
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bài kiểm tra cuối khóa (nếu có) */}
      {finalExam && (
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-amber-900">
              <span className="text-xl">🏆</span>
              <div>
                <h4>{finalExam.title}</h4>
                <p className="text-xs font-normal text-amber-700">
                  Bài kiểm tra tổng hợp toàn khóa học
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {finalExam.durationMinutes} phút · {finalExam.questionCount} câu
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
