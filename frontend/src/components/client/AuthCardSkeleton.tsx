import { Skeleton } from '@/components/ui/Skeleton';

export type AuthCardSkeletonTone = 'client' | 'admin';

/** Khung chờ cho thẻ form đăng nhập (dùng làm `fallback` của `Suspense` và khi đang chuyển trang). */
export function AuthCardSkeleton({ tone = 'client' }: { tone?: AuthCardSkeletonTone }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={
        tone === 'client'
          ? 'flex w-full max-w-md flex-col gap-4 rounded-lg border border-client-border bg-white p-8'
          : 'flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-8'
      }
    >
      <span className="sr-only">Đang tải…</span>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}
