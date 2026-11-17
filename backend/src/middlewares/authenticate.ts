import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../lib/jwt';
import { authRepository } from '../modules/auth/auth.repository';
import { AppError, ERROR_CODES } from '../types/errors';
import type { Role } from '../types/constants';

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return undefined;
}

/**
 * Middleware authenticate (concept-auth):
 * 1. Lấy token (cookie devlearn_token -> Authorization header)
 * 2. Verify chữ ký JWT + thời hạn
 * 3. Query DB kiểm tra user tồn tại và status !== LOCKED (khóa tài khoản hiệu lực ngay)
 * 4. Gắn req.user = { id, role }
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Bạn cần đăng nhập để tiếp tục.');
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }

    const user = await authRepository.findById(payload.sub);
    if (!user) {
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Tài khoản không tồn tại.');
    }

    if (user.status === 'LOCKED') {
      throw new AppError(
        ERROR_CODES.ACCOUNT_LOCKED,
        403,
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    req.user = {
      id: user.id,
      role: user.role as Role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware optionalAuthenticate (concept-auth):
 * Nếu có token hợp lệ thì gắn req.user; nếu không có token hoặc token sai/hết hạn thì bỏ qua, không chặn.
 */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      return next();
    }

    const user = await authRepository.findById(payload.sub);
    if (user && user.status !== 'LOCKED') {
      req.user = {
        id: user.id,
        role: user.role as Role,
      };
    }

    next();
  } catch {
    next();
  }
}

/**
 * Middleware requireRole (concept-roles-permissions):
 * Chặn các vai trò không nằm trong danh sách được phép.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Bạn cần đăng nhập để tiếp tục.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thực hiện thao tác này.'));
    }

    next();
  };
}
