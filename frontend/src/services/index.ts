import { isMockFeature } from '@/lib/mock';
import type { AuthService } from './auth.service';
import { authHttp } from './http/auth.http';
import { authMock } from './mock/auth.mock';

export * from './auth.service';
export { authHttp } from './http/auth.http';
export { authMock } from './mock/auth.mock';

/**
 * Chọn http|mock theo `NEXT_PUBLIC_MOCK_FEATURES` (architecture-frontend).
 * Mặc định dùng mock nếu 'auth' có trong NEXT_PUBLIC_MOCK_FEATURES.
 * Khi gỡ 'auth' khỏi env, tự động chuyển sang gọi backend HTTP thật.
 */
export const authService: AuthService = isMockFeature('auth') ? authMock : authHttp;
