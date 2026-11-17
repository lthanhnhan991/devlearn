import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCardSkeleton } from '@/components/client/AuthCardSkeleton';
import { LoginView } from '@/components/client/LoginView';

export const metadata: Metadata = {
  title: 'Đăng nhập · DevLearn',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginView />
    </Suspense>
  );
}
