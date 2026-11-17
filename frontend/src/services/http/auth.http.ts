import { apiClient } from '@/lib/api-client';
import type { LoginRequestDto, RegisterRequestDto, UserDto } from '@/types';
import type { AuthService } from '../auth.service';

interface AuthResponseData {
  user: UserDto;
}

/**
 * POST /auth/login — Cổng CLIENT (chỉ STUDENT).
 * Backend đặt cookie devlearn_token (httpOnly).
 */
export async function login(input: LoginRequestDto): Promise<UserDto> {
  const data = await apiClient.post<AuthResponseData>('/auth/login', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return data.user;
}

/**
 * POST /auth/admin/login — Cổng ADMIN (chỉ TEACHER và ADMIN).
 * Backend đặt cookie devlearn_token (httpOnly).
 */
export async function adminLogin(input: LoginRequestDto): Promise<UserDto> {
  const data = await apiClient.post<AuthResponseData>('/auth/admin/login', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return data.user;
}

/**
 * POST /auth/register — Đăng ký tài khoản STUDENT (tự động đăng nhập).
 * Backend đặt cookie devlearn_token (httpOnly).
 */
export async function register(input: RegisterRequestDto): Promise<UserDto> {
  const data = await apiClient.post<AuthResponseData>('/auth/register', {
    fullName: input.fullName.trim(),
    studentCode: input.studentCode.trim().toUpperCase(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return data.user;
}

/**
 * POST /auth/logout — Đăng xuất (xóa cookie devlearn_token phía server).
 * Idempotent: 204 No Content.
 */
export async function logout(): Promise<void> {
  await apiClient.post<void>('/auth/logout');
}

/**
 * GET /auth/me — Lấy thông tin tài khoản phiên hiện tại từ cookie.
 * Ném ApiError 401 UNAUTHENTICATED khi chưa đăng nhập.
 */
export async function me(): Promise<UserDto> {
  const data = await apiClient.get<AuthResponseData>('/auth/me');
  return data.user;
}

/** Alias cho me() */
export const getMe = me;

/**
 * Triển khai AuthService chuẩn HTTP gọi Backend thật qua apiClient (api-auth).
 */
export const authHttp: AuthService = {
  login,
  adminLogin,
  register,
  logout,
  me,
};
