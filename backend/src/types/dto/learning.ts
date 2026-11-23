import { z } from 'zod';
import type { TopicRefDto } from './topic';
import type { ContentType, ExamStatus } from '../constants';

export interface LearnLessonDto {
  id: string;
  title: string;
  contentType: ContentType;
  durationSeconds: number | null;
  position: number;
  isCompleted: boolean;
}

export interface LearnExamDto {
  id: string;
  title: string;
  status: ExamStatus;
  durationMinutes: number;
  passScore: number;
  questionCount: number;
}

export interface LearnModuleDto {
  id: string;
  title: string;
  position: number;
  completedCount: number;
  totalCount: number;
  lessons: LearnLessonDto[];
  exam: LearnExamDto | null;
}

export interface LearnStructureDto {
  course: {
    id: string;
    title: string;
  };
  progressPercent: number;
  modules: LearnModuleDto[];
  finalExam: LearnExamDto | null;
}

export interface LessonContentDto {
  id: string;
  title: string;
  contentType: ContentType;
  fileUrl: string | null;
  durationSeconds: number | null;
  courseId: string;
  moduleId: string;
  isCompleted: boolean;
  prevLessonId: string | null;
  nextLessonId: string | null;
  progressPercent: number;
}

export interface CompleteResultDto {
  lessonId: string;
  completedAt: string;
  progressPercent: number;
  courseCompleted: boolean;
}

export interface MyCourseDto {
  course: {
    id: string;
    title: string;
    topic: TopicRefDto;
    teacher: {
      id: string;
      fullName: string;
    };
  };
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  resumeLessonId: string | null;
}

export interface LearningSummaryDto {
  inProgressCount: number;
  completedCount: number;
  averageExamScore: number | null;
}

export const myCoursesQuerySchema = z.object({
  status: z.enum(['in-progress', 'completed']).optional().default('in-progress'),
});

export type MyCoursesQuery = z.infer<typeof myCoursesQuerySchema>;
