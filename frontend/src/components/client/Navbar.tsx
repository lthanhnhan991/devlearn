'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { buttonStyles } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const pathname = usePathname();
  const { status, user } = useAuth();

  const navLinks = [
    { href: '/', label: 'Khám phá' },
    { href: '/courses', label: 'Danh mục' },
    { href: '/my-courses', label: 'Khóa học của tôi' },
    { href: '/ai', label: 'Trợ lý AI' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label="DevLearn — về trang chủ"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-primary"
          >
            <Logo tone="client" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Điều hướng chính">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-client-primary',
                    active ? 'font-semibold text-client-primary' : 'text-slate-700',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search box + Auth */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Tìm khóa học…"
              className="h-10 w-48 rounded-full border border-slate-300 bg-slate-50 pl-9 pr-4 text-sm text-foreground placeholder:text-slate-400 focus-visible:border-client-primary focus-visible:bg-white focus-visible:outline-none lg:w-64"
            />
          </div>

          {status === 'loading' ? (
            <div
              className="size-10 animate-pulse rounded-full bg-slate-200"
              aria-label="Đang nạp thông tin người dùng"
            />
          ) : status === 'authenticated' && user !== null ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className={buttonStyles({ variant: 'client-primary', size: 'md' })}
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
