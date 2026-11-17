'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthErrorAlert } from '@/features/auth/auth-error-alert';
import {
  collectFieldErrors,
  omitFieldError,
  type FieldErrors,
} from '@/features/auth/auth-errors';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthSubmit } from '@/features/auth/use-auth-submit';
import { loginRequestSchema } from '@/types';

type AdminLoginField = 'email' | 'password';

/** A00 — form đăng nhập quản trị (cổng ADMIN, chỉ TEACHER/ADMIN). Điều hướng do trang `/admin/login` đảm nhiệm. */
export function AdminLoginForm() {
  const { adminLogin } = useAuth();
  const { submitting, error, submit, clearError } = useAuthSubmit('ADMIN');
  const [values, setValues] = useState<Record<AdminLoginField, string>>({
    email: '',
    password: '',
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const errors: FieldErrors = { ...clientErrors, ...(error?.fieldErrors ?? {}) };

  function handleChange(field: AdminLoginField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((previous) => ({ ...previous, [field]: next }));
      setClientErrors((previous) => omitFieldError(previous, field));
      clearError();
    };
  }

  async function attempt() {
    if (submitting) return;
    const parsed = loginRequestSchema.safeParse(values);
    if (!parsed.success) {
      setClientErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setClientErrors({});
    await submit(() => adminLogin(parsed.data));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void attempt();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Đăng nhập quản trị"
      className="flex flex-col gap-4"
    >
      {error !== null ? (
        <AuthErrorAlert error={error} onRetry={() => void attempt()} />
      ) : null}
      <TextField
        tone="admin"
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        placeholder="admin@edu.vn"
        value={values.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={submitting}
      />
      <TextField
        tone="admin"
        label="Mật khẩu"
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={submitting}
      />
      <Button type="submit" variant="admin-primary" size="lg" fullWidth loading={submitting}>
        {submitting ? 'Đang đăng nhập…' : 'Đăng nhập quản trị'}
      </Button>
      <p className="text-base text-slate-600">
        Chỉ tài khoản Teacher hoặc Admin được vào. Tài khoản Student sẽ bị từ chối.
      </p>
      <Link
        href="/"
        className="text-base text-slate-600 underline-offset-2 hover:text-admin-navy hover:underline"
      >
        ← Về trang dành cho người học
      </Link>
    </form>
  );
}
