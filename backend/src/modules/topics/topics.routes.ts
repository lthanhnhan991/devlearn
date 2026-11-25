/**
 * ============================================================================
 * MODULE: TOPICS (Quản lý Chủ đề động - Client & Admin)
 * ============================================================================
 * Danh sách API:
 * - GET    /api/v1/topics             : Danh sách chủ đề hoạt động cho Client
 * - GET    /api/v1/admin/topics       : Danh sách chủ đề quản trị (kèm lọc trạng thái & tìm kiếm)
 * - POST   /api/v1/admin/topics       : Tạo chủ đề mới (TEACHER, ADMIN)
 * - PATCH  /api/v1/admin/topics/:id   : Cập nhật thông tin chủ đề (TEACHER, ADMIN)
 * - PUT    /api/v1/admin/topics/order : Sắp xếp lại thứ tự chủ đề (TEACHER, ADMIN)
 * - DELETE /api/v1/admin/topics/:id   : Xóa chủ đề (chỉ ADMIN, yêu cầu chưa có khóa học)
 * ============================================================================
 */

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
