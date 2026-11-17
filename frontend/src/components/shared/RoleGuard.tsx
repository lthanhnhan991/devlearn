'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import type { Role } from '@/types';

export interface RoleGuardProps {
  roles: readonly Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Ẩn/hiện phần giao diện theo vai trò (vd. mục Người dùng chỉ ADMIN).
 * Chỉ phục vụ UX — KHÔNG phải bảo mật; quyền thật kiểm ở backend.
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  if (user === null || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
