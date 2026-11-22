import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'client-primary'
  | 'client-outline'
  | 'admin-primary'
  | 'admin-outline'
  | 'admin-danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  'client-primary':
    'rounded-full bg-client-primary text-white hover:bg-client-primary-hover focus-visible:outline-client-primary',
  'client-outline':
    'rounded-full border border-client-primary bg-white text-client-primary hover:bg-client-primary-soft focus-visible:outline-client-primary',
  'admin-primary':
    'rounded-lg bg-admin-primary text-white hover:bg-admin-primary-hover focus-visible:outline-admin-primary',
  'admin-outline':
    'rounded-lg border border-slate-300 bg-white text-admin-navy hover:bg-admin-bg focus-visible:outline-admin-primary',
  'admin-danger':
    'rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

/** Dùng cho `<Link>` cần giao diện nút (điều hướng dùng thẻ `a`, hành động dùng `button`). */
export function buttonStyles({
  variant = 'client-primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && 'w-full');
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>, ButtonStyleOptions {
  /** Đang xử lý: khóa nút, hiện vòng xoay, báo `aria-busy`. */
  loading?: boolean;
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({
        ...(variant !== undefined && { variant }),
        ...(size !== undefined && { size }),
        ...(fullWidth !== undefined && { fullWidth }),
      })}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
