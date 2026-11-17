'use client';

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
import { registerFormSchema } from '@/types';

type RegisterField = 'fullName' | 'studentCode' | 'email' | 'password' | 'confirmPassword';

const INITIAL_VALUES: Record<RegisterField, string> = {
  fullName: '',
  studentCode: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/**
 * C01 — tab Đăng ký (G-01: Họ tên, MSSV, Email, Mật khẩu, Nhập lại mật khẩu).
 * `confirmPassword` chỉ kiểm ở FE, không gửi lên API. Đăng ký xong tự đăng nhập.
 */
export function RegisterForm() {
  const { register } = useAuth();
  const { submitting, error, submit, clearError } = useAuthSubmit('CLIENT');
  const [values, setValues] = useState<Record<RegisterField, string>>(INITIAL_VALUES);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const errors: FieldErrors = { ...clientErrors, ...(error?.fieldErrors ?? {}) };

  function handleChange(field: RegisterField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((previous) => ({ ...previous, [field]: next }));
      setClientErrors((previous) => omitFieldError(previous, field));
      clearError();
    };
  }

  async function attempt() {
    if (submitting) return;
    const parsed = registerFormSchema.safeParse(values);
    if (!parsed.success) {
      setClientErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setClientErrors({});
    const { fullName, studentCode, email, password } = parsed.data;
    await submit(() => register({ fullName, studentCode, email, password }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void attempt();
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Đăng ký" className="flex flex-col gap-4">
      {error !== null ? (
        <AuthErrorAlert error={error} onRetry={() => void attempt()} />
      ) : null}
      <TextField
        label="Họ tên"
        name="fullName"
        autoComplete="name"
        placeholder="Nguyễn Văn A"
        value={values.fullName}
        onChange={handleChange('fullName')}
        error={errors.fullName}
        disabled={submitting}
      />
      <TextField
        label="MSSV"
        name="studentCode"
        autoComplete="off"
        placeholder="DH52301350"
        value={values.studentCode}
        onChange={handleChange('studentCode')}
        error={errors.studentCode}
        disabled={submitting}
      />
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
        autoComplete="new-password"
        hint="Tối thiểu 8 ký tự, gồm chữ và số."
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={submitting}
      />
      <TextField
        label="Nhập lại mật khẩu"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        disabled={submitting}
      />
      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitting ? 'Đang đăng ký…' : 'Đăng ký'}
      </Button>
    </form>
  );
}
