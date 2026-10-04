import { apiRequest } from './api';

export interface Space {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  parentId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Space[];
  _count?: { spaceObjects: number };
}

export interface CreateSpacePayload {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateSpacePayload extends Partial<CreateSpacePayload> {
  isArchived?: boolean;
}

export async function getSpaces(): Promise<Space[]> {
  return apiRequest<Space[]>('/spaces');
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