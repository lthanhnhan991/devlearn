import { apiClient } from '@/lib/api-client';
import type {
  AdminCourseRowDto,
  AdminCourseDto,
  CreateCourseReq,
  UpdateCourseReq,
  AdminCourseListQuery,
} from '@/types';

export interface AdminCourseListResponse {
  data: AdminCourseRowDto[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listAdminCourses(query?: AdminCourseListQuery): Promise<AdminCourseListResponse> {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.status) params.set('status', query.status);
  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.sort) params.set('sort', query.sort);

  const queryStr = params.toString();
  const path = queryStr ? `/admin/courses?${queryStr}` : '/admin/courses';
  return apiClient.get<AdminCourseListResponse>(path);
}

export async function createCourse(data: CreateCourseReq): Promise<AdminCourseDto> {
  return apiClient.post<AdminCourseDto>('/admin/courses', data);
}

export async function getAdminCourse(courseId: string): Promise<AdminCourseDto> {
  return apiClient.get<AdminCourseDto>(`/admin/courses/${courseId}`);
}

export async function updateCourse(courseId: string, data: UpdateCourseReq): Promise<AdminCourseDto> {
  return apiClient.patch<AdminCourseDto>(`/admin/courses/${courseId}`, data);
}

export async function updateCourseStatus(
  courseId: string,
  status: 'DRAFT' | 'PUBLISHED',
): Promise<AdminCourseDto> {
  return apiClient.patch<AdminCourseDto>(`/admin/courses/${courseId}/status`, { status });
}

export async function deleteCourse(courseId: string): Promise<void> {
  return apiClient.delete<void>(`/admin/courses/${courseId}`);
}

export const adminCourseService = {
  listAdminCourses,
  createCourse,
  getAdminCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
};
