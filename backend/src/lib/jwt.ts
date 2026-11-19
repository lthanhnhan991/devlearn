import jwt, { SignOptions } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { env } from '../config/env';
import type { Role } from '../types/constants';

export interface AuthJwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export const AUTH_COOKIE_NAME = env.COOKIE_NAME;

/**
 * Ký JWT với payload { sub: userId, role } (concept-auth).
 */
export function signAuthToken(payload: { sub: string; role: Role }): string {
  const expiresIn = (env.JWT_EXPIRES_IN || '7d') as NonNullable<SignOptions['expiresIn']>;
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn,
  });
}

export const signToken = signAuthToken;

/**
 * Xác thực token JWT, ném lỗi nếu không hợp lệ hoặc hết hạn.
 */
export function verifyAuthToken(token: string): AuthJwtPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as AuthJwtPayload;
}

export const verifyToken = verifyAuthToken;

/**
 * Cấu hình cookie httpOnly cho devlearn_token (adr-008, concept-auth).
 */
export function getAuthCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction,
    maxAge: sevenDaysInMs,
  };
}

/**
 * Cấu hình cookie để xóa token khi đăng xuất (POST /auth/logout).
 */
export function getClearAuthCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction,
  };
}
