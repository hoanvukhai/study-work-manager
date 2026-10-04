import { apiRequest } from './api';

export type ObjectType = 'TASK' | 'NOTE' | 'EVENT' | 'REFERENCE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ObjectLifecycle = 'ACTIVE' | 'ARCHIVED' | 'TRASH';

export interface SpaceBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SpaceObjectRelation {
  id: string;
  spaceId: string;
  objectId: string;
  space: SpaceBadge;
}

export interface AppObject {
  id: string;
  userId: string;
  type: ObjectType;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  lifecycle: ObjectLifecycle;
  dueDate: string | null;
  startAt: string | null;
  endAt: string | null;
  url: string | null;
  metadata: any;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  spaceObjects?: SpaceObjectRelation[];
}

export interface CreateObjectPayload {
  type: ObjectType;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  startAt?: string;
  endAt?: string;
  url?: string;
  spaceId?: string;
  metadata?: any;
}

export interface UpdateObjectPayload {
  type?: ObjectType;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  lifecycle?: ObjectLifecycle;
  dueDate?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  url?: string | null;
  metadata?: any;
}

export interface QueryObjectsParams {
  spaceId?: string;
  type?: ObjectType;
  status?: TaskStatus;
  priority?: Priority;
  lifecycle?: ObjectLifecycle;
  search?: string;
}

export async function getObjects(params?: QueryObjectsParams): Promise<AppObject[]> {
  const query = new URLSearchParams();
  if (params?.spaceId) query.set('spaceId', params.spaceId);
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.lifecycle) query.set('lifecycle', params.lifecycle);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  return apiRequest<AppObject[]>(`/objects${qs ? `?${qs}` : ''}`);
}

export async function getObject(id: string): Promise<AppObject> {
  return apiRequest<AppObject>(`/objects/${id}`);
}

export async function createObject(payload: CreateObjectPayload): Promise<AppObject> {
  return apiRequest<AppObject>('/objects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateObject(id: string, payload: UpdateObjectPayload): Promise<AppObject> {
  return apiRequest<AppObject>(`/objects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateObjectLifecycle(
  id: string,
  action: 'ARCHIVE' | 'TRASH' | 'RESTORE',
): Promise<AppObject> {
  return apiRequest<AppObject>(`/objects/${id}/lifecycle`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

export async function deleteObject(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/objects/${id}`, {
    method: 'DELETE',
  });
}

export async function attachObjectToSpace(objectId: string, spaceId: string): Promise<AppObject> {
  return apiRequest<AppObject>(`/objects/${objectId}/spaces/${spaceId}`, {
    method: 'POST',
  });
}

export async function removeObjectFromSpace(
  objectId: string,
  spaceId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/objects/${objectId}/spaces/${spaceId}`, {
    method: 'DELETE',
  });
}
