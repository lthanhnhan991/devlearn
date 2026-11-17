import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCardSkeleton } from '@/components/client/AuthCardSkeleton';
import { AdminLoginView } from '@/components/admin/AdminLoginView';

export const metadata: Metadata = {
  title: 'Đăng nhập quản trị · DevLearn',
};

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-admin-navy px-6 py-10">
      <Suspense fallback={<AuthCardSkeleton tone="admin" />}>
        <AdminLoginView />
      </Suspense>
    </main>
  );
}
