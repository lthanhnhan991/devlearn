const LOGIN_PATHS = ['/login', '/admin/login'] as const;

function isLoginPath(path: string): boolean {
  return LOGIN_PATHS.some(
    (loginPath) =>
      path === loginPath || path.startsWith(`${loginPath}?`) || path.startsWith(`${loginPath}/`),
  );
}

function hasPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);
}

/**
 * Chỉ chấp nhận đường dẫn nội bộ cho `?next=` (chặn open redirect, chặn vòng lặp về trang đăng nhập).
 * `requiredPrefix` dùng cho cổng admin: `next` phải nằm trong `/admin`.
 */
export function getSafeNext(raw: string | null, fallback: string, requiredPrefix?: string): string {
  if (raw === null || raw.length === 0) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback;
  if (isLoginPath(raw)) return fallback;
  if (requiredPrefix !== undefined && !hasPrefix(raw, requiredPrefix)) return fallback;
  return raw;
}

/** URL trang đăng nhập kèm `?next=`; không thêm `next` khi đang ở trang đích mặc định (`/`, `/admin`). */
export function buildLoginUrl(loginPath: '/login' | '/admin/login', currentPath: string): string {
  if (currentPath === '/' || currentPath === '/admin' || isLoginPath(currentPath)) {
    return loginPath;
  }
  return `${loginPath}?next=${encodeURIComponent(currentPath)}`;
}
