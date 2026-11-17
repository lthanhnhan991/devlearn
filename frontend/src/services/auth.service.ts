import type { LoginRequestDto, RegisterRequestDto, UserDto } from '@/types';

/**
 * Hợp đồng service Auth (api-auth). `mock/auth.mock.ts` và (sau này) `http/auth.http.ts`
 * phải cùng chữ ký. Lỗi nghiệp vụ được ném dưới dạng `ApiError` (`@/lib/api-error`).
 */
export interface AuthService {
  /** POST /auth/login — cổng CLIENT (chỉ STUDENT). */
  login(input: LoginRequestDto): Promise<UserDto>;
  /** POST /auth/admin/login — cổng ADMIN (chỉ TEACHER/ADMIN). */
  adminLogin(input: LoginRequestDto): Promise<UserDto>;
  /** POST /auth/register — tạo STUDENT và tự đăng nhập. */
  register(input: RegisterRequestDto): Promise<UserDto>;
  /** POST /auth/logout — idempotent. */
  logout(): Promise<void>;
  /** GET /auth/me — ném `ApiError` 401 `UNAUTHENTICATED` khi chưa đăng nhập. */
  me(): Promise<UserDto>;
}
