import { Router } from 'express';
import { adminContentController } from './admin-content.controller';
import { authenticate, requireRole } from '../../middlewares/authenticate';
import { uploadMiddleware } from '../../middlewares/upload';

export const adminContentRouter = Router();

adminContentRouter.use(authenticate, requireRole('TEACHER', 'ADMIN'));

// Course structure
adminContentRouter.get('/courses/:courseId/structure', adminContentController.getCourseStructure);

// Modules
adminContentRouter.post('/courses/:courseId/modules', adminContentController.createModule);
adminContentRouter.patch('/modules/:moduleId', adminContentController.updateModule);
adminContentRouter.put('/courses/:courseId/modules/order', adminContentController.reorderModules);
adminContentRouter.delete('/modules/:moduleId', adminContentController.deleteModule);

// Lessons
adminContentRouter.post('/modules/:moduleId/lessons', adminContentController.createLesson);
adminContentRouter.get('/lessons/:lessonId', adminContentController.getLesson);
adminContentRouter.patch('/lessons/:lessonId', adminContentController.updateLesson);
adminContentRouter.put('/modules/:moduleId/lessons/order', adminContentController.reorderLessons);
adminContentRouter.delete('/lessons/:lessonId', adminContentController.deleteLesson);
adminContentRouter.post(
  '/lessons/:lessonId/upload',
  uploadMiddleware.single('file'),
  adminContentController.uploadLessonFile,
);
