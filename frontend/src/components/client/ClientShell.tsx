import { Suspense, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Logo } from '@/components/shared/Logo';

export interface ClientShellProps {
  children: ReactNode;
}

function NavbarShellFallback() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Logo tone="client" />
        </div>
        <div className="size-10 animate-pulse rounded-full bg-slate-100" />
      </div>
    </header>
  );
}

/**
 * Shell chuẩn cho khu vực CLIENT (C01–C09):
 * Bao gồm Navbar phía trên cùng (Logo, Menu, Ô tìm kiếm, Nút đăng nhập hoặc UserMenu)
 * và phần nội dung chính bên dưới.
 */
export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Suspense fallback={<NavbarShellFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
    </div>
  );
}
