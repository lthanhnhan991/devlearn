import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

export interface ListCoursesParams {
  q?: string;
  topics?: string[];
  levels?: string[];
  sort?: 'newest' | 'popular';
  skip: number;
  take: number;
}

export class CoursesRepository {
  async listCourses(params: ListCoursesParams) {
    const where: Prisma.CourseWhereInput = {
      status: 'PUBLISHED',
    };

    if (params.q && params.q.trim().length > 0) {
      where.title = {
        contains: params.q.trim(),
        mode: 'insensitive',
      };
    }

    if (params.topics && params.topics.length > 0) {
      where.topic = {
        in: params.topics,
      };
    }

    if (params.levels && params.levels.length > 0) {
      where.level = {
        in: params.levels,
      };
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      params.sort === 'popular'
        ? { enrollments: { _count: 'desc' } }
        : { createdAt: 'desc' };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy,
        skip: params.skip,
        take: params.take,
        include: {
          teacher: {
            select: { id: true, fullName: true },
          },
          modules: {
            include: {
              lessons: {
                where: { isPublished: true },
                select: { durationSeconds: true },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      }),
    ]);

    return { total, courses };
  }

  async findPublishedCourseById(id: string) {
    return prisma.course.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        teacher: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { enrollments: true },
        },
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                contentType: true,
                durationSeconds: true,
                position: true,
              },
            },
            exams: {
              where: { status: { in: ['OPEN', 'CLOSED'] } },
              select: {
                id: true,
                title: true,
                status: true,
                durationMinutes: true,
                passScore: true,
                _count: { select: { questions: true } },
              },
            },
          },
        },
        exams: {
          where: {
            moduleId: null,
            status: { in: ['OPEN', 'CLOSED'] },
          },
          select: {
            id: true,
            title: true,
            status: true,
            durationMinutes: true,
            passScore: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  async findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async getCompletedLessonsCount(userId: string, courseId: string) {
    return prisma.lessonProgress.count({
      where: {
        userId,
        lesson: {
          isPublished: true,
          module: { courseId },
        },
      },
    });
  }

  async getPublishedLessons(courseId: string) {
    return prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: { courseId },
      },
      orderBy: [
        { module: { position: 'asc' } },
        { position: 'asc' },
      ],
      select: {
        id: true,
      },
    });
  }

  async getCompletedLessonIds(userId: string, courseId: string): Promise<Set<string>> {
    const list = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          isPublished: true,
          module: { courseId },
        },
      },
      select: { lessonId: true },
    });
    return new Set(list.map((item) => item.lessonId));
  }
}

export const coursesRepository = new CoursesRepository();
