import { PublicRepository, publicRepository as defaultRepo } from './public.repository';
import type { PublicStatsDto } from '../../types/dto/catalog';

export class PublicService {
  private cache: { data: PublicStatsDto; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds (api-catalog)

  constructor(private readonly repo: PublicRepository = defaultRepo) {}

  async getStats(): Promise<PublicStatsDto> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.data;
    }

    const data = await this.repo.getStats();
    this.cache = {
      data,
      expiresAt: now + this.CACHE_TTL_MS,
    };

    return data;
  }
}

export const publicService = new PublicService();
