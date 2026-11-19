import type { Request, Response, NextFunction } from 'express';
import { CoursesService, coursesService as defaultService } from './courses.service';
import { listCoursesQuerySchema } from '../../types/dto/catalog';

export class CoursesController {
  constructor(private readonly service: CoursesService = defaultService) {}

  listCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listCoursesQuerySchema.parse(req.query);
      const result = await this.service.listCourses(parsed);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getCourseDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id as string;
      const userId = req.user?.id;
      const course = await this.service.getCourseDetail(courseId, userId);
      res.status(200).json({ data: course });
    } catch (error) {
      next(error);
    }
  };
}

export const coursesController = new CoursesController();
