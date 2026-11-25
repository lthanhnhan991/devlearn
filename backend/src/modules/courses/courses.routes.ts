/**
 * ============================================================================
 * MODULE: CLIENT COURSES & ENROLLMENT (Danh mục khóa học & Ghi danh)
 * ============================================================================
 * Danh sách API:
 * - GET  /api/v1/courses                 : Danh mục khóa học công khai (lọc topic/level, tìm kiếm, phân trang)
 * - GET  /api/v1/courses/:id             : Chi tiết khóa học công khai (kèm trạng thái ghi danh nếu đã đăng nhập)
 * - POST /api/v1/courses/:courseId/enroll: Sinh viên đăng ký tham gia khóa học
 * - GET  /api/v1/courses/:courseId/learn : Cấu trúc bài học và tiến độ cho sinh viên đã đăng ký
 * ============================================================================
 */

import { Router } from 'express';
import { coursesController } from './courses.controller';
import { enrollmentsController } from '../enrollments/enrollments.controller';
import { progressController } from '../progress/progress.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate';

export const coursesRouter = Router();

coursesRouter.get('/', coursesController.listCourses);
coursesRouter.get('/:id', optionalAuthenticate, coursesController.getCourseDetail);
coursesRouter.post('/:courseId/enroll', authenticate, enrollmentsController.enroll);
coursesRouter.get('/:courseId/learn', authenticate, progressController.getLearnStructure);
