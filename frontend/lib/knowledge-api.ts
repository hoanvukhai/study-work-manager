import { apiRequest } from './api';
import type { ObjectType, TaskStatus } from './objects-api';
import type { RelationType } from './relations-api';

export interface GraphNode {
  id: string;
  type: ObjectType;
  title: string;
  status: TaskStatus | null;
  spaceIds: string[];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relationType: RelationType;
  auto: boolean;
}

export interface GraphResponse {
  truncated: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function getKnowledgeGraph(spaceId?: string): Promise<GraphResponse> {
  return apiRequest<GraphResponse>(`/knowledge/graph${spaceId ? `?spaceId=${spaceId}` : ''}`);
}
