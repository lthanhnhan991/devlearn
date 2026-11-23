import type { Request, Response, NextFunction } from 'express';
import { AdminCoursesService, adminCoursesService as defaultService } from './admin-courses.service';
import {
  createCourseReqSchema,
  updateCourseReqSchema,
  updateCourseStatusReqSchema,
  adminCourseListQuerySchema,
} from '../../types/dto/admin-course';
import type { Role } from '../../types/constants';

export class AdminCoursesController {
  constructor(private readonly service: AdminCoursesService = defaultService) {}

  listCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = adminCourseListQuerySchema.parse(req.query);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const result = await this.service.listCourses(userId, userRole, parsed);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCourseReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.createCourse(userId, userRole, parsed);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.getCourse(userId, userRole, courseId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const parsed = updateCourseReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.updateCourse(userId, userRole, courseId, parsed);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const parsed = updateCourseStatusReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.updateStatus(userId, userRole, courseId, parsed.status);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      await this.service.deleteCourse(userId, userRole, courseId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const adminCoursesController = new AdminCoursesController();
