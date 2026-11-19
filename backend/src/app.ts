import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { authRouter } from './modules/auth/auth.routes';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.get('/api/v1/health', (_req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  // Modules
  app.use('/api/v1/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
