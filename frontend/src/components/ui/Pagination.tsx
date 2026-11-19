import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  createPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, createPageUrl, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1.5 py-6">
      {/* Nút Trước */}
      {createPageUrl ? (
        <Link
          href={createPageUrl(prevPage)}
          aria-disabled={page <= 1}
          className={cn(
            'flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3.5 text-sm font-semibold transition-colors',
            page <= 1
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-slate-50 text-slate-700 focus-visible:outline-client-primary',
          )}
        >
          ← Trước
        </Link>
      ) : (
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(prevPage)}
          className={cn(
            'flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3.5 text-sm font-semibold transition-colors',
            page <= 1
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-slate-50 text-slate-700 focus-visible:outline-client-primary',
          )}
        >
          ← Trước
        </button>
      )}

      {/* Danh sách trang */}
      {pages.map((p) => {
        const isActive = p === page;
        if (createPageUrl) {
          return (
            <Link
              key={p}
              href={createPageUrl(p)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex size-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-client-primary text-white shadow-sm'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
              )}
            >
              {p}
            </Link>
          );
        }
        return (
          <button
            key={p}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange?.(p)}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
              isActive
                ? 'bg-client-primary text-white shadow-sm'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
            )}
          >
            {p}
          </button>
        );
      })}

      {/* Nút Sau */}
      {createPageUrl ? (
        <Link
          href={createPageUrl(nextPage)}
          aria-disabled={page >= totalPages}
          className={cn(
            'flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3.5 text-sm font-semibold transition-colors',
            page >= totalPages
              ? 'pointer-events-none opacity-40'
              : 'hover:bg-slate-50 text-slate-700 focus-visible:outline-client-primary',
          )}
        >
          Sau →
        </Link>
      ) : (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(nextPage)}
          className={cn(
            'flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3.5 text-sm font-semibold transition-colors',
            page >= totalPages
              ? 'cursor-not-allowed opacity-40'
              : 'hover:bg-slate-50 text-slate-700 focus-visible:outline-client-primary',
          )}
        >
          Sau →
        </button>
      )}
    </nav>
  );
}
