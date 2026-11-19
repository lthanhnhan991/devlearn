import { apiClient } from '@/lib/api-client';
import type {
  PublicStatsDto,
  CourseCardDto,
  CourseDetailDto,
  EnrollResultDto,
  ListCoursesQuery,
} from '@/types';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CourseListResponse {
  data: CourseCardDto[];
  meta: PaginationMeta;
}

export async function getPublicStats(): Promise<PublicStatsDto> {
  return apiClient.get<PublicStatsDto>('/public/stats');
}

export async function listCourses(query?: Partial<ListCoursesQuery>): Promise<CourseListResponse> {
  const searchParams = new URLSearchParams();
  if (query?.q) searchParams.set('q', query.q);
  if (query?.sort) searchParams.set('sort', query.sort);
  if (query?.page) searchParams.set('page', query.page.toString());
  if (query?.pageSize) searchParams.set('pageSize', query.pageSize.toString());

  if (query?.topic) {
    const topics = Array.isArray(query.topic) ? query.topic : [query.topic];
    topics.forEach((t) => searchParams.append('topic', t));
  }

  if (query?.level) {
    const levels = Array.isArray(query.level) ? query.level : [query.level];
    levels.forEach((l) => searchParams.append('level', l));
  }

  const queryStr = searchParams.toString();
  const path = queryStr ? `/courses?${queryStr}` : '/courses';

  return apiClient.getWithMeta<CourseCardDto[], PaginationMeta>(path);
}

export async function getCourseDetail(courseId: string): Promise<CourseDetailDto> {
  return apiClient.get<CourseDetailDto>(`/courses/${courseId}`);
}

export async function enrollCourse(courseId: string): Promise<EnrollResultDto> {
  return apiClient.post<EnrollResultDto>(`/courses/${courseId}/enroll`);
}

export const catalogService = {
  getPublicStats,
  listCourses,
  getCourseDetail,
  enrollCourse,
};
