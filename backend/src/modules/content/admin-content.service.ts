/**
 * ============================================================================
 * MODULE: ADMIN CONTENT (Quản lý Module & Soạn bài học)
 * ============================================================================
 * Danh sách API:
 * - GET    /api/v1/admin/courses/:courseId/structure : Lấy cấu trúc module & bài học của khóa
 * - POST   /api/v1/admin/courses/:courseId/modules   : Tạo module mới trong khóa học
 * - PATCH  /api/v1/admin/modules/:moduleId           : Cập nhật tiêu đề module
 * - PUT    /api/v1/admin/courses/:courseId/modules/order: Sắp xếp lại thứ tự modules
 * - DELETE /api/v1/admin/modules/:moduleId           : Xóa module (chặn nếu bài thi có lượt làm)
 * - POST   /api/v1/admin/modules/:moduleId/lessons   : Tạo bài học mới trong module
 * - GET    /api/v1/admin/lessons/:lessonId           : Lấy chi tiết bài học (soạn & xem trước)
 * - PATCH  /api/v1/admin/lessons/:lessonId           : Cập nhật thông tin/nội dung bài học
 * - PUT    /api/v1/admin/modules/:moduleId/lessons/order: Sắp xếp lại thứ tự bài học trong module
 * - DELETE /api/v1/admin/lessons/:lessonId           : Xóa bài học (kèm dọn tệp Cloudinary)
 * - POST   /api/v1/admin/lessons/:lessonId/upload    : Tải lên video / PDF (tự động nạp AiDocument)
 * ============================================================================
 */

import fs from 'fs';
import { AppError, ERROR_CODES } from '../../types/errors';
import type { Role } from '../../types/constants';
import type {
  AdminCourseStructureDto,
  AdminModuleDto,
  AdminLessonDto,
  CreateModuleReq,
  UpdateModuleReq,
  CreateLessonReq,
  UpdateLessonReq,
  UploadResultDto,
} from '../../types/dto/admin-content';
import {
  uploadToCloudinary,
  destroyFromCloudinary,
  resolveCloudinaryResourceType,
} from '../../lib/cloudinary';
import {
  AdminContentRepository,
  adminContentRepository as defaultRepo,
} from './admin-content.repository';

export class AdminContentService {
  constructor(private readonly repo: AdminContentRepository = defaultRepo) {}

  private async assertCourseOwner(userId: string, userRole: Role, courseId: string) {
    const course = await this.repo.findCourseOwner(courseId);
    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (userRole === 'TEACHER' && course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thao tác trên khóa học này.');
    }
    return course;
  }

  private async assertModuleOwner(userId: string, userRole: Role, moduleId: string) {
    const mod = await this.repo.findModuleOwner(moduleId);
    if (!mod) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy module.');
    }
    if (userRole === 'TEACHER' && mod.course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thao tác trên module này.');
    }
    return mod;
  }

  private async assertLessonOwner(userId: string, userRole: Role, lessonId: string) {
    const lesson = await this.repo.findLessonOwner(lessonId);
    if (!lesson) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy bài học.');
    }
    if (userRole === 'TEACHER' && lesson.module.course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thao tác trên bài học này.');
    }
    return lesson;
  }

  // ───────────── Structure ─────────────
  async getCourseStructure(userId: string, userRole: Role, courseId: string): Promise<AdminCourseStructureDto> {
    await this.assertCourseOwner(userId, userRole, courseId);

    const course = await this.repo.findCourseStructure(courseId);
    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }

    const modules: AdminModuleDto[] = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      position: m.position,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        moduleId: l.moduleId,
        title: l.title,
        contentType: l.contentType,
        fileUrl: l.fileUrl,
        durationSeconds: l.durationSeconds,
        position: l.position,
        isPublished: l.isPublished,
        aiDocument: l.aiDocument ? { id: l.aiDocument.id, status: l.aiDocument.status } : null,
      })),
    }));

    return {
      course: {
        id: course.id,
        title: course.title,
        status: course.status,
      },
      modules,
    };
  }

  // ───────────── Modules ─────────────
  async createModule(userId: string, userRole: Role, courseId: string, input: CreateModuleReq): Promise<AdminModuleDto> {
    await this.assertCourseOwner(userId, userRole, courseId);

    const maxPos = await this.repo.findMaxModulePosition(courseId);
    const position = maxPos !== null ? maxPos + 1 : 0;

    const mod = await this.repo.createModule({
      courseId,
      title: input.title.trim(),
      position,
    });

    return {
      id: mod.id,
      title: mod.title,
      position: mod.position,
      lessons: [],
    };
  }

  async updateModule(userId: string, userRole: Role, moduleId: string, input: UpdateModuleReq): Promise<AdminModuleDto> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    const updated = await this.repo.updateModuleTitle(moduleId, input.title.trim());

    return {
      id: updated.id,
      title: updated.title,
      position: updated.position,
      lessons: updated.lessons.map((l) => ({
        id: l.id,
        moduleId: l.moduleId,
        title: l.title,
        contentType: l.contentType,
        fileUrl: l.fileUrl,
        durationSeconds: l.durationSeconds,
        position: l.position,
        isPublished: l.isPublished,
        aiDocument: l.aiDocument ? { id: l.aiDocument.id, status: l.aiDocument.status } : null,
      })),
    };
  }

  async reorderModules(userId: string, userRole: Role, courseId: string, orderedIds: string[]): Promise<string[]> {
    await this.assertCourseOwner(userId, userRole, courseId);

    const total = await this.repo.countModules(courseId);
    const uniqueIds = new Set(orderedIds);
    if (orderedIds.length !== total || uniqueIds.size !== total) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, 'Danh sách id phải đủ và đúng tập modules của khóa học.');
    }

    await this.repo.reorderModules(orderedIds);
    return orderedIds;
  }

  async deleteModule(userId: string, userRole: Role, moduleId: string): Promise<void> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    // Chặn xóa nếu module có bài kiểm tra đã có lượt làm
    const examWithAttempts = await this.repo.findExamWithAttempts(moduleId);
    if (examWithAttempts) {
      throw new AppError(ERROR_CODES.EXAM_HAS_ATTEMPTS, 409, 'Module có bài kiểm tra đã có lượt làm, không thể xóa.');
    }

    // Xóa file Cloudinary của các bài trong module (best-effort)
    const lessons = await this.repo.findModuleLessonsWithFiles(moduleId);
    for (const l of lessons) {
      if (l.filePublicId) {
        await destroyFromCloudinary(l.filePublicId, resolveCloudinaryResourceType(l.fileUrl, l.contentType));
      }
    }

    await this.repo.deleteModule(moduleId);
  }

  // ───────────── Lessons ─────────────
  async createLesson(userId: string, userRole: Role, moduleId: string, input: CreateLessonReq): Promise<AdminLessonDto> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    const maxPos = await this.repo.findMaxLessonPosition(moduleId);
    const position = maxPos !== null ? maxPos + 1 : 0;

    const lesson = await this.repo.createLesson({
      moduleId,
      title: input.title.trim(),
      contentType: input.contentType,
      fileUrl: input.fileUrl ?? null,
      isPublished: input.isPublished ?? false,
      position,
    });

    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      contentType: lesson.contentType,
      fileUrl: lesson.fileUrl,
      durationSeconds: lesson.durationSeconds,
      position: lesson.position,
      isPublished: lesson.isPublished,
      aiDocument: null,
    };
  }

  async getLesson(userId: string, userRole: Role, lessonId: string): Promise<AdminLessonDto> {
    await this.assertLessonOwner(userId, userRole, lessonId);

    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy bài học.');
    }

    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      contentType: lesson.contentType,
      fileUrl: lesson.fileUrl,
      durationSeconds: lesson.durationSeconds,
      position: lesson.position,
      isPublished: lesson.isPublished,
      aiDocument: lesson.aiDocument ? { id: lesson.aiDocument.id, status: lesson.aiDocument.status } : null,
    };
  }

  async updateLesson(
    userId: string,
    userRole: Role,
    lessonId: string,
    input: UpdateLessonReq,
  ): Promise<AdminLessonDto> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    let newFilePublicId: string | null | undefined = undefined;
    let newDurationSeconds: number | null | undefined = undefined;

    // Khi gỡ tệp khỏi bài học (fileUrl truyền vào null hoặc rỗng) hoặc đổi sang URL khác
    if (input.fileUrl !== undefined) {
      const isRemoving = input.fileUrl === null || input.fileUrl.trim() === '';

      if (isRemoving) {
        if (lesson.filePublicId) {
          const resourceType = resolveCloudinaryResourceType(lesson.fileUrl, lesson.contentType);
          await destroyFromCloudinary(lesson.filePublicId, resourceType);
        }
        newFilePublicId = null;
        newDurationSeconds = null;
      } else if (lesson.filePublicId && input.fileUrl !== lesson.fileUrl) {
        // Đổi sang fileUrl khác (ví dụ link youtube thay cho file upload trước đó)
        const resourceType = resolveCloudinaryResourceType(lesson.fileUrl, lesson.contentType);
        await destroyFromCloudinary(lesson.filePublicId, resourceType);
        newFilePublicId = null;
      }
    }

    const updated = await this.repo.updateLesson(lessonId, {
      title: input.title !== undefined ? input.title.trim() : undefined,
      contentType: input.contentType,
      fileUrl: input.fileUrl !== undefined && input.fileUrl !== null && input.fileUrl.trim() === '' ? null : input.fileUrl,
      filePublicId: newFilePublicId,
      durationSeconds: newDurationSeconds,
      isPublished: input.isPublished,
    });

    return {
      id: updated.id,
      moduleId: updated.moduleId,
      title: updated.title,
      contentType: updated.contentType,
      fileUrl: updated.fileUrl,
      durationSeconds: updated.durationSeconds,
      position: updated.position,
      isPublished: updated.isPublished,
      aiDocument: updated.aiDocument ? { id: updated.aiDocument.id, status: updated.aiDocument.status } : null,
    };
  }

  async reorderLessons(userId: string, userRole: Role, moduleId: string, orderedIds: string[]): Promise<string[]> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    const total = await this.repo.countLessons(moduleId);
    const uniqueIds = new Set(orderedIds);
    if (orderedIds.length !== total || uniqueIds.size !== total) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, 'Danh sách id phải đủ và đúng tập bài học của module.');
    }

    await this.repo.reorderLessons(orderedIds);
    return orderedIds;
  }

  async deleteLesson(userId: string, userRole: Role, lessonId: string): Promise<void> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    if (lesson.filePublicId) {
      await destroyFromCloudinary(
        lesson.filePublicId,
        resolveCloudinaryResourceType(lesson.fileUrl, lesson.contentType),
      );
    }

    await this.repo.deleteLesson(lessonId);
  }

  async uploadLessonFile(
    userId: string,
    userRole: Role,
    lessonId: string,
    file: Express.Multer.File,
  ): Promise<UploadResultDto> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    const isVideo = lesson.contentType === 'VIDEO';
    const folder = isVideo ? 'devlearn/videos' : 'devlearn/documents';
    const resourceType = isVideo ? 'video' : 'image';

    // Xóa file cũ nếu có (dựa theo URL thực tế để xóa đúng cả file raw cũ lẫn image/video mới)
    if (lesson.filePublicId) {
      await destroyFromCloudinary(
        lesson.filePublicId,
        resolveCloudinaryResourceType(lesson.fileUrl, lesson.contentType),
      );
    }

    // Upload lên Cloudinary (PDF upload dưới resource_type 'image' + format 'pdf' để xem inline được)
    let uploadRes;
    try {
      uploadRes = await uploadToCloudinary(file.path, folder, resourceType, isVideo ? undefined : 'pdf');
    } finally {
      // Dọn tệp tạm trên đĩa
      fs.unlink(file.path, () => {});
    }

    // Nếu là PDF, tự động nạp hoặc cập nhật bản ghi ai_documents
    let createdAiDoc = null;
    if (!isVideo) {
      createdAiDoc = await this.repo.upsertAiDocument({
        courseId: lesson.module.course.id,
        lessonId: lesson.id,
        userId,
        fileName: file.originalname,
        fileUrl: uploadRes.secure_url,
        filePublicId: uploadRes.public_id,
        status: 'PENDING',
      });
    }

    const updatedLesson = await this.repo.updateLessonFile(lessonId, {
      fileUrl: uploadRes.secure_url,
      filePublicId: uploadRes.public_id,
      durationSeconds: uploadRes.duration ?? lesson.durationSeconds,
    });

    return {
      lesson: {
        id: updatedLesson.id,
        moduleId: updatedLesson.moduleId,
        title: updatedLesson.title,
        contentType: updatedLesson.contentType,
        fileUrl: updatedLesson.fileUrl,
        durationSeconds: updatedLesson.durationSeconds,
        position: updatedLesson.position,
        isPublished: updatedLesson.isPublished,
        aiDocument: updatedLesson.aiDocument ? { id: updatedLesson.aiDocument.id, status: updatedLesson.aiDocument.status } : null,
      },
      aiDocument: createdAiDoc
        ? {
            id: createdAiDoc.id,
            courseId: createdAiDoc.courseId,
            courseTitle: lesson.module.course.title,
            lessonId: lesson.id,
            fileName: createdAiDoc.fileName,
            fileUrl: createdAiDoc.fileUrl,
            status: createdAiDoc.status,
            errorMessage: createdAiDoc.errorMessage,
            uploadedAt: createdAiDoc.uploadedAt.toISOString(),
          }
        : null,
    };
  }
}

export const adminContentService = new AdminContentService();
