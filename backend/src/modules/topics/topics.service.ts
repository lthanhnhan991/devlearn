import { TopicsRepository, topicsRepository as defaultRepo } from './topics.repository';
import { AppError, ERROR_CODES } from '../../types/errors';
import type { TopicDto } from '../../types/dto/topic';
import type {
  AdminTopicDto,
  CreateTopicReq,
  UpdateTopicReq,
} from '../../types/dto/admin-topic';

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class TopicsService {
  constructor(private readonly repo: TopicsRepository = defaultRepo) {}

  async listPublicTopics(): Promise<TopicDto[]> {
    const list = await this.repo.listActiveTopics();
    return list.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      color: t.color,
      icon: t.icon,
      courseCount: t._count.courses,
    }));
  }

  async listAdminTopics(filter?: {
    q?: string | undefined;
    isActive?: boolean | undefined;
  }): Promise<AdminTopicDto[]> {
    const list = await this.repo.listAdminTopics(filter);
    return list.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      color: t.color,
      icon: t.icon,
      isActive: t.isActive,
      displayOrder: t.displayOrder,
      courseCount: t._count.courses,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async createTopic(input: CreateTopicReq): Promise<AdminTopicDto> {
    const name = input.name.trim();
    const slug = input.slug && input.slug.trim().length > 0 ? input.slug.trim().toLowerCase() : slugify(name);

    if (!slug) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, 'Không thể tạo slug từ tên chủ đề.');
    }

    const existingName = await this.repo.findByName(name);
    if (existingName) {
      throw new AppError(ERROR_CODES.TOPIC_NAME_TAKEN, 409, 'Tên chủ đề đã tồn tại trong hệ thống.');
    }

    const existingSlug = await this.repo.findBySlug(slug);
    if (existingSlug) {
      throw new AppError(ERROR_CODES.TOPIC_SLUG_TAKEN, 409, 'Slug chủ đề đã tồn tại trong hệ thống.');
    }

    const maxOrder = await this.repo.getMaxDisplayOrder();
    const displayOrder = maxOrder + 1;

    const topic = await this.repo.createTopic({
      name,
      slug,
      description: input.description ?? '',
      color: input.color ?? null,
      icon: input.icon ?? null,
      isActive: input.isActive ?? true,
      displayOrder,
    });

    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      color: topic.color,
      icon: topic.icon,
      isActive: topic.isActive,
      displayOrder: topic.displayOrder,
      courseCount: topic._count.courses,
      createdAt: topic.createdAt.toISOString(),
    };
  }

  async updateTopic(id: string, input: UpdateTopicReq): Promise<AdminTopicDto> {
    const topic = await this.repo.findById(id);
    if (!topic) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy chủ đề.');
    }

    const data: {
      name?: string;
      description?: string;
      color?: string | null;
      icon?: string | null;
      isActive?: boolean;
    } = {};

    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (trimmed.toLowerCase() !== topic.name.toLowerCase()) {
        const existingName = await this.repo.findByName(trimmed);
        if (existingName && existingName.id !== id) {
          throw new AppError(ERROR_CODES.TOPIC_NAME_TAKEN, 409, 'Tên chủ đề đã tồn tại trong hệ thống.');
        }
      }
      data.name = trimmed;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }
    if (input.color !== undefined) {
      data.color = input.color;
    }
    if (input.icon !== undefined) {
      data.icon = input.icon;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    const updated = await this.repo.updateTopic(id, data);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      color: updated.color,
      icon: updated.icon,
      isActive: updated.isActive,
      displayOrder: updated.displayOrder,
      courseCount: updated._count.courses,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async reorderTopics(orderedIds: string[]): Promise<string[]> {
    const totalCount = await this.repo.countAllTopics();
    const uniqueIds = new Set(orderedIds);

    if (orderedIds.length !== totalCount || uniqueIds.size !== totalCount) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        400,
        'Danh sách id phải đủ và đúng tập mọi chủ đề trong hệ thống.',
      );
    }

    await this.repo.reorderTopics(orderedIds);
    return orderedIds;
  }

  async deleteTopic(id: string, userRole: string): Promise<void> {
    if (userRole !== 'ADMIN') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Chỉ Quản trị viên mới có quyền xóa chủ đề.');
    }

    const topic = await this.repo.findById(id);
    if (!topic) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy chủ đề.');
    }

    const courseCount = await this.repo.countCourses(id);
    if (courseCount > 0) {
      throw new AppError(
        ERROR_CODES.TOPIC_IN_USE,
        409,
        `Chủ đề đang có ${courseCount} khóa học tham chiếu, không thể xóa.`,
      );
    }

    await this.repo.deleteTopic(id);
  }
}

export const topicsService = new TopicsService();
