'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/initials';
import { useAuth } from '@/features/auth/auth-context';
import type { UserDto } from '@/types';

const ITEM_CLASSES =
  'block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-client-surface ' +
  'focus-visible:bg-client-surface focus-visible:outline-none';

/**
 * G-15 — menu thả xuống từ avatar: Khóa học của tôi · Kết quả kiểm tra (SV) hoặc Khu vực quản trị
 * (GV/Admin), và Đăng xuất. Đóng khi bấm ra ngoài hoặc nhấn Esc.
 */
export function UserMenu({ user }: { user: UserDto }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const container = containerRef.current;
      if (container !== null && event.target instanceof Node && !container.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setOpen(false);
      setLoggingOut(false);
      router.replace('/');
    }
  }

  const isStudent = user.role === 'STUDENT';

  return (
    <div ref={containerRef} className="relative" suppressHydrationWarning>
      <button
        ref={triggerRef}
        type="button"
        suppressHydrationWarning
        aria-label={`Menu tài khoản của ${user.fullName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'flex size-10 items-center justify-center rounded-full bg-client-primary text-sm font-semibold text-white',
          'hover:bg-client-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-primary',
        )}
      >
        {getInitials(user.fullName)}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Tài khoản"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-client-border bg-white py-1 shadow-lg"
        >
          <div className="border-b border-client-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
            <p className="truncate text-sm text-slate-600">{user.email}</p>
          </div>
          {isStudent ? (
            <>
              <Link
                role="menuitem"
                href="/my-courses"
                className={ITEM_CLASSES}
                onClick={() => setOpen(false)}
              >
                Khóa học của tôi
              </Link>
              <Link
                role="menuitem"
                href="/my-results"
                className={ITEM_CLASSES}
                onClick={() => setOpen(false)}
              >
                Kết quả kiểm tra
              </Link>
            </>
          ) : (
            <Link
              role="menuitem"
              href="/admin"
              className={ITEM_CLASSES}
              onClick={() => setOpen(false)}
            >
              Khu vực quản trị
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className={cn(ITEM_CLASSES, 'border-t border-client-border disabled:opacity-60')}
          >
            {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
