import { apiRequest } from './api';

export interface Space {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  settings?: Record<string, any>;
  goal?: string | null;
  dueDate?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { spaceObjects: number };
  /** Chỉ có ở GET /spaces/:id */
  progress?: { done: number; total: number };
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

export interface UpdateSpacePayload extends Partial<Omit<CreateSpacePayload, 'goal' | 'dueDate'>> {
  goal?: string | null;
  dueDate?: string | null;
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
export interface PlacementPatch {
  isPinned?: boolean;
  position?: number;
}

export async function updatePlacement(spaceId: string, objectId: string, patch: PlacementPatch) {
  return apiRequest<{ spaceId: string; objectId: string; isPinned: boolean; position: number }>(
    `/spaces/${spaceId}/objects/${objectId}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
}

export async function reorderSpace(spaceId: string, objectIds: string[]) {
  return apiRequest<{ updated: number }>(`/spaces/${spaceId}/reorder`, {
    method: 'POST',
    body: JSON.stringify({ objectIds }),
  });
}

export interface SpaceTemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  taskCount: number;
  noteCount: number;
}

export async function getSpaceTemplates() {
  return apiRequest<SpaceTemplateInfo[]>('/spaces/templates');
}

export async function createSpaceFromTemplate(payload: {
  templateId: string;
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}) {
  return apiRequest<Space>('/spaces/from-template', { method: 'POST', body: JSON.stringify(payload) });
}
