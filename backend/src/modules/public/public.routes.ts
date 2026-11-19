import { Router } from 'express';
import { publicController } from './public.controller';

export const publicRouter = Router();

publicRouter.get('/stats', publicController.getStats);
