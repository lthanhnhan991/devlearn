/**
 * ============================================================================
 * MODULE: ADMIN CONTENT (Quản lý Module & Soạn bài học)
 * ============================================================================
 * Danh sách API:
 * - GET    /api/v1/admin/courses/:courseId/structure : Lấy cấu trúc module & bài học của khóa học
 * - POST   /api/v1/admin/courses/:courseId/modules   : Tạo module mới trong khóa học
 * - PATCH  /api/v1/admin/modules/:moduleId           : Cập nhật tiêu đề module
 * - PUT    /api/v1/admin/courses/:courseId/modules/order: Sắp xếp lại thứ tự modules
 * - DELETE /api/v1/admin/modules/:moduleId           : Xóa module (chặn nếu bài thi có lượt làm)
 * - POST   /api/v1/admin/modules/:moduleId/lessons   : Tạo bài học mới trong module
 * - GET    /api/v1/admin/lessons/:lessonId           : Lấy chi tiết bài học (soạn & xem trước)
 * - PATCH  /api/v1/admin/lessons/:lessonId           : Cập nhật thông tin/nội dung bài học
 * - PUT    /api/v1/admin/modules/:moduleId/lessons/order: Sắp xếp lại thứ tự bài học trong module
 * - DELETE /api/v1/admin/lessons/:lessonId           : Xóa bài học (kèm dọn tệp Cloudinary)
 * - POST   /api/v1/admin/lessons/:lessonId/upload    : Tải lên video / PDF (tự động nạp AiDocument)
 * ============================================================================
 */

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
