import { Suspense } from 'react';
import { AdminLessonsView } from './AdminLessonsView';

export const instant = false;

export default function AdminLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Đang tải giao diện soạn bài học…
        </div>
      }
    >
      <AdminLessonsView />
    </Suspense>
  );
}
