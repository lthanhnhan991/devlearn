import { Router } from 'express';
import { adminCoursesController } from './admin-courses.controller';
import { authenticate, requireRole } from '../../middlewares/authenticate';

export const adminCoursesRouter = Router();

// Tất cả các route quản trị khóa học yêu cầu đăng nhập với vai trò TEACHER hoặc ADMIN
adminCoursesRouter.use(authenticate, requireRole('TEACHER', 'ADMIN'));

adminCoursesRouter.get('/', adminCoursesController.listCourses);
adminCoursesRouter.post('/', adminCoursesController.createCourse);
adminCoursesRouter.get('/:courseId', adminCoursesController.getCourse);
adminCoursesRouter.patch('/:courseId', adminCoursesController.updateCourse);
adminCoursesRouter.patch('/:courseId/status', adminCoursesController.updateStatus);
adminCoursesRouter.delete('/:courseId', adminCoursesController.deleteCourse);
