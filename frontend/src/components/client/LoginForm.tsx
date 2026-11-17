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

type LoginField = 'email' | 'password';

/** C01 — tab Đăng nhập (cổng CLIENT, chỉ STUDENT). Điều hướng sau khi đăng nhập do trang `/login` đảm nhiệm. */
export function LoginForm() {
  const { login } = useAuth();
  const { submitting, error, submit, clearError } = useAuthSubmit('CLIENT');
  const [values, setValues] = useState<Record<LoginField, string>>({ email: '', password: '' });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const errors: FieldErrors = { ...clientErrors, ...(error?.fieldErrors ?? {}) };

  function handleChange(field: LoginField) {
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
    await submit(() => login(parsed.data));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void attempt();
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Đăng nhập" className="flex flex-col gap-4">
      {error !== null ? (
        <AuthErrorAlert error={error} onRetry={() => void attempt()} />
      ) : null}
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ten@stu.edu.vn"
        value={values.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={submitting}
      />
      <TextField
        label="Mật khẩu"
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={submitting}
      />
      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </Button>
      <p className="text-base text-slate-600">
        Giảng viên và Quản trị viên đăng nhập tại{' '}
        <Link
          href="/admin/login"
          className="font-semibold text-client-primary underline underline-offset-2"
        >
          cổng quản trị riêng
        </Link>
        .
      </p>
    </form>
  );
}
