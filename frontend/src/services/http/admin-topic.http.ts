import { apiClient } from '@/lib/api-client';
import type {
  AdminTopicDto,
  CreateTopicReq,
  UpdateTopicReq,
} from '@/types';

export async function listAdminTopics(filter?: {
  q?: string;
  isActive?: boolean;
}): Promise<AdminTopicDto[]> {
  const searchParams = new URLSearchParams();
  if (filter?.q) searchParams.set('q', filter.q);
  if (filter?.isActive !== undefined) searchParams.set('isActive', String(filter.isActive));

  const queryStr = searchParams.toString();
  const path = queryStr ? `/admin/topics?${queryStr}` : '/admin/topics';

  return apiClient.get<AdminTopicDto[]>(path);
}

export async function createTopic(data: CreateTopicReq): Promise<AdminTopicDto> {
  return apiClient.post<AdminTopicDto>('/admin/topics', data);
}

export async function updateTopic(id: string, data: UpdateTopicReq): Promise<AdminTopicDto> {
  return apiClient.patch<AdminTopicDto>(`/admin/topics/${id}`, data);
}

export async function reorderTopics(orderedIds: string[]): Promise<{ orderedIds: string[] }> {
  return apiClient.put<{ orderedIds: string[] }>('/admin/topics/order', { orderedIds });
}

export async function deleteTopic(id: string): Promise<void> {
  return apiClient.delete<void>(`/admin/topics/${id}`);
}

export const adminTopicService = {
  listAdminTopics,
  createTopic,
  updateTopic,
  reorderTopics,
  deleteTopic,
};
