'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { COURSE_LEVELS, LABELS } from '@/types';
import type { TopicDto } from '@/types';
import { listTopics } from '@/services';

export interface CourseFilterSidebarProps {
  initialTopics?: TopicDto[];
}

export function CourseFilterSidebar({ initialTopics }: CourseFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<TopicDto[]>(initialTopics ?? []);

  useEffect(() => {
    if (initialTopics && initialTopics.length > 0) return;
    let cancelled = false;
    listTopics()
      .then((data) => {
        if (!cancelled) setTopics(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialTopics]);

  const selectedTopics = searchParams.getAll('topic');
  const selectedLevels = searchParams.getAll('level');

  function handleFilterChange(key: 'topic' | 'level', value: string, checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);

    let nextValues: string[];
    if (checked) {
      nextValues = [...currentValues, value];
    } else {
      nextValues = currentValues.filter((v) => v !== value);
    }

    params.delete(key);
    nextValues.forEach((v) => params.append(key, v));
    params.set('page', '1'); // Đổi bộ lọc luôn reset về trang 1

    const query = params.toString();
    router.push(query ? `/courses?${query}` : '/courses');
  }

  function handleReset() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('topic');
    params.delete('level');
    params.set('page', '1');
    const query = params.toString();
    router.push(query ? `/courses?${query}` : '/courses');
  }

  const hasFilter = selectedTopics.length > 0 || selectedLevels.length > 0;

  return (
    <aside className="w-full space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:w-64">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-foreground">Bộ lọc khóa học</h2>
        {hasFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-client-primary hover:underline"
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* Nhóm Chủ đề */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Chủ đề</h3>
        <div className="space-y-2">
          {topics.length > 0 ? (
            topics.map((topic) => {
              const isChecked = selectedTopics.includes(topic.slug);
              return (
                <label
                  key={topic.id}
                  className="flex cursor-pointer items-center justify-between text-sm text-slate-700 hover:text-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleFilterChange('topic', topic.slug, e.target.checked)}
                      className="size-4 rounded border-slate-300 text-client-primary focus:ring-client-primary"
                    />
                    <span>{topic.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">({topic.courseCount})</span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">Đang tải chủ đề…</p>
          )}
        </div>
      </div>

      {/* Nhóm Cấp độ */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-800">Cấp độ</h3>
        <div className="space-y-2">
          {COURSE_LEVELS.map((level) => {
            const isChecked = selectedLevels.includes(level);
            return (
              <label
                key={level}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleFilterChange('level', level, e.target.checked)}
                  className="size-4 rounded border-slate-300 text-client-primary focus:ring-client-primary"
                />
                <span>{LABELS.level[level] ?? level}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
