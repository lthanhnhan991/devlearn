'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Alert } from '@/components/ui/Alert';
import type { AuthErrorView } from './auth-errors';

export interface AuthErrorAlertProps {
  error: AuthErrorView;
  /** Có thì lỗi do hệ thống sẽ hiện nút **Thử lại** (gửi lại form). */
  onRetry?: () => void;
}

/** Thông báo lỗi chung của form auth (lỗi theo từng trường hiển thị ngay dưới ô nhập). */
export function AuthErrorAlert({ error, onRetry }: AuthErrorAlertProps) {
  if (error.formMessage === null) return null;

  let action: ReactNode;
  if (error.portalLink !== null) {
    action = (
      <Link href={error.portalLink.href} className="underline underline-offset-2">
        {error.portalLink.label}
      </Link>
    );
  } else if (error.retryable && onRetry !== undefined) {
    action = (
      <button type="button" onClick={onRetry} className="underline underline-offset-2">
        Thử lại
      </button>
    );
  }

  return <Alert action={action}>{error.formMessage}</Alert>;
}
