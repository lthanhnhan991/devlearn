'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AuthCardSkeleton } from '@/components/client/AuthCardSkeleton';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/features/auth/auth-context';
import { getSafeNext } from '@/lib/safe-next';
import { AdminLoginForm } from './AdminLoginForm';

/**
 * A00 — thẻ trắng đăng nhập quản trị tại `/admin/login` (`?next=` phải nằm trong `/admin`).
 * Nhân viên đã đăng nhập thì chuyển thẳng vào khu quản trị; sinh viên vẫn thấy form để đổi tài khoản.
 * Phải đặt trong `<Suspense>` vì dùng `useSearchParams`.
 */
export function AdminLoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();

  const next = searchParams.get('next');
  const isStaff = status === 'authenticated' && user !== null && user.role !== 'STUDENT';

  useEffect(() => {
    if (isStaff) router.replace(getSafeNext(next, '/admin', '/admin'));
  }, [isStaff, next, router]);

  if (isStaff) return <AuthCardSkeleton tone="admin" />;

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-8 shadow-2xl">
      <div className="flex items-center">
        <Logo tone="admin" />
      </div>
      <h1 className="text-2xl font-bold text-admin-navy">Đăng nhập quản trị</h1>
      <AdminLoginForm />
    </div>
  );
}
