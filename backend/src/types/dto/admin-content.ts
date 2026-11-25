import { z } from 'zod';
import type { ContentType, DocStatus } from '../constants';
import { CONTENT_TYPES } from '../constants';

export interface AdminLessonDto {
  id: string;
  moduleId: string;
  title: string;
  contentType: ContentType;
  fileUrl: string | null;
  durationSeconds: number | null;
  position: number;
  isPublished: boolean;
  aiDocument: {
    id: string;
    status: DocStatus;
  } | null;
}

export interface AdminModuleDto {
  id: string;
  title: string;
  position: number;
  lessons: AdminLessonDto[];
}

export interface AdminCourseStructureDto {
  course: {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED';
  };
  modules: AdminModuleDto[];
}

export const createModuleReqSchema = z.object({
  title: z.string().trim().min(1, 'Tên module không được để trống.').max(200, 'Tên module tối đa 200 ký tự.'),
});

export type CreateModuleReq = z.infer<typeof createModuleReqSchema>;

export const updateModuleReqSchema = z.object({
  title: z.string().trim().min(1, 'Tên module không được để trống.').max(200, 'Tên module tối đa 200 ký tự.'),
});

export type UpdateModuleReq = z.infer<typeof updateModuleReqSchema>;

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const reorderModulesReqSchema = z.object({
  orderedIds: z.array(z.string().regex(UUID_REGEX, 'ID module không hợp lệ.')),
});

export type ReorderModulesReq = z.infer<typeof reorderModulesReqSchema>;

export const createLessonReqSchema = z.object({
  title: z.string().trim().min(1, 'Tên bài học không được để trống.').max(200, 'Tên bài học tối đa 200 ký tự.'),
  contentType: z.enum(CONTENT_TYPES),
  fileUrl: z.string().url('URL không hợp lệ.').optional().nullable(),
  isPublished: z.boolean().optional().default(false),
});

export type CreateLessonReq = z.infer<typeof createLessonReqSchema>;

export const updateLessonReqSchema = z.object({
  title: z.string().trim().min(1, 'Tên bài học không được để trống.').max(200).optional(),
  contentType: z.enum(CONTENT_TYPES).optional(),
  fileUrl: z.string().url('URL không hợp lệ.').optional().nullable(),
  isPublished: z.boolean().optional(),
});

export type UpdateLessonReq = z.infer<typeof updateLessonReqSchema>;

export const reorderLessonsReqSchema = z.object({
  orderedIds: z.array(z.string().regex(UUID_REGEX, 'ID bài học không hợp lệ.')),
});

export type ReorderLessonsReq = z.infer<typeof reorderLessonsReqSchema>;

export interface UploadResultDto {
  lesson: AdminLessonDto;
  aiDocument: {
    id: string;
    courseId: string;
    courseTitle: string;
    lessonId: string;
    fileName: string;
    fileUrl: string;
    status: DocStatus;
    errorMessage: string | null;
    uploadedAt: string;
  } | null;
}
