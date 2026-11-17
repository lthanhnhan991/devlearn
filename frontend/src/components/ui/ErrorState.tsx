import type { ReactNode } from 'react';
import { Button } from './Button';
import type { FieldTone } from './TextField';

export interface ErrorStateProps {
  title?: string;
  message: string;
  /** Có `onRetry` thì hiện nút **Thử lại**. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Hành động thêm (vd. liên kết về trang chủ khi bị từ chối quyền). */
  action?: ReactNode;
  tone?: FieldTone;
}

/** Trạng thái lỗi/forbidden của trang (architecture-frontend: error · forbidden). */
export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
  retryLabel = 'Thử lại',
  action,
  tone = 'client',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center"
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry !== undefined ? (
          <Button
            variant={tone === 'admin' ? 'admin-primary' : 'client-primary'}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
