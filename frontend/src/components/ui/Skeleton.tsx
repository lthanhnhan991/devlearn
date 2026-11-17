import { cn } from '@/lib/cn';

export interface SkeletonProps {
  /** Kích thước/bố cục do nơi dùng quyết định, vd. `h-12 w-full`. */
  className?: string;
}

/** Khối xám nhấp nháy cho trạng thái `loading`. Vùng chứa nên có `role="status"` + `aria-busy`. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}
