import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AlertTone = 'danger' | 'warning' | 'success';

export interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  /** Hành động đi kèm (vd. nút Thử lại hoặc liên kết sang cổng đúng). */
  action?: ReactNode;
}

const TONE_CLASSES: Record<AlertTone, string> = {
  danger: 'bg-status-danger-bg text-status-danger-fg border-status-danger-fg/30',
  warning: 'bg-status-warning-bg text-status-warning-fg border-status-warning-fg/30',
  success: 'bg-status-success-bg text-status-success-fg border-status-success-fg/30',
};

/** Thông báo nội tuyến (lỗi form, cảnh báo). `role="alert"` để trình đọc màn hình đọc ngay. */
export function Alert({ tone = 'danger', children, action }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col gap-2 rounded-lg border px-4 py-3 text-sm', TONE_CLASSES[tone])}
    >
      <div>{children}</div>
      {action !== undefined ? <div className="font-semibold">{action}</div> : null}
    </div>
  );
}
