import type { Request, Response, NextFunction } from 'express';
import {
  EnrollmentsService,
  enrollmentsService as defaultService,
} from './enrollments.service';
import { AppError, ERROR_CODES } from '../../types/errors';

export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService = defaultService) {}

  enroll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Bạn cần đăng nhập để đăng ký học.');
      }

      const courseId = req.params.courseId as string;
      const result = await this.service.enroll(req.user.id, req.user.role, courseId);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const enrollmentsController = new EnrollmentsController();
