import { prisma } from '../../lib/prisma';
import type { Prisma, CourseStatus } from '@prisma/client';

export interface AdminCourseListFilter {
  teacherId?: string | undefined;
  status?: CourseStatus | undefined;
  q?: string | undefined;
  sort?: ('newest' | 'title') | undefined;
  skip: number;
  take: number;
}

export class AdminCoursesRepository {
  async findManyAndCount(params: AdminCourseListFilter) {
    const where: Prisma.CourseWhereInput = {};

    if (params.teacherId) {
      where.teacherId = params.teacherId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.q && params.q.trim().length > 0) {
      where.title = { contains: params.q.trim(), mode: 'insensitive' };
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      params.sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy,
        include: {
          topic: true,
          teacher: { select: { id: true, fullName: true } },
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      }),
    ]);

    return { total, courses };
  }

  async findTopicById(topicId: string) {
    return prisma.topic.findUnique({
      where: { id: topicId },
    });
  }

  async findCourseById(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        topic: true,
        teacher: { select: { id: true, fullName: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async createCourse(data: {
    title: string;
    description: string;
    topicId: string;
    level: string;
    teacherId: string;
    status: CourseStatus;
  }) {
    return prisma.course.create({
      data,
      include: {
        topic: true,
        teacher: { select: { id: true, fullName: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async updateCourse(
    courseId: string,
    data: {
      title?: string | undefined;
      description?: string | undefined;
      topicId?: string | undefined;
      level?: string | undefined;
    },
  ) {
    const updateData: Prisma.CourseUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.topicId !== undefined) {
      updateData.topic = { connect: { id: data.topicId } };
    }
    if (data.level !== undefined) updateData.level = data.level;

    return prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        topic: true,
        teacher: { select: { id: true, fullName: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async countPublishedLessons(courseId: string): Promise<number> {
    return prisma.lesson.count({
      where: {
        isPublished: true,
        module: { courseId },
      },
    });
  }

  async updateCourseStatus(courseId: string, status: CourseStatus) {
    return prisma.course.update({
      where: { id: courseId },
      data: { status },
      include: {
        topic: true,
        teacher: { select: { id: true, fullName: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async findCourseLessonsWithFiles(courseId: string) {
    return prisma.lesson.findMany({
      where: { module: { courseId }, filePublicId: { not: null } },
      select: { filePublicId: true, contentType: true },
    });
  }

  async deleteCourse(courseId: string) {
    return prisma.course.delete({ where: { id: courseId } });
  }
}

export const adminCoursesRepository = new AdminCoursesRepository();
