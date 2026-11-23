'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { LearnStructureDto } from '@/types';

export interface LessonSidebarProps {
  courseId: string;
  currentLessonId: string;
  structure: LearnStructureDto;
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LessonSidebar({
  courseId,
  currentLessonId,
  structure,
}: LessonSidebarProps) {
  // Mặc định mở tất cả các module
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of structure.modules) {
      initial[m.id] = true;
    }
    return initial;
  });

  function toggleModule(moduleId: string) {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  }

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Nội dung khóa học
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {structure.modules.map((m, mIdx) => {
          const isOpen = openModules[m.id] ?? true;

          return (
            <div key={m.id} className="overflow-hidden">
              {/* Module Header Button */}
              <button
                type="button"
                onClick={() => toggleModule(m.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Module {mIdx + 1} · {m.completedCount}/{m.totalCount} bài
                  </p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1 mt-0.5">
                    {m.title}
                  </p>
                </div>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'size-4 text-slate-400 transition-transform flex-shrink-0',
                    isOpen && 'rotate-180',
                  )}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Lessons inside Module */}
              {isOpen && (
                <div className="bg-slate-50/50 pb-2">
                  {m.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${courseId}/lessons/${lesson.id}`}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-xs transition-colors',
                          isCurrent
                            ? 'bg-emerald-50 text-client-primary font-semibold border-l-4 border-client-primary pl-3'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                        )}
                      >
                        {/* Status Icon */}
                        {lesson.isCompleted ? (
                          <span
                            className="flex size-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                            title="Đã hoàn thành"
                          >
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className="size-4 flex-shrink-0 rounded-full border border-slate-300"
                            title="Chưa hoàn thành"
                          />
                        )}

                        {/* Title & Duration */}
                        <span className="flex-1 truncate">{lesson.title}</span>

                        {lesson.durationSeconds ? (
                          <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                            {formatDuration(lesson.durationSeconds)}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}

                  {/* Module Exam (Gap G-08) */}
                  {m.exam ? (
                    <div className="mx-4 my-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                          <span>📝</span> {m.exam.title}
                        </span>
                        <span className="text-[11px] text-amber-700">{m.exam.durationMinutes}p</span>
                      </div>
                      <p className="text-[11px] text-amber-700 mt-1">
                        {m.exam.questionCount} câu hỏi trắc nghiệm · Đạt: {m.exam.passScore}/10
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        {/* Final Exam */}
        {structure.finalExam ? (
          <div className="p-4">
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <span>🏆</span> {structure.finalExam.title}
                </span>
                <span className="text-[11px] text-emerald-700">{structure.finalExam.durationMinutes}p</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                {structure.finalExam.questionCount} câu hỏi · Đạt: {structure.finalExam.passScore}/10
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
