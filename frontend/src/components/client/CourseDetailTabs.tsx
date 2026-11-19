'use client';

import { useState } from 'react';
import type { CourseDetailDto } from '@/types';
import { ModuleAccordion } from './ModuleAccordion';
import { cn } from '@/lib/cn';

export interface CourseDetailTabsProps {
  course: CourseDetailDto;
}

export function CourseDetailTabs({ course }: CourseDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('curriculum');

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            'border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-client-primary',
            activeTab === 'curriculum'
              ? 'border-client-primary text-client-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          Chương trình học ({course.moduleCount} module)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={cn(
            'border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-client-primary',
            activeTab === 'overview'
              ? 'border-client-primary text-client-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          Tổng quan
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'curriculum' && (
        <section aria-label="Chương trình học">
          <ModuleAccordion modules={course.modules} finalExam={course.finalExam} />
        </section>
      )}

      {activeTab === 'overview' && (
        <section aria-label="Tổng quan khóa học" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">Giới thiệu khóa học</h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {course.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-foreground">Bạn sẽ học được gì?</h4>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="text-client-primary">✓</span>
                <span>Nắm vững kiến thức nền tảng và tư duy lập trình cốt lõi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-client-primary">✓</span>
                <span>Thực hành qua các bài giảng video và tài liệu PDF chi tiết.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-client-primary">✓</span>
                <span>Làm bài kiểm tra trắc nghiệm củng cố kiến thức từng module.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-client-primary">✓</span>
                <span>Được trợ lý AI giải đáp thắc mắc tài liệu học tập 24/7.</span>
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
