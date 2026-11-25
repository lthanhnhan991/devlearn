/**
 * ============================================================================
 * MODULE: ADMIN COURSES (Quản lý khóa học - Giảng viên & Quản trị viên)
 * ============================================================================
 * Danh sách API:
 * - GET    /api/v1/admin/courses          : Lấy danh sách khóa học (phân trang, lọc, tìm kiếm)
 * - POST   /api/v1/admin/courses          : Tạo khóa học mới (trạng thái mặc định DRAFT)
 * - GET    /api/v1/admin/courses/:id      : Lấy chi tiết khóa học quản trị
 * - PATCH  /api/v1/admin/courses/:id      : Cập nhật thông tin cơ bản khóa học
 * - PATCH  /api/v1/admin/courses/:id/status: Chuyển đổi trạng thái (DRAFT <-> PUBLISHED)
 * - DELETE /api/v1/admin/courses/:id      : Xóa khóa học (chặn nếu đã có học viên đăng ký)
 * ============================================================================
 */

import { AppError, ERROR_CODES } from '../../types/errors';
import type { Role } from '../../types/constants';
import type {
  AdminCourseRowDto,
  AdminCourseDto,
  CreateCourseReq,
  UpdateCourseReq,
  AdminCourseListQuery,
} from '../../types/dto/admin-course';
import { destroyFromCloudinary } from '../../lib/cloudinary';
import {
  AdminCoursesRepository,
  adminCoursesRepository as defaultRepo,
} from './admin-courses.repository';

export class AdminCoursesService {
  constructor(private readonly repo: AdminCoursesRepository = defaultRepo) {}

  async listCourses(
    userId: string,
    userRole: Role,
    query: AdminCourseListQuery,
  ): Promise<{ data: AdminCourseRowDto[]; meta: { page: number; pageSize: number; total: number; totalPages: number } }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const teacherId = userRole === 'TEACHER' ? userId : undefined;

    const { total, courses } = await this.repo.findManyAndCount({
      teacherId,
      status: query.status,
      q: query.q,
      sort: query.sort,
      skip,
      take: pageSize,
    });

    const data: AdminCourseRowDto[] = courses.map((c) => ({
      id: c.id,
      title: c.title,
      topic: {
        id: c.topic.id,
        name: c.topic.name,
        slug: c.topic.slug,
        color: c.topic.color,
        icon: c.topic.icon,
      },
      topicIsActive: c.topic.isActive,
      level: c.level as AdminCourseRowDto['level'],
      status: c.status,
      teacher: {
        id: c.teacher.id,
        fullName: c.teacher.fullName,
      },
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async createCourse(userId: string, userRole: Role, input: CreateCourseReq): Promise<AdminCourseDto> {
    const topic = await this.repo.findTopicById(input.topicId);
    if (!topic) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy chủ đề.');
    }
    if (!topic.isActive) {
      throw new AppError(ERROR_CODES.TOPIC_INACTIVE, 409, 'Không thể tạo khóa học với chủ đề đang ẩn.');
    }

    const teacherId = userRole === 'ADMIN' && input.teacherId ? input.teacherId : userId;

    const course = await this.repo.createCourse({
      title: input.title.trim(),
      description: input.description ?? '',
      topicId: input.topicId,
      level: input.level,
      teacherId,
      status: 'DRAFT',
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      topic: {
        id: course.topic.id,
        name: course.topic.name,
        slug: course.topic.slug,
        color: course.topic.color,
        icon: course.topic.icon,
      },
      topicIsActive: course.topic.isActive,
      level: course.level as AdminCourseDto['level'],
      status: course.status,
      teacher: {
        id: course.teacher.id,
        fullName: course.teacher.fullName,
      },
      moduleCount: course._count.modules,
      enrollmentCount: course._count.enrollments,
      createdAt: course.createdAt.toISOString(),
    };
  }

  async getCourse(userId: string, userRole: Role, courseId: string): Promise<AdminCourseDto> {
    const course = await this.repo.findCourseById(courseId);

    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }

    if (userRole === 'TEACHER' && course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền xem khóa học này.');
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      topic: {
        id: course.topic.id,
        name: course.topic.name,
        slug: course.topic.slug,
        color: course.topic.color,
        icon: course.topic.icon,
      },
      topicIsActive: course.topic.isActive,
      level: course.level as AdminCourseDto['level'],
      status: course.status,
      teacher: {
        id: course.teacher.id,
        fullName: course.teacher.fullName,
      },
      moduleCount: course._count.modules,
      enrollmentCount: course._count.enrollments,
      createdAt: course.createdAt.toISOString(),
    };
  }

  async updateCourse(
    userId: string,
    userRole: Role,
    courseId: string,
    input: UpdateCourseReq,
  ): Promise<AdminCourseDto> {
    const existing = await this.repo.findCourseById(courseId);
    if (!existing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (userRole === 'TEACHER' && existing.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền sửa khóa học này.');
    }

    if (input.topicId && input.topicId !== existing.topicId) {
      const topic = await this.repo.findTopicById(input.topicId);
      if (!topic) {
        throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy chủ đề.');
      }
      if (!topic.isActive) {
        throw new AppError(ERROR_CODES.TOPIC_INACTIVE, 409, 'Không thể đổi sang chủ đề đang ẩn.');
      }
    }

    const updated = await this.repo.updateCourse(courseId, {
      title: input.title !== undefined ? input.title.trim() : undefined,
      description: input.description,
      topicId: input.topicId,
      level: input.level,
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      topic: {
        id: updated.topic.id,
        name: updated.topic.name,
        slug: updated.topic.slug,
        color: updated.topic.color,
        icon: updated.topic.icon,
      },
      topicIsActive: updated.topic.isActive,
      level: updated.level as AdminCourseDto['level'],
      status: updated.status,
      teacher: {
        id: updated.teacher.id,
        fullName: updated.teacher.fullName,
      },
      moduleCount: updated._count.modules,
      enrollmentCount: updated._count.enrollments,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async updateStatus(
    userId: string,
    userRole: Role,
    courseId: string,
    status: 'DRAFT' | 'PUBLISHED',
  ): Promise<AdminCourseDto> {
    const existing = await this.repo.findCourseById(courseId);
    if (!existing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (userRole === 'TEACHER' && existing.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền đổi trạng thái khóa học này.');
    }

    if (status === 'PUBLISHED') {
      const publishedLessonsCount = await this.repo.countPublishedLessons(courseId);
      if (publishedLessonsCount === 0) {
        throw new AppError(
          ERROR_CODES.COURSE_NOT_READY,
          409,
          'Khóa học cần có ít nhất một bài học đã xuất bản để có thể công khai.',
        );
      }
    }

    const updated = await this.repo.updateCourseStatus(courseId, status);

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      topic: {
        id: updated.topic.id,
        name: updated.topic.name,
        slug: updated.topic.slug,
        color: updated.topic.color,
        icon: updated.topic.icon,
      },
      topicIsActive: updated.topic.isActive,
      level: updated.level as AdminCourseDto['level'],
      status: updated.status,
      teacher: {
        id: updated.teacher.id,
        fullName: updated.teacher.fullName,
      },
      moduleCount: updated._count.modules,
      enrollmentCount: updated._count.enrollments,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteCourse(userId: string, userRole: Role, courseId: string): Promise<void> {
    const existing = await this.repo.findCourseById(courseId);
    if (!existing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (userRole === 'TEACHER' && existing.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền xóa khóa học này.');
    }

    if (existing._count.enrollments > 0) {
      throw new AppError(
        ERROR_CODES.COURSE_HAS_ENROLLMENTS,
        409,
        'Khóa học đã có học viên đăng ký, không thể xóa.',
      );
    }

    // Dọn dẹp file Cloudinary của các bài học (best-effort)
    const lessons = await this.repo.findCourseLessonsWithFiles(courseId);
    for (const l of lessons) {
      if (l.filePublicId) {
        await destroyFromCloudinary(l.filePublicId, l.contentType === 'VIDEO' ? 'video' : 'raw');
      }
    }

    await this.repo.deleteCourse(courseId);
  }
}

export const adminCoursesService = new AdminCoursesService();
