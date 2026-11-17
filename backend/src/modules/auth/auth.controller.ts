import type { Request, Response, NextFunction } from 'express';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from '../../lib/jwt';
import {
  loginRequestSchema,
  registerRequestSchema,
} from '../../types/dto/auth';
import { AppError, ERROR_CODES } from '../../types/errors';
import { AuthService, authService as defaultService } from './auth.service';

export class AuthController {
  constructor(private readonly service: AuthService = defaultService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerRequestSchema.parse(req.body);
      const { user, token } = await this.service.register(parsed);

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      res.status(201).json({ data: { user } });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginRequestSchema.parse(req.body);
      const { user, token } = await this.service.login(parsed);

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      res.status(200).json({ data: { user } });
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginRequestSchema.parse(req.body);
      const { user, token } = await this.service.adminLogin(parsed);

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      res.status(200).json({ data: { user } });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Bạn cần đăng nhập để tiếp tục.');
      }
      const user = await this.service.getMe(req.user.id);
      res.status(200).json({ data: { user } });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
