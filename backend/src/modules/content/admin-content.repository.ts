import { prisma } from '../../lib/prisma';
import type { Prisma, ContentType, DocStatus } from '@prisma/client';

export class AdminContentRepository {
  async findCourseOwner(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, title: true },
    });
  }

  async findModuleOwner(moduleId: string) {
    return prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: { select: { id: true, teacherId: true, title: true } } },
    });
  }

  async findLessonOwner(lessonId: string) {
    return prisma.lesson.findUnique({
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
  }

  async findCourseStructure(courseId: string) {
    return prisma.course.findUnique({
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
  }

  async findMaxModulePosition(courseId: string): Promise<number | null> {
    const maxMod = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return maxMod ? maxMod.position : null;
  }

  async createModule(data: { courseId: string; title: string; position: number }) {
    return prisma.module.create({
      data,
      include: {
        lessons: {
          orderBy: { position: 'asc' },
          include: {
            aiDocument: { select: { id: true, status: true } },
          },
        },
      },
    });
  }

  async updateModuleTitle(moduleId: string, title: string) {
    return prisma.module.update({
      where: { id: moduleId },
      data: { title },
      include: {
        lessons: {
          orderBy: { position: 'asc' },
          include: {
            aiDocument: { select: { id: true, status: true } },
          },
        },
      },
    });
  }

  async countModules(courseId: string): Promise<number> {
    return prisma.module.count({ where: { courseId } });
  }

  async reorderModules(orderedIds: string[]): Promise<void> {
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
  }

  async findExamWithAttempts(moduleId: string) {
    return prisma.exam.findFirst({
      where: {
        moduleId,
        attempts: { some: {} },
      },
    });
  }

  async findModuleLessonsWithFiles(moduleId: string) {
    return prisma.lesson.findMany({
      where: { moduleId, filePublicId: { not: null } },
      select: { filePublicId: true, fileUrl: true, contentType: true },
    });
  }

  async deleteModule(moduleId: string): Promise<void> {
    await prisma.module.delete({ where: { id: moduleId } });
  }

  async findMaxLessonPosition(moduleId: string): Promise<number | null> {
    const maxLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return maxLesson ? maxLesson.position : null;
  }

  async createLesson(data: {
    moduleId: string;
    title: string;
    contentType: ContentType;
    fileUrl?: string | null;
    isPublished?: boolean;
    position: number;
  }) {
    return prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        contentType: data.contentType,
        fileUrl: data.fileUrl ?? null,
        isPublished: data.isPublished ?? false,
        position: data.position,
      },
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
    });
  }

  async findLessonById(lessonId: string) {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
    });
  }

  async updateLesson(
    lessonId: string,
    data: {
      title?: string | undefined;
      contentType?: ContentType | undefined;
      fileUrl?: string | null | undefined;
      filePublicId?: string | null | undefined;
      durationSeconds?: number | null | undefined;
      isPublished?: boolean | undefined;
    },
  ) {
    const updateData: Prisma.LessonUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.contentType !== undefined) updateData.contentType = data.contentType;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.filePublicId !== undefined) updateData.filePublicId = data.filePublicId;
    if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    return prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
    });
  }

  async countLessons(moduleId: string): Promise<number> {
    return prisma.lesson.count({ where: { moduleId } });
  }

  async reorderLessons(orderedIds: string[]): Promise<void> {
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
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await prisma.lesson.delete({ where: { id: lessonId } });
  }

  async upsertAiDocument(data: {
    courseId: string;
    lessonId: string;
    userId: string;
    fileName: string;
    fileUrl: string;
    filePublicId: string;
    status: DocStatus;
  }) {
    return prisma.aiDocument.upsert({
      where: { lessonId: data.lessonId },
      create: {
        courseId: data.courseId,
        lessonId: data.lessonId,
        uploadedBy: data.userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        filePublicId: data.filePublicId,
        status: data.status,
      },
      update: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        filePublicId: data.filePublicId,
        status: data.status,
        errorMessage: null,
      },
    });
  }

  async updateLessonFile(
    lessonId: string,
    data: {
      fileUrl: string;
      filePublicId: string;
      durationSeconds: number | null;
    },
  ) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data,
      include: {
        aiDocument: { select: { id: true, status: true } },
      },
    });
  }
}

export const adminContentRepository = new AdminContentRepository();
