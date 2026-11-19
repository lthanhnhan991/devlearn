import {
  EnrollmentsRepository,
  enrollmentsRepository as defaultRepo,
} from './enrollments.repository';
import { AppError, ERROR_CODES } from '../../types/errors';
import type { EnrollResultDto } from '../../types/dto/catalog';

export class EnrollmentsService {
  constructor(private readonly repo: EnrollmentsRepository = defaultRepo) {}

  async enroll(userId: string, userRole: string, courseId: string): Promise<EnrollResultDto> {
    if (userRole !== 'STUDENT') {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        403,
        'Chỉ tài khoản sinh viên mới được đăng ký học khóa học.',
      );
    }

    const course = await this.repo.findCourse(courseId);
    if (!course || course.status !== 'PUBLISHED') {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Khóa học không tồn tại hoặc chưa xuất bản.');
    }

    const existing = await this.repo.findEnrollment(userId, courseId);
    if (existing) {
      throw new AppError(
        ERROR_CODES.ALREADY_ENROLLED,
        409,
        'Bạn đã đăng ký khóa học này rồi.',
      );
    }

    const enrollment = await this.repo.createEnrollment(userId, courseId);
    const firstLesson = await this.repo.getFirstPublishedLesson(courseId);

    return {
      courseId,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      progressPercent: 0,
      resumeLessonId: firstLesson?.id ?? null,
    };
  }
}

export const enrollmentsService = new EnrollmentsService();
