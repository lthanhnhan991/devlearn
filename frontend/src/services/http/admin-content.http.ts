import { apiClient } from '@/lib/api-client';
import type {
  AdminCourseStructureDto,
  AdminModuleDto,
  AdminLessonDto,
  CreateModuleReq,
  UpdateModuleReq,
  CreateLessonReq,
  UpdateLessonReq,
  UploadResultDto,
} from '@/types';

export async function getCourseStructure(courseId: string): Promise<AdminCourseStructureDto> {
  return apiClient.get<AdminCourseStructureDto>(`/admin/courses/${courseId}/structure`);
}

export async function createModule(courseId: string, data: CreateModuleReq): Promise<AdminModuleDto> {
  return apiClient.post<AdminModuleDto>(`/admin/courses/${courseId}/modules`, data);
}

export async function updateModule(moduleId: string, data: UpdateModuleReq): Promise<AdminModuleDto> {
  return apiClient.patch<AdminModuleDto>(`/admin/modules/${moduleId}`, data);
}

export async function reorderModules(
  courseId: string,
  orderedIds: string[],
): Promise<{ orderedIds: string[] }> {
  return apiClient.put<{ orderedIds: string[] }>(`/admin/courses/${courseId}/modules/order`, { orderedIds });
}

export async function deleteModule(moduleId: string): Promise<void> {
  return apiClient.delete<void>(`/admin/modules/${moduleId}`);
}

export async function createLesson(moduleId: string, data: CreateLessonReq): Promise<AdminLessonDto> {
  return apiClient.post<AdminLessonDto>(`/admin/modules/${moduleId}/lessons`, data);
}

export async function getAdminLesson(lessonId: string): Promise<AdminLessonDto> {
  return apiClient.get<AdminLessonDto>(`/admin/lessons/${lessonId}`);
}

export async function updateLesson(lessonId: string, data: UpdateLessonReq): Promise<AdminLessonDto> {
  return apiClient.patch<AdminLessonDto>(`/admin/lessons/${lessonId}`, data);
}

export async function reorderLessons(
  moduleId: string,
  orderedIds: string[],
): Promise<{ orderedIds: string[] }> {
  return apiClient.put<{ orderedIds: string[] }>(`/admin/modules/${moduleId}/lessons/order`, { orderedIds });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return apiClient.delete<void>(`/admin/lessons/${lessonId}`);
}

export async function uploadLessonFile(
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResultDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
    xhr.open('POST', `${baseUrl}/admin/lessons/${lessonId}/upload`);
    xhr.withCredentials = true;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.data);
        } catch {
          reject(new Error('Phản hồi từ server không hợp lệ.'));
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          reject(new Error(res.error?.message || 'Tải file thất bại.'));
        } catch {
          reject(new Error(`Tải file thất bại với mã lỗi ${xhr.status}.`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Lỗi kết nối mạng khi tải file.'));
    };

    xhr.send(formData);
  });
}

export const adminContentService = {
  getCourseStructure,
  createModule,
  updateModule,
  reorderModules,
  deleteModule,
  createLesson,
  getAdminLesson,
  updateLesson,
  reorderLessons,
  deleteLesson,
  uploadLessonFile,
};
