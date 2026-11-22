import { z } from 'zod';
import { COURSE_LEVELS } from '../constants';
import { topicRefDtoSchema } from './topic';

export const publicStatsDtoSchema = z.object({
  courseCount: z.number(),
  studentCount: z.number(),
  teacherCount: z.number(),
  completionRate: z.number(),
});
export type PublicStatsDto = z.infer<typeof publicStatsDtoSchema>;

export const personRefDtoSchema = z.object({
  id: z.string(),
  fullName: z.string(),
});
export type PersonRefDto = z.infer<typeof personRefDtoSchema>;

export const courseCardDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: topicRefDtoSchema,
  level: z.enum(COURSE_LEVELS),
  teacher: personRefDtoSchema,
  lessonCount: z.number(),
  totalDurationMinutes: z.number(),
  enrollmentCount: z.number(),
});
export type CourseCardDto = z.infer<typeof courseCardDtoSchema>;

export const courseLessonDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  contentType: z.enum(['VIDEO', 'PDF']),
  durationSeconds: z.number().nullable(),
  position: z.number(),
});
export type CourseLessonDetailDto = z.infer<typeof courseLessonDetailDtoSchema>;

export const courseExamOutlineDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['OPEN', 'CLOSED']),
  durationMinutes: z.number(),
  passScore: z.number(),
  questionCount: z.number(),
});
export type CourseExamOutlineDto = z.infer<typeof courseExamOutlineDtoSchema>;

export const courseModuleDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  lessons: z.array(courseLessonDetailDtoSchema),
  exam: courseExamOutlineDtoSchema.nullable(),
});
export type CourseModuleDetailDto = z.infer<typeof courseModuleDetailDtoSchema>;

export const courseEnrollmentStatusDtoSchema = z.object({
  enrolledAt: z.string(),
  progressPercent: z.number(),
  completedAt: z.string().nullable(),
  resumeLessonId: z.string().nullable(),
});
export type CourseEnrollmentStatusDto = z.infer<typeof courseEnrollmentStatusDtoSchema>;

export const courseDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  topic: topicRefDtoSchema,
  level: z.enum(COURSE_LEVELS),
  teacher: personRefDtoSchema,
  lessonCount: z.number(),
  moduleCount: z.number(),
  examCount: z.number(),
  totalDurationMinutes: z.number(),
  enrollmentCount: z.number(),
  modules: z.array(courseModuleDetailDtoSchema),
  finalExam: courseExamOutlineDtoSchema.nullable(),
  enrollment: courseEnrollmentStatusDtoSchema.nullable(),
});
export type CourseDetailDto = z.infer<typeof courseDetailDtoSchema>;

export const enrollResultDtoSchema = z.object({
  courseId: z.string(),
  enrolledAt: z.string(),
  progressPercent: z.number(),
  resumeLessonId: z.string().nullable(),
});
export type EnrollResultDto = z.infer<typeof enrollResultDtoSchema>;

export const listCoursesQuerySchema = z.object({
  q: z.string().optional(),
  topic: z.union([z.string(), z.array(z.string())]).optional(), // slugs
  level: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.enum(['newest', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
