'use client';

import { useCallback, useState } from 'react';
import { describeAuthError, type AuthErrorView, type AuthPortal } from './auth-errors';

/**
 * Trạng thái gửi form auth dùng chung cho đăng nhập/đăng ký/đăng nhập quản trị.
 * Thành công: giữ `submitting = true` cho tới khi trang điều hướng đi (tránh bấm lặp).
 */
export function useAuthSubmit(portal: AuthPortal) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const submit = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      setSubmitting(true);
      setError(null);
      try {
        await action();
        return true;
      } catch (caught) {
        setError(describeAuthError(caught, portal));
        setSubmitting(false);
        return false;
      }
    },
    [portal],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { submitting, error, submit, clearError };
}
