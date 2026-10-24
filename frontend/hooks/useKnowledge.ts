'use client';

import { useQuery } from '@tanstack/react-query';
import { getKnowledgeGraph } from '@/lib/knowledge-api';

export function useKnowledgeGraph(spaceId?: string) {
  return useQuery({
    queryKey: ['knowledge', 'graph', spaceId ?? 'all'],
    queryFn: () => getKnowledgeGraph(spaceId),
  });
}
