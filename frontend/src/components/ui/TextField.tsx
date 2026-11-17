'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type FieldTone = 'client' | 'admin';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  /** Thông báo lỗi của trường (hiện dưới ô nhập, gắn `aria-describedby`). */
  error?: string | undefined;
  /** Gợi ý ngắn dưới ô nhập khi không có lỗi. */
  hint?: string | undefined;
  tone?: FieldTone;
}

const LABEL_CLASSES: Record<FieldTone, string> = {
  client: 'text-foreground',
  admin: 'text-admin-navy',
};

const INPUT_TONE_CLASSES: Record<FieldTone, string> = {
  client: 'text-foreground focus-visible:border-client-primary focus-visible:outline-client-primary',
  admin: 'text-admin-navy focus-visible:border-admin-primary focus-visible:outline-admin-primary',
};

export function TextField({ label, error, hint, tone = 'client', id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasError = error !== undefined && error.length > 0;
  const hasMessage = hasError || (hint !== undefined && hint.length > 0);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={cn('text-sm font-semibold', LABEL_CLASSES[tone])}>
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cn(
          'h-12 w-full rounded-lg border bg-white px-4 text-base placeholder:text-slate-500',
          'focus-visible:outline-2 focus-visible:-outline-offset-1 disabled:bg-slate-100',
          hasError ? 'border-status-danger-fg' : 'border-slate-500',
          INPUT_TONE_CLASSES[tone],
        )}
      />
      {hasMessage ? (
        <p
          id={messageId}
          className={cn('text-sm', hasError ? 'text-status-danger-fg' : 'text-slate-600')}
        >
          {hasError ? error : hint}
        </p>
      ) : null}
    </div>
  );
}
