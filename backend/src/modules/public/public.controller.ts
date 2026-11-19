import type { Request, Response, NextFunction } from 'express';
import { PublicService, publicService as defaultService } from './public.service';

export class PublicController {
  constructor(private readonly service: PublicService = defaultService) {}

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({ data: stats });
    } catch (error) {
      next(error);
    }
  };
}

export const publicController = new PublicController();
