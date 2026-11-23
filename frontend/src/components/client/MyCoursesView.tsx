'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MyCourseRow } from '@/components/client/MyCourseRow';
import { LearningSummaryCard } from '@/components/client/LearningSummaryCard';
import { useAuth } from '@/features/auth/auth-context';
import { getMyCourses, getLearningSummary } from '@/services';
import type { MyCourseDto, LearningSummaryDto } from '@/types';
import { cn } from '@/lib/cn';

export function MyCoursesView() {
  const router = useRouter();
  const { status } = useAuth();

  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
  const [courses, setCourses] = useState<MyCourseDto[]>([]);
  const [summary, setSummary] = useState<LearningSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Bảo vệ route: khách chưa đăng nhập -> chuyển sang trang login
  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login?next=/my-courses');
    }
  }, [status, router]);

  async function loadData(tab: 'in-progress' | 'completed') {
    try {
      setLoading(true);
      const [coursesData, summaryData] = await Promise.all([
        getMyCourses(tab),
        getLearningSummary(),
      ]);
      setCourses(coursesData);
      setSummary(summaryData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadData(activeTab);
    }
  }, [activeTab, status]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          Đang nạp thông tin tài khoản…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Khóa học của tôi
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi lộ trình và tiến độ học tập các môn học đã đăng ký
        </p>
      </div>

      {/* Main Grid: Left Courses List & Right Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column (8 cols): Tabs & List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('in-progress')}
              className={cn(
                'px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                activeTab === 'in-progress'
                  ? 'border-client-primary text-client-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              Đang học {summary ? `(${summary.inProgressCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={cn(
                'px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                activeTab === 'completed'
                  ? 'border-client-primary text-client-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              Đã hoàn thành {summary ? `(${summary.completedCount})` : ''}
            </button>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              Đang tải danh sách khóa học…
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4">
              <p className="text-slate-500">
                {activeTab === 'in-progress'
                  ? 'Bạn chưa có khóa học nào đang học.'
                  : 'Bạn chưa hoàn thành khóa học nào.'}
              </p>
              <Link
                href="/courses"
                className="inline-block rounded-full bg-client-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-client-primary-hover transition-colors"
              >
                Khám phá khóa học
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((item) => (
                <MyCourseRow key={item.course.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Learning Summary Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <LearningSummaryCard summary={summary} />
        </aside>
      </div>
    </div>
  );
}
