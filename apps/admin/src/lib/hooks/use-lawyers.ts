import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingLawyers,
  getLawyers,
  getLawyer,
  verifyLawyer,
  updateLawyer,
} from '@/lib/api/lawyers';
import { queryKeys } from '@/lib/config/query-client';
import type { QueryParams } from '@/lib/types/api';

export function usePendingLawyers(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.lawyers.pending(),
    queryFn: () => getPendingLawyers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

export function useLawyers(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.lawyers.list(params),
    queryFn: () => getLawyers(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLawyer(id: string) {
  return useQuery({
    queryKey: queryKeys.lawyers.detail(id),
    queryFn: () => getLawyer(id),
    enabled: !!id,
  });
}

export function useVerifyLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => verifyLawyer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.lists() });
    },
  });
}

export function useUpdateLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateLawyer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.lists() });
    },
  });
}
