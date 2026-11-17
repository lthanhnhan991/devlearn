'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { buttonStyles } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildLoginUrl } from '@/lib/safe-next';
import type { Role } from '@/types';
import { useAuth } from './auth-context';

type LoginPath = '/login' | '/admin/login';

interface RoleGateProps {
  allowed: readonly Role[];
  loginPath: LoginPath;
  /** Vai trò hợp lệ nhưng sai khu vực thì chuyển sang đây thay vì báo forbidden. */
  redirectOtherRolesTo?: string;
  forbidden: ReactNode;
  children: ReactNode;
}

function GuardPlaceholder() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-md flex-col gap-3 px-6 py-16"
    >
      <span className="sr-only">Đang kiểm tra phiên đăng nhập…</span>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

/**
 * Cổng chặn theo vai trò. Quyền thật nằm ở backend; guard chỉ để điều hướng/UX
 * (coding-standards-frontend, "Role-based UI").
 * - đang nạp phiên → skeleton · khách → `/login|/admin/login?next=` · sai vai trò → forbidden.
 */
function RoleGate({
  allowed,
  loginPath,
  redirectOtherRolesTo,
  forbidden,
  children,
}: RoleGateProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  const roleAllowed = user !== null && allowed.includes(user.role);
  const isAnonymous = status === 'anonymous';
  const shouldRedirectRole =
    status === 'authenticated' && !roleAllowed && redirectOtherRolesTo !== undefined;

  useEffect(() => {
    if (isAnonymous) {
      router.replace(buildLoginUrl(loginPath, window.location.pathname + window.location.search));
    } else if (shouldRedirectRole && redirectOtherRolesTo !== undefined) {
      router.replace(redirectOtherRolesTo);
    }
  }, [isAnonymous, shouldRedirectRole, redirectOtherRolesTo, loginPath, router]);

  if (status === 'loading' || isAnonymous || shouldRedirectRole) return <GuardPlaceholder />;
  if (!roleAllowed) return <>{forbidden}</>;
  return <>{children}</>;
}

const STUDENT_ROLES: readonly Role[] = ['STUDENT'];
const STAFF_ROLES: readonly Role[] = ['TEACHER', 'ADMIN'];
const ADMIN_ROLES: readonly Role[] = ['ADMIN'];

/** Khu vực người học (My courses, Learn, Exams, AI): khách → `/login?next=`; GV/Admin → `/admin`. */
export function StudentGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGate
      allowed={STUDENT_ROLES}
      loginPath="/login"
      redirectOtherRolesTo="/admin"
      forbidden={null}
    >
      {children}
    </RoleGate>
  );
}

/** Khu vực quản trị: khách → `/admin/login?next=`; sinh viên → thông báo không có quyền. */
export function StaffGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGate
      allowed={STAFF_ROLES}
      loginPath="/admin/login"
      forbidden={
        <div className="px-6 py-16">
          <ErrorState
            tone="admin"
            title="Không có quyền truy cập"
            message="Tài khoản của bạn không được phép vào khu vực quản trị."
            action={
              <Link href="/" className={buttonStyles({ variant: 'admin-outline' })}>
                Về trang dành cho người học
              </Link>
            }
          />
        </div>
      }
    >
      {children}
    </RoleGate>
  );
}

/** Chỉ ADMIN (vd. trang Người dùng). Đặt bên trong `StaffGuard`; Giảng viên thấy thông báo từ chối. */
export function AdminOnlyGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGate
      allowed={ADMIN_ROLES}
      loginPath="/admin/login"
      forbidden={
        <ErrorState
          tone="admin"
          title="Không có quyền truy cập"
          message="Chỉ Admin truy cập mục này. Giảng viên không thấy mục Người dùng."
          action={
            <Link href="/admin" className={buttonStyles({ variant: 'admin-outline' })}>
              Về Dashboard
            </Link>
          }
        />
      }
    >
      {children}
    </RoleGate>
  );
}
