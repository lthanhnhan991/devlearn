/**
 * ============================================================================
 * MODULE: ADMIN COURSES (Quản lý khóa học - Giảng viên & Quản trị viên)
 * ============================================================================
 * Danh sách API:
 * - GET    /api/v1/admin/courses          : Danh sách khóa học quản trị (TEACHER xem của mình, ADMIN xem tất cả)
 * - POST   /api/v1/admin/courses          : Tạo khóa học mới (trạng thái DRAFT)
 * - GET    /api/v1/admin/courses/:id      : Chi tiết khóa học quản trị
 * - PATCH  /api/v1/admin/courses/:id      : Cập nhật thông tin cơ bản khóa học
 * - PATCH  /api/v1/admin/courses/:id/status: Cập nhật trạng thái xuất bản (DRAFT <-> PUBLISHED)
 * - DELETE /api/v1/admin/courses/:id      : Xóa khóa học (chặn nếu đã có học viên đăng ký)
 * ============================================================================
 */

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
