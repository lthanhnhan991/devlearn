/**
 * ============================================================================
 * MODULE: PUBLIC (Số liệu thống kê công khai)
 * ============================================================================
 * Danh sách API:
 * - GET /api/v1/public/stats : Thống kê tổng quan trang chủ (tổng khóa học, học viên, tỷ lệ hoàn thành)
 * ============================================================================
 */

import { Router } from 'express';
import { publicController } from './public.controller';

export const publicRouter = Router();

publicRouter.get('/stats', publicController.getStats);
