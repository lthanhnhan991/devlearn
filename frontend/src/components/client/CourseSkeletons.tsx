import { Skeleton } from '@/components/ui/Skeleton';

export function StatStripSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <span className="sr-only">Đang tải thống kê…</span>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center gap-2 text-center ${idx > 0 ? 'sm:pl-6' : ''}`}
          >
            <Skeleton className="h-9 w-20 sm:h-10 sm:w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <span className="sr-only">Đang tải danh sách khóa học…</span>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CourseCatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">Đang tải danh mục khóa học…</span>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CourseCatalogSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-48 rounded-lg sm:w-64" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <CourseCatalogGridSkeleton count={6} />
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-6xl px-6 py-8">
      <span className="sr-only">Đang tải thông tin khóa học…</span>
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-36" />
      </div>

      {/* Header banner skeleton */}
      <div className="mb-10 space-y-4">
        <div className="flex gap-2.5">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex gap-4 border-b border-slate-200 pb-3">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
