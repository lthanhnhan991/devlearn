import { Suspense } from 'react';
import { AdminCoursesView } from './AdminCoursesView';

export const instant = false;

export default function AdminCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-slate-400">
          <p className="text-sm">Đang tải danh sách khóa học…</p>
        </div>
      }
    >
      <AdminCoursesView />
    </Suspense>
  );
}
