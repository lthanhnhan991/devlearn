import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InfoBannerProps {
  targetScreen?: string;
  children?: ReactNode;
  className?: string;
}

export function InfoBanner({ targetScreen, children, className }: InfoBannerProps) {
  return (
    <div
      role="region"
      aria-label="Thông tin liên kết Client"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 shadow-xs',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5 shrink-0 text-blue-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
      <div className="flex-1 font-medium">
        {targetScreen ? (
          <>
            Quản lý nội dung hiển thị ở{' '}
            <span className="font-semibold text-blue-950">CLIENT · {targetScreen}</span>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
