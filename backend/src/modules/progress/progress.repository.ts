import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

export class ProgressRepository {
  async findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async findCourseWithStructure(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: 'asc' },
            },
            exams: {
              where: { status: { in: ['OPEN', 'CLOSED'] } },
              include: {
                _count: { select: { questions: true } },
              },
            },
          },
        },
        exams: {
          where: { moduleId: null, status: { in: ['OPEN', 'CLOSED'] } },
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  async findPublishedLessons(courseId: string) {
    return prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: { courseId },
      },
      include: { module: true },
      orderBy: [
        { module: { position: 'asc' } },
        { position: 'asc' },
      ],
    });
  }

  async findCompletedProgress(userId: string, courseId: string) {
    return prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          isPublished: true,
          module: { courseId },
        },
      },
      select: {
        lessonId: true,
        completedAt: true,
      },
    });
  }

  async findLessonWithCourse(lessonId: string) {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async findLessonProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }

  async upsertLessonProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        completedAt: new Date(),
      },
      update: {},
    });
  }

  async updateEnrollmentCompleted(userId: string, courseId: string, completedAt: Date) {
    return prisma.enrollment.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        completedAt,
      },
    });
  }

  async findMyEnrollments(userId: string, status?: 'in-progress' | 'completed') {
    const where: Prisma.EnrollmentWhereInput = {
      userId,
      course: { status: 'PUBLISHED' },
    };

    if (status === 'completed') {
      where.completedAt = { not: null };
    } else if (status === 'in-progress') {
      where.completedAt = null;
    }

    return prisma.enrollment.findMany({
      where,
      include: {
        course: {
          include: {
            topic: true,
            teacher: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: [
        { completedAt: 'desc' },
        { enrolledAt: 'desc' },
      ],
    });
  }

  async countMyEnrollments(userId: string) {
    const [inProgressCount, completedCount] = await Promise.all([
      prisma.enrollment.count({
        where: {
          userId,
          completedAt: null,
          course: { status: 'PUBLISHED' },
        },
      }),
      prisma.enrollment.count({
        where: {
          userId,
          completedAt: { not: null },
          course: { status: 'PUBLISHED' },
        },
      }),
    ]);

    return { inProgressCount, completedCount };
  }

  async findUserAttempts(studentId: string) {
    return prisma.attempt.findMany({
      where: {
        studentId,
      },
      select: {
        examId: true,
        score: true,
      },
    });
  }
}

export const progressRepository = new ProgressRepository();
