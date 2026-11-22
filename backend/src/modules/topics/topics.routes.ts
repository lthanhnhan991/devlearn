import { Router } from 'express';
import { topicsController } from './topics.controller';
import { authenticate, requireRole } from '../../middlewares/authenticate';

export const publicTopicsRouter = Router();
publicTopicsRouter.get('/', topicsController.listPublicTopics);

export const adminTopicsRouter = Router();
adminTopicsRouter.get('/', authenticate, requireRole('TEACHER', 'ADMIN'), topicsController.listAdminTopics);
adminTopicsRouter.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), topicsController.createTopic);
adminTopicsRouter.patch('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), topicsController.updateTopic);
adminTopicsRouter.put('/order', authenticate, requireRole('TEACHER', 'ADMIN'), topicsController.reorderTopics);
adminTopicsRouter.delete('/:id', authenticate, requireRole('ADMIN'), topicsController.deleteTopic);
