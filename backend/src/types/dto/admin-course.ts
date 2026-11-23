import { z } from 'zod';
import type { TopicRefDto } from './topic';
import type { CourseLevel } from '../constants';
import { COURSE_LEVELS } from '../constants';

export interface AdminCourseRowDto {
  id: string;
  title: string;
  topic: TopicRefDto;
  topicIsActive: boolean;
  level: CourseLevel;
  status: 'DRAFT' | 'PUBLISHED';
  teacher: {
    id: string;
    fullName: string;
  };
  moduleCount: number;
  enrollmentCount: number;
  createdAt: string;
}

export interface AdminCourseDto extends AdminCourseRowDto {
  description: string;
}

export const createCourseReqSchema = z.object({
  title: z.string().trim().min(3, 'Tên khóa học phải từ 3 đến 200 ký tự.').max(200, 'Tên khóa học tối đa 200 ký tự.'),
  description: z.string().default(''),
  topicId: z.string().uuid('ID chủ đề không hợp lệ.'),
  level: z.enum(COURSE_LEVELS),
  teacherId: z.string().uuid().optional(),
});

export type CreateCourseReq = z.infer<typeof createCourseReqSchema>;

export const updateCourseReqSchema = z.object({
  title: z.string().trim().min(3, 'Tên khóa học phải từ 3 đến 200 ký tự.').max(200).optional(),
  description: z.string().optional(),
  topicId: z.string().uuid('ID chủ đề không hợp lệ.').optional(),
  level: z.enum(COURSE_LEVELS).optional(),
});

export type UpdateCourseReq = z.infer<typeof updateCourseReqSchema>;

export const updateCourseStatusReqSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export type UpdateCourseStatusReq = z.infer<typeof updateCourseStatusReqSchema>;

export const adminCourseListQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(['newest', 'title']).optional().default('newest'),
});

export type AdminCourseListQuery = z.infer<typeof adminCourseListQuerySchema>;
