import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/admin/login', authController.adminLogin);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
