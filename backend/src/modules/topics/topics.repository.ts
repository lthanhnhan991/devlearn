import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

export class TopicsRepository {
  async listActiveTopics() {
    return prisma.topic.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            courses: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });
  }

  async listAdminTopics(filter?: { q?: string | undefined; isActive?: boolean | undefined }) {
    const where: Prisma.TopicWhereInput = {};

    if (filter?.q && filter.q.trim().length > 0) {
      const q = filter.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    return prisma.topic.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.topic.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.topic.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });
  }

  async getMaxDisplayOrder(): Promise<number> {
    const max = await prisma.topic.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    return max?.displayOrder ?? -1;
  }

  async countAllTopics(): Promise<number> {
    return prisma.topic.count();
  }

  async createTopic(data: {
    name: string;
    slug: string;
    description: string;
    color?: string | null;
    icon?: string | null;
    isActive: boolean;
    displayOrder: number;
  }) {
    return prisma.topic.create({
      data,
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async updateTopic(
    id: string,
    data: {
      name?: string;
      description?: string;
      color?: string | null;
      icon?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.topic.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async reorderTopics(orderedIds: string[]) {
    return prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (id) {
          await tx.topic.update({
            where: { id },
            data: { displayOrder: i },
          });
        }
      }
    });
  }

  async countCourses(topicId: string): Promise<number> {
    return prisma.course.count({
      where: { topicId },
    });
  }

  async deleteTopic(id: string) {
    return prisma.topic.delete({
      where: { id },
    });
  }
}

export const topicsRepository = new TopicsRepository();
