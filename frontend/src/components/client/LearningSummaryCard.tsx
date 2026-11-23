'use client';

import type { LearningSummaryDto } from '@/types';

export interface LearningSummaryCardProps {
  summary: LearningSummaryDto | null;
}

export function LearningSummaryCard({ summary }: LearningSummaryCardProps) {
  const inProgress = summary?.inProgressCount ?? 0;
  const completed = summary?.completedCount ?? 0;
  const avgScore = summary?.averageExamScore !== null && summary?.averageExamScore !== undefined
    ? `${summary.averageExamScore}/10`
    : '—';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900">
        Tổng quan học tập
      </h3>

      <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-slate-600">Khóa đang học</span>
          <strong className="text-base font-bold text-client-primary">{inProgress}</strong>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-slate-600">Khóa hoàn thành</span>
          <strong className="text-base font-bold text-emerald-700">{completed}</strong>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-slate-600">Điểm kiểm tra trung bình</span>
          <strong className="text-base font-bold text-slate-800">{avgScore}</strong>
        </div>
      </div>
    </div>
  );
}
