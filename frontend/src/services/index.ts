import { isMockFeature } from '@/lib/mock';
import type { AuthService } from './auth.service';
import { authMock } from './mock/auth.mock';

function notWired(feature: string): Promise<never> {
  return Promise.reject(
    new Error(
      `Tính năng "${feature}" chưa có bản http (làm ở giai đoạn Wire). ` +
        `Thêm "${feature}" vào NEXT_PUBLIC_MOCK_FEATURES để dùng mock.`,
    ),
  );
}

/** Chỗ giữ cho `http/auth.http.ts` (P01-C1). Cho tới khi đó chỉ chạy được bằng mock. */
const authHttpPending: AuthService = {
  login: () => notWired('auth'),
  adminLogin: () => notWired('auth'),
  register: () => notWired('auth'),
  logout: () => notWired('auth'),
  me: () => notWired('auth'),
};

/** Chọn http|mock theo `NEXT_PUBLIC_MOCK_FEATURES` (architecture-frontend). */
export const authService: AuthService = isMockFeature('auth') ? authMock : authHttpPending;
