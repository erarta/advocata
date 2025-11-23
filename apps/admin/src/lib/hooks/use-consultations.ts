import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLiveConsultations,
  getConsultations,
  getConsultation,
  updateConsultation,
  cancelConsultation,
  refundConsultation,
  getConsultationChat,
  exportConsultationChat,
  getConsultationStats,
  getDisputes,
  getDispute,
  resolveDispute,
  assignDispute,
  updateDisputePriority,
  getDisputeStats,
  getEmergencyCalls,
  getEmergencyCall,
  updateEmergencyCall,
  assignLawyerToEmergencyCall,
  completeEmergencyCall,
  getEmergencyCallStats,
} from '@/lib/api/consultations';
import { queryKeys } from '@/lib/config/query-client';
import type {
  GetConsultationsParams,
  GetDisputesParams,
  GetEmergencyCallsParams,
  UpdateConsultationDto,
  UpdateEmergencyCallDto,
  DisputeResolution,
  DateRange,
} from '@/lib/types/consultation';

// ============================================================================
// Live Consultations
// ============================================================================

export function useLiveConsultations(refreshInterval: number = 10000) {
  return useQuery({
    queryKey: queryKeys.consultations.live(),
    queryFn: getLiveConsultations,
    staleTime: 5000, // 5 seconds
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}

// ============================================================================
// Consultations History
// ============================================================================

export function useConsultations(params: GetConsultationsParams) {
  return useQuery({
    queryKey: queryKeys.consultations.list(params),
    queryFn: () => getConsultations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: queryKeys.consultations.detail(id),
    queryFn: () => getConsultation(id),
    enabled: !!id,
  });
}

export function useConsultationChat(id: string) {
  return useQuery({
    queryKey: [...queryKeys.consultations.detail(id), 'chat'],
    queryFn: () => getConsultationChat(id),
    enabled: !!id,
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConsultationDto }) =>
      updateConsultation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.live() });
    },
  });
}

export function useCancelConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelConsultation(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.live() });
    },
  });
}

export function useRefundConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      refundConsultation(id, amount, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.lists() });
    },
  });
}

export function useExportConsultationChat() {
  return useMutation({
    mutationFn: (id: string) => exportConsultationChat(id),
  });
}

export function useConsultationStats(dateRange?: DateRange) {
  return useQuery({
    queryKey: [...queryKeys.consultations.all, 'stats', dateRange],
    queryFn: () => getConsultationStats(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Disputes
// ============================================================================

export function useDisputes(params: GetDisputesParams) {
  return useQuery({
    queryKey: [...queryKeys.consultations.disputes(), params],
    queryFn: () => getDisputes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: [...queryKeys.consultations.disputes(), 'detail', id],
    queryFn: () => getDispute(id),
    enabled: !!id,
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: DisputeResolution }) =>
      resolveDispute(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.disputes() });
    },
  });
}

export function useAssignDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminId }: { id: string; adminId: string }) => assignDispute(id, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.disputes() });
    },
  });
}

export function useUpdateDisputePriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: 'low' | 'medium' | 'high' }) =>
      updateDisputePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.disputes() });
    },
  });
}

export function useDisputeStats(dateRange?: DateRange) {
  return useQuery({
    queryKey: [...queryKeys.consultations.disputes(), 'stats', dateRange],
    queryFn: () => getDisputeStats(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Emergency Calls
// ============================================================================

export function useEmergencyCalls(
  params?: GetEmergencyCallsParams,
  refreshInterval: number = 5000
) {
  return useQuery({
    queryKey: [...queryKeys.consultations.emergencyCalls(), params],
    queryFn: () => getEmergencyCalls(params),
    staleTime: 3000, // 3 seconds
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}

export function useEmergencyCall(id: string) {
  return useQuery({
    queryKey: [...queryKeys.consultations.emergencyCalls(), 'detail', id],
    queryFn: () => getEmergencyCall(id),
    enabled: !!id,
  });
}

export function useUpdateEmergencyCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmergencyCallDto }) =>
      updateEmergencyCall(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.emergencyCalls() });
    },
  });
}

export function useAssignLawyerToEmergencyCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lawyerId }: { id: string; lawyerId: string }) =>
      assignLawyerToEmergencyCall(id, lawyerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.emergencyCalls() });
    },
  });
}

export function useCompleteEmergencyCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => completeEmergencyCall(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.emergencyCalls() });
    },
  });
}

export function useEmergencyCallStats(dateRange?: DateRange) {
  return useQuery({
    queryKey: [...queryKeys.consultations.emergencyCalls(), 'stats', dateRange],
    queryFn: () => getEmergencyCallStats(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
