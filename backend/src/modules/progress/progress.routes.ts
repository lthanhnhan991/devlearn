import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middlewares/authenticate';

export const lessonsRouter = Router();
lessonsRouter.get('/:id', authenticate, progressController.getLesson);
lessonsRouter.post('/:id/complete', authenticate, progressController.completeLesson);

export const meRouter = Router();
meRouter.get('/courses', authenticate, progressController.getMyCourses);
meRouter.get('/learning-summary', authenticate, progressController.getLearningSummary);
