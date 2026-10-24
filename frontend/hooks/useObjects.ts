'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getObjects,
  getObject,
  createObject,
  updateObject,
  updateObjectLifecycle,
  deleteObject,
  attachObjectToSpace,
  removeObjectFromSpace,
  convertObjectType,
  emptyTrash,
  QueryObjectsParams,
  CreateObjectPayload,
  UpdateObjectPayload,
  ObjectType,
} from '@/lib/objects-api';

export const OBJECTS_QUERY_KEY = ['objects'];

export function useObjects(params?: QueryObjectsParams) {
  return useQuery({
    queryKey: [...OBJECTS_QUERY_KEY, params],
    queryFn: () => getObjects(params),
  });
}

export function useObject(id: string) {
  return useQuery({
    queryKey: [...OBJECTS_QUERY_KEY, id],
    queryFn: () => getObject(id),
    enabled: Boolean(id),
  });
}

export function useCreateObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObjectPayload) => createObject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useUpdateObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateObjectPayload }) =>
      updateObject(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...OBJECTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useUpdateObjectLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: 'ARCHIVE' | 'TRASH' | 'RESTORE';
    }) => updateObjectLifecycle(id, action),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...OBJECTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useConvertObjectType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetType }: { id: string; targetType: ObjectType }) =>
      convertObjectType(id, targetType),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...OBJECTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeleteObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
    },
  });
}

export function useAttachObjectToSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, spaceId }: { objectId: string; spaceId: string }) =>
      attachObjectToSpace(objectId, spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
    },
  });
}

export function useRemoveObjectFromSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, spaceId }: { objectId: string; spaceId: string }) =>
      removeObjectFromSpace(objectId, spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
    },
  });
}
