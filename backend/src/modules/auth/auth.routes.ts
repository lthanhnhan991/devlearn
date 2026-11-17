import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middlewares/authenticate';
import { ERROR_CODES } from '../../types/errors';
import { authController } from './auth.controller';

/**
 * Rate limit đăng ký: 5 lần/giờ/IP (concept-auth, api-auth).
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Bạn thao tác đăng ký quá nhiều lần. Vui lòng thử lại sau.',
      },
    });
  },
});

/**
 * Rate limit đăng nhập: 10 lần/15 phút/IP (concept-auth, api-auth).
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
      },
    });
  },
});

export const authRouter = Router();

authRouter.post('/register', registerLimiter, authController.register);
authRouter.post('/login', loginLimiter, authController.login);
authRouter.post('/admin/login', loginLimiter, authController.adminLogin);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
