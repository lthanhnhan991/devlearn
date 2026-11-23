import type { Request, Response, NextFunction } from 'express';
import { AdminContentService, adminContentService as defaultService } from './admin-content.service';
import {
  createModuleReqSchema,
  updateModuleReqSchema,
  reorderModulesReqSchema,
  createLessonReqSchema,
  updateLessonReqSchema,
  reorderLessonsReqSchema,
} from '../../types/dto/admin-content';
import type { Role } from '../../types/constants';

export class AdminContentController {
  constructor(private readonly service: AdminContentService = defaultService) {}

  getCourseStructure = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.getCourseStructure(userId, userRole, courseId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const parsed = createModuleReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.createModule(userId, userRole, courseId, parsed);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moduleId = req.params.moduleId as string;
      const parsed = updateModuleReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.updateModule(userId, userRole, moduleId, parsed);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  reorderModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId as string;
      const parsed = reorderModulesReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const orderedIds = await this.service.reorderModules(userId, userRole, courseId, parsed.orderedIds);
      res.status(200).json({ data: { orderedIds } });
    } catch (error) {
      next(error);
    }
  };

  deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moduleId = req.params.moduleId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      await this.service.deleteModule(userId, userRole, moduleId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moduleId = req.params.moduleId as string;
      const parsed = createLessonReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.createLesson(userId, userRole, moduleId, parsed);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.lessonId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.getLesson(userId, userRole, lessonId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.lessonId as string;
      const parsed = updateLessonReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const data = await this.service.updateLesson(userId, userRole, lessonId, parsed);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  reorderLessons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moduleId = req.params.moduleId as string;
      const parsed = reorderLessonsReqSchema.parse(req.body);
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      const orderedIds = await this.service.reorderLessons(userId, userRole, moduleId, parsed.orderedIds);
      res.status(200).json({ data: { orderedIds } });
    } catch (error) {
      next(error);
    }
  };

  deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.lessonId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      await this.service.deleteLesson(userId, userRole, lessonId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  uploadLessonFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.lessonId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role as Role;
      if (!req.file) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Vui lòng đính kèm file tải lên.' } });
        return;
      }
      const data = await this.service.uploadLessonFile(userId, userRole, lessonId, req.file);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };
}

export const adminContentController = new AdminContentController();
