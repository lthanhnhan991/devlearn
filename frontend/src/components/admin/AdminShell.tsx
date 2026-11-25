'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';

export interface AdminShellProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: readonly NavItem[];
}

const NAV_GROUPS: readonly NavGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [{ href: '/admin', label: 'Dashboard' }],
  },
  {
    title: 'NỘI DUNG',
    items: [
      { href: '/admin/courses', label: 'Khóa học' },
      { href: '/admin/topics', label: 'Chủ đề' },
      { href: '/admin/lessons', label: 'Bài học' },
      { href: '/admin/exams', label: 'Bài kiểm tra' },
      { href: '/admin/exam-stats', label: 'Thống kê bài kiểm tra' },
    ],
  },
  {
    title: 'TRỢ LÝ AI',
    items: [{ href: '/admin/ai-documents', label: 'Tài liệu AI' }],
  },
  {
    title: 'HỆ THỐNG',
    items: [{ href: '/admin/users', label: 'Người dùng', adminOnly: true }],
  },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      router.replace('/admin/login');
    }
  }

  const roleLabel =
    user?.role === 'ADMIN' ? 'Admin' : user?.role === 'TEACHER' ? 'Teacher' : 'Student';

  const breadcrumbSection = (() => {
    if (pathname.startsWith('/admin/courses')) return 'Khóa học';
    if (pathname.startsWith('/admin/topics')) return 'Chủ đề';
    if (pathname.startsWith('/admin/lessons')) return 'Bài học';
    if (pathname.startsWith('/admin/exams')) return 'Bài kiểm tra';
    if (pathname.startsWith('/admin/exam-stats')) return 'Thống kê bài kiểm tra';
    if (pathname.startsWith('/admin/ai-documents')) return 'Tài liệu AI';
    if (pathname.startsWith('/admin/users')) return 'Người dùng';
    return 'Dashboard';
  })();

  return (
    <div className="flex min-h-screen bg-admin-bg font-sans">
      {/* Sidebar navy ~256px */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-admin-navy text-white">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <Link
            href="/admin"
            aria-label="DevLearn Quản trị"
            className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Logo tone="adminOnDark" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6" aria-label="Điều hướng quản trị">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.adminOnly || user?.role === 'ADMIN',
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-xs font-bold tracking-wider text-slate-400">
                  {group.title}
                </p>
                {visibleItems.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-admin-primary text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ← Về trang người học
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-rose-300 hover:bg-slate-800 disabled:opacity-60"
          >
            {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-slate-500">Quản trị</span>
            <span className="text-slate-400">›</span>
            <span className="font-semibold text-admin-navy">{breadcrumbSection}</span>
          </div>

          <div className="flex items-center gap-4 text-sm" suppressHydrationWarning>
            {mounted && user ? (
              <span className="text-slate-600">
                Vai trò: <strong className="font-semibold text-admin-navy">{roleLabel}</strong>
                {user.email ? ` · ${user.email}` : ''}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">Đang nạp thông tin…</span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
