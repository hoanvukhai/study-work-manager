import { apiRequest } from './api';

export type RelationType = 'RELATES_TO' | 'DEPENDS_ON' | 'REFERENCES' | 'PARENT_OF';

export const RELATION_LABELS: Record<RelationType, string> = {
  RELATES_TO: 'Liên quan đến',
  DEPENDS_ON: 'Phụ thuộc vào',
  REFERENCES: 'Tham chiếu tài liệu',
  PARENT_OF: 'Mục cha của',
};

export interface RelatedObjectSummary {
  id: string;
  type: 'TASK' | 'NOTE' | 'EVENT' | 'REFERENCE';
  title: string;
  status: string;
  priority: string;
  description: string | null;
  dueDate: string | null;
}

export interface ObjectRelationItem {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  relationType: RelationType;
  createdAt: string;
  fromObject?: RelatedObjectSummary;
  toObject?: RelatedObjectSummary;
}

export interface ObjectRelationsResponse {
  objectId: string;
  outgoing: ObjectRelationItem[];
  incoming: ObjectRelationItem[];
}

export interface CreateRelationPayload {
  fromObjectId: string;
  toObjectId: string;
  relationType: RelationType;
}

export async function getObjectRelations(objectId: string): Promise<ObjectRelationsResponse> {
  return apiRequest<ObjectRelationsResponse>(`/relations/object/${objectId}`);
}

export async function createRelation(payload: CreateRelationPayload): Promise<ObjectRelationItem> {
  return apiRequest<ObjectRelationItem>('/relations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteRelation(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/relations/${id}`, {
    method: 'DELETE',
  });
}
