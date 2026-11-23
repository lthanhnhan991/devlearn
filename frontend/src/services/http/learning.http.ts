import { apiClient } from '@/lib/api-client';
import type {
  LearnStructureDto,
  LessonContentDto,
  CompleteResultDto,
  MyCourseDto,
  LearningSummaryDto,
} from '@/types';

export async function getLearnStructure(courseId: string): Promise<LearnStructureDto> {
  return apiClient.get<LearnStructureDto>(`/courses/${courseId}/learn`);
}

export async function getLesson(lessonId: string): Promise<LessonContentDto> {
  return apiClient.get<LessonContentDto>(`/lessons/${lessonId}`);
}

export async function completeLesson(lessonId: string): Promise<CompleteResultDto> {
  return apiClient.post<CompleteResultDto>(`/lessons/${lessonId}/complete`);
}

export async function getMyCourses(status?: 'in-progress' | 'completed'): Promise<MyCourseDto[]> {
  const queryStr = status ? `?status=${status}` : '';
  return apiClient.get<MyCourseDto[]>(`/me/courses${queryStr}`);
}

export async function getLearningSummary(): Promise<LearningSummaryDto> {
  return apiClient.get<LearningSummaryDto>('/me/learning-summary');
}

export const learningService = {
  getLearnStructure,
  getLesson,
  completeLesson,
  getMyCourses,
  getLearningSummary,
};
