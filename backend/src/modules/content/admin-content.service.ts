import fs from 'fs';
import { prisma } from '../../lib/prisma';
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
import { uploadToCloudinary, destroyFromCloudinary } from '../../lib/cloudinary';

export class AdminContentService {
  private async assertCourseOwner(userId: string, userRole: Role, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true },
    });
    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (userRole === 'TEACHER' && course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thao tác trên khóa học này.');
    }
    return course;
  }

  private async assertModuleOwner(userId: string, userRole: Role, moduleId: string) {
    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: { select: { id: true, teacherId: true } } },
    });
    if (!mod) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy module.');
    }
    if (userRole === 'TEACHER' && mod.course.teacherId !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403, 'Bạn không có quyền thao tác trên module này.');
    }
    return mod;
  }

  private async assertLessonOwner(userId: string, userRole: Role, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { id: true, title: true, teacherId: true } },
          },
        },
        aiDocument: true,
      },
    });
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              include: {
                aiDocument: {
                  select: { id: true, status: true },
                },
              },
            },
          },
        },
      },
    });

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

    const maxMod = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const position = maxMod ? maxMod.position + 1 : 0;

    const mod = await prisma.module.create({
      data: {
        courseId,
        title: input.title.trim(),
        position,
      },
      include: {
        lessons: true,
      },
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

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
      },
      include: {
        lessons: {
          orderBy: { position: 'asc' },
          include: { aiDocument: { select: { id: true, status: true } } },
        },
      },
    });

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

    const total = await prisma.module.count({ where: { courseId } });
    const uniqueIds = new Set(orderedIds);
    if (orderedIds.length !== total || uniqueIds.size !== total) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, 'Danh sách id phải đủ và đúng tập module của khóa.');
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (id) {
          await tx.module.update({
            where: { id },
            data: { position: i },
          });
        }
      }
    });

    return orderedIds;
  }

  async deleteModule(userId: string, userRole: Role, moduleId: string): Promise<void> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    // Chặn xóa nếu module có bài kiểm tra đã có lượt làm
    const examWithAttempts = await prisma.exam.findFirst({
      where: {
        moduleId,
        attempts: { some: {} },
      },
    });
    if (examWithAttempts) {
      throw new AppError(ERROR_CODES.EXAM_HAS_ATTEMPTS, 409, 'Module có bài kiểm tra đã có lượt làm, không thể xóa.');
    }

    // Xóa file Cloudinary của các bài trong module
    const lessons = await prisma.lesson.findMany({
      where: { moduleId, filePublicId: { not: null } },
      select: { filePublicId: true, contentType: true },
    });
    for (const l of lessons) {
      if (l.filePublicId) {
        await destroyFromCloudinary(l.filePublicId, l.contentType === 'VIDEO' ? 'video' : 'raw');
      }
    }

    await prisma.module.delete({ where: { id: moduleId } });
  }

  // ───────────── Lessons ─────────────
  async createLesson(userId: string, userRole: Role, moduleId: string, input: CreateLessonReq): Promise<AdminLessonDto> {
    await this.assertModuleOwner(userId, userRole, moduleId);

    const maxLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const position = maxLesson ? maxLesson.position + 1 : 0;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: input.title.trim(),
        contentType: input.contentType,
        fileUrl: input.fileUrl ?? null,
        isPublished: input.isPublished ?? false,
        position,
      },
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
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
      aiDocument: lesson.aiDocument ? { id: lesson.aiDocument.id, status: lesson.aiDocument.status } : null,
    };
  }

  async getLesson(userId: string, userRole: Role, lessonId: string): Promise<AdminLessonDto> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

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

  async updateLesson(userId: string, userRole: Role, lessonId: string, input: UpdateLessonReq): Promise<AdminLessonDto> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    if (input.contentType && input.contentType !== lesson.contentType && (lesson.fileUrl || lesson.filePublicId)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        400,
        'Không thể đổi loại nội dung khi bài học đã có file đính kèm. Vui lòng xóa file trước.',
      );
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.contentType !== undefined && { contentType: input.contentType }),
        ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
      },
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
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

    const total = await prisma.lesson.count({ where: { moduleId } });
    const uniqueIds = new Set(orderedIds);
    if (orderedIds.length !== total || uniqueIds.size !== total) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, 'Danh sách id phải đủ và đúng tập bài học của module.');
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (id) {
          await tx.lesson.update({
            where: { id },
            data: { position: i },
          });
        }
      }
    });

    return orderedIds;
  }

  async deleteLesson(userId: string, userRole: Role, lessonId: string): Promise<void> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    if (lesson.filePublicId) {
      await destroyFromCloudinary(lesson.filePublicId, lesson.contentType === 'VIDEO' ? 'video' : 'raw');
    }

    await prisma.lesson.delete({ where: { id: lessonId } });
  }

  async uploadLessonFile(
    userId: string,
    userRole: Role,
    lessonId: string,
    file: Express.Multer.File,
  ): Promise<UploadResultDto> {
    const lesson = await this.assertLessonOwner(userId, userRole, lessonId);

    const isVideo = lesson.contentType === 'VIDEO';
    const isPdf = lesson.contentType === 'PDF';

    if (isVideo && !['video/mp4', 'video/webm'].includes(file.mimetype)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new AppError(ERROR_CODES.UNSUPPORTED_FILE_TYPE, 415, 'Bài học video chỉ chấp nhận file MP4 hoặc WebM.');
    }

    if (isPdf && file.mimetype !== 'application/pdf') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new AppError(ERROR_CODES.UNSUPPORTED_FILE_TYPE, 415, 'Bài học tài liệu chỉ chấp nhận file PDF.');
    }

    const courseId = lesson.module.courseId;
    const folder = `devlearn/courses/${courseId}/lessons`;
    const resourceType = isVideo ? 'video' : 'raw';

    let uploadRes;
    try {
      uploadRes = await uploadToCloudinary(file.path, folder, resourceType);
    } finally {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // Xóa file Cloudinary cũ nếu có
    if (lesson.filePublicId && lesson.filePublicId !== uploadRes.public_id) {
      await destroyFromCloudinary(lesson.filePublicId, resourceType);
    }

    let createdAiDoc = null;

    if (isPdf) {
      // PDF tự động tạo/cập nhật ai_document
      createdAiDoc = await prisma.aiDocument.upsert({
        where: { lessonId: lesson.id },
        create: {
          courseId,
          lessonId: lesson.id,
          uploadedBy: userId,
          fileName: file.originalname,
          fileUrl: uploadRes.secure_url,
          filePublicId: uploadRes.public_id,
          status: 'PENDING',
        },
        update: {
          fileName: file.originalname,
          fileUrl: uploadRes.secure_url,
          filePublicId: uploadRes.public_id,
          status: 'PENDING',
          errorMessage: null,
        },
      });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        fileUrl: uploadRes.secure_url,
        filePublicId: uploadRes.public_id,
        durationSeconds: uploadRes.duration ?? lesson.durationSeconds,
      },
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
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
