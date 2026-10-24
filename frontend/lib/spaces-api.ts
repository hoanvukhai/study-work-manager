import { apiRequest } from './api';

export interface Space {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  settings?: Record<string, any>;
  goal?: string;
  dueDate?: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { spaceObjects: number };
}

export interface CreateSpacePayload {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Record<string, any>;
  goal?: string;
  dueDate?: string;
}

export interface UpdateSpacePayload extends Partial<CreateSpacePayload> {
  isArchived?: boolean;
}

export async function getSpaces(includeArchived = false): Promise<Space[]> {
  const query = includeArchived ? '?includeArchived=true' : '';
  return apiRequest<Space[]>(`/spaces${query}`);
}

export async function getSpace(id: string): Promise<Space> {
  return apiRequest<Space>(`/spaces/${id}`);
}

export async function createSpace(payload: CreateSpacePayload): Promise<Space> {
  return apiRequest<Space>('/spaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSpace(id: string, payload: UpdateSpacePayload): Promise<Space> {
  return apiRequest<Space>(`/spaces/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteSpace(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/spaces/${id}`, {
    method: 'DELETE',
  });
}