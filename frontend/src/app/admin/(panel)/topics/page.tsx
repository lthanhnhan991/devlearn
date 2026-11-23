import { Suspense } from 'react';
import { AdminTopicsView } from './AdminTopicsView';

export const instant = false;

export default function AdminTopicsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-slate-400">
          <p className="text-sm">Đang tải danh sách chủ đề…</p>
        </div>
      }
    >
      <AdminTopicsView />
    </Suspense>
  );
}
