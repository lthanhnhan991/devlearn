import { prisma } from '../../lib/prisma';

export class EnrollmentsRepository {
  async findCourse(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    });
  }

  async findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async createEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date(),
      },
    });
  }

  async getFirstPublishedLesson(courseId: string) {
    return prisma.lesson.findFirst({
      where: {
        isPublished: true,
        module: { courseId },
      },
      orderBy: [
        { module: { position: 'asc' } },
        { position: 'asc' },
      ],
      select: { id: true },
    });
  }
}

export const enrollmentsRepository = new EnrollmentsRepository();
