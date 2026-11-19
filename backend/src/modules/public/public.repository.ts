import { prisma } from '../../lib/prisma';

export class PublicRepository {
  async getStats() {
    const [courseCount, studentCount, teacherCount, totalEnrollments, completedEnrollments] =
      await Promise.all([
        prisma.course.count({
          where: { status: 'PUBLISHED' },
        }),
        prisma.user.count({
          where: { role: 'STUDENT' },
        }),
        prisma.user.count({
          where: { role: 'TEACHER' },
        }),
        prisma.enrollment.count(),
        prisma.enrollment.count({
          where: { completedAt: { not: null } },
        }),
      ]);

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100 * 10) / 10
        : 0;

    return {
      courseCount,
      studentCount,
      teacherCount,
      completionRate,
    };
  }
}

export const publicRepository = new PublicRepository();
