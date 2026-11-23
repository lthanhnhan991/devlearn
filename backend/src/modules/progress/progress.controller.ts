import type { Request, Response, NextFunction } from 'express';
import { ProgressService, progressService as defaultService } from './progress.service';
import { myCoursesQuerySchema } from '../../types/dto/learning';

export class ProgressController {
  constructor(private readonly service: ProgressService = defaultService) {}

  getLearnStructure = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const userId = req.user!.id;
      const data = await this.service.getLearnStructure(userId, courseId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user!.id;
      const data = await this.service.getLesson(userId, lessonId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  completeLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.id as string;
      const userId = req.user!.id;
      const data = await this.service.completeLesson(userId, lessonId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = myCoursesQuerySchema.parse(req.query);
      const userId = req.user!.id;
      const data = await this.service.getMyCourses(userId, parsed.status);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getLearningSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = await this.service.getLearningSummary(userId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };
}

export const progressController = new ProgressController();
