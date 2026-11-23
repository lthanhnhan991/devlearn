import { Suspense } from 'react';
import { MyCoursesView } from '@/components/client/MyCoursesView';

export const instant = false;

export default function MyCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            Đang tải dữ liệu khóa học…
          </div>
        </div>
      }
    >
      <MyCoursesView />
    </Suspense>
  );
}
