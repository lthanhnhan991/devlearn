import type { Request, Response, NextFunction } from 'express';
import { TopicsService, topicsService as defaultService } from './topics.service';
import {
  createTopicReqSchema,
  updateTopicReqSchema,
  reorderTopicsReqSchema,
} from '../../types/dto/admin-topic';

export class TopicsController {
  constructor(private readonly service: TopicsService = defaultService) {}

  listPublicTopics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listPublicTopics();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  listAdminTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const isActive =
        req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const data = await this.service.listAdminTopics({ q, isActive });
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  createTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTopicReqSchema.parse(req.body);
      const data = await this.service.createTopic(parsed);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topicId = req.params.id as string;
      const parsed = updateTopicReqSchema.parse(req.body);
      const data = await this.service.updateTopic(topicId, parsed);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  reorderTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = reorderTopicsReqSchema.parse(req.body);
      const orderedIds = await this.service.reorderTopics(parsed.orderedIds);
      res.status(200).json({ data: { orderedIds } });
    } catch (error) {
      next(error);
    }
  };

  deleteTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topicId = req.params.id as string;
      const userRole = req.user?.role ?? '';
      await this.service.deleteTopic(topicId, userRole);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const topicsController = new TopicsController();
