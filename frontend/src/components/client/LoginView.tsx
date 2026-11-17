'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, panelId, tabId } from '@/components/ui/Tabs';
import { useAuth } from '@/features/auth/auth-context';
import { getSafeNext } from '@/lib/safe-next';
import { AuthCardSkeleton } from './AuthCardSkeleton';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const TAB_PREFIX = 'auth';
const TABS = [
  { id: 'login', label: 'Đăng nhập' },
  { id: 'register', label: 'Đăng ký' },
] as const;

/**
 * C01 — thẻ Đăng nhập/Đăng ký tại `/login` (`?tab=register`, `?next=`).
 * Đã đăng nhập (kể cả vừa đăng nhập/đăng ký xong) thì chuyển tới `next` an toàn hoặc `/`.
 * Phải đặt trong `<Suspense>` vì dùng `useSearchParams`.
 */
export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();

  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const next = searchParams.get('next');

  useEffect(() => {
    if (status !== 'authenticated' || user === null) return;
    router.replace(user.role === 'STUDENT' ? getSafeNext(next, '/') : '/admin');
  }, [status, user, next, router]);

  function handleTabChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'register') {
      params.set('tab', 'register');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(query.length > 0 ? `/login?${query}` : '/login', { scroll: false });
  }

  if (status === 'authenticated') return <AuthCardSkeleton />;

  return (
    <div className="w-full max-w-md rounded-lg border border-client-border bg-white p-8">
      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel="Đăng nhập hoặc đăng ký"
        idPrefix={TAB_PREFIX}
      />
      <div
        role="tabpanel"
        id={panelId(TAB_PREFIX, activeTab)}
        aria-labelledby={tabId(TAB_PREFIX, activeTab)}
        className="mt-6"
      >
        {activeTab === 'register' ? <RegisterForm /> : <LoginForm />}
      </div>
    </div>
  );
}
