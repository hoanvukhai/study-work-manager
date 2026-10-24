'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getObjectRelations,
  createRelation,
  deleteRelation,
  CreateRelationPayload,
} from '@/lib/relations-api';

export const RELATIONS_QUERY_KEY = ['relations'];

export function useObjectRelations(objectId: string) {
  return useQuery({
    queryKey: [...RELATIONS_QUERY_KEY, objectId],
    queryFn: () => getObjectRelations(objectId),
    enabled: Boolean(objectId),
  });
}

export function useCreateRelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRelationPayload) => createRelation(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({
        queryKey: [...RELATIONS_QUERY_KEY, variables.fromObjectId],
      });
      queryClient.invalidateQueries({
        queryKey: [...RELATIONS_QUERY_KEY, variables.toObjectId],
      });
    },
  });
}

export function useDeleteRelation(objectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRelation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      if (objectId) {
        queryClient.invalidateQueries({
          queryKey: [...RELATIONS_QUERY_KEY, objectId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: RELATIONS_QUERY_KEY });
      }
    },
  });
}
