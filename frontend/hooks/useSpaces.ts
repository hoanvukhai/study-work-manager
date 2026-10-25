'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  updatePlacement,
  reorderSpace,
  PlacementPatch,
  getSpaceTemplates,
  createSpaceFromTemplate,
  CreateSpacePayload,
  UpdateSpacePayload,
} from '@/lib/spaces-api';

export const SPACES_QUERY_KEY = ['spaces'];

export function useSpaces(includeArchived = false) {
  return useQuery({
    queryKey: [...SPACES_QUERY_KEY, { includeArchived }],
    queryFn: () => getSpaces(includeArchived),
  });
}

export function useSpace(id: string) {
  return useQuery({
    queryKey: [...SPACES_QUERY_KEY, id],
    queryFn: () => getSpace(id),
    enabled: Boolean(id),
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSpacePayload) => createSpace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSpacePayload }) =>
      updateSpace(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...SPACES_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdatePlacement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, objectId, patch }: { spaceId: string; objectId: string; patch: PlacementPatch }) =>
      updatePlacement(spaceId, objectId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['objects'] }),
  });
}

export function useReorderSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, objectIds }: { spaceId: string; objectIds: string[] }) => reorderSpace(spaceId, objectIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['objects'] }),
  });
}

export function useSpaceTemplates() {
  return useQuery({ queryKey: [...SPACES_QUERY_KEY, 'templates'], queryFn: getSpaceTemplates, staleTime: 5 * 60 * 1000 });
}

export function useCreateSpaceFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpaceFromTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['planning'] });
    },
  });
}
