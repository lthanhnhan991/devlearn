/**
 * ============================================================================
 * MODULE: LEARNING PROGRESS & MY COURSES (Tiến độ học tập & Khóa học của tôi)
 * ============================================================================
 * Danh sách API:
 * - GET  /api/v1/lessons/:id            : Lấy nội dung bài học cho sinh viên đã đăng ký
 * - POST /api/v1/lessons/:id/complete   : Đánh dấu hoàn thành bài học (idempotent, tính lại % tiến độ)
 * - GET  /api/v1/me/courses             : Danh sách khóa học của tôi (đang học / đã hoàn thành)
 * - GET  /api/v1/me/learning-summary    : Thống kê tổng quan tiến độ học tập của sinh viên
 * ============================================================================
 */

import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middlewares/authenticate';

export const lessonsRouter = Router();
lessonsRouter.get('/:id', authenticate, progressController.getLesson);
lessonsRouter.post('/:id/complete', authenticate, progressController.completeLesson);

export const meRouter = Router();
meRouter.get('/courses', authenticate, progressController.getMyCourses);
meRouter.get('/learning-summary', authenticate, progressController.getLearningSummary);
