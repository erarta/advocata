import { get, post, patch, del } from './client';
import type {
  ConsultationDetail,
  LiveConsultation,
  ChatMessage,
  ConsultationStats,
  Dispute,
  DisputeResolution,
  DisputeStats,
  EmergencyCall,
  EmergencyCallStats,
  GetConsultationsParams,
  GetDisputesParams,
  GetEmergencyCallsParams,
  UpdateConsultationDto,
  UpdateEmergencyCallDto,
  DateRange,
} from '@/lib/types/consultation';
import type { PaginatedResponse } from '@/lib/types/api';

// ============================================================================
// Live Consultations
// ============================================================================

export async function getLiveConsultations() {
  return get<LiveConsultation[]>('/admin/consultations/live');
}

// ============================================================================
// Consultations History
// ============================================================================

export async function getConsultations(params: GetConsultationsParams) {
  return get<PaginatedResponse<ConsultationDetail>>('/admin/consultations', {
    params,
  });
}

export async function getConsultation(id: string) {
  return get<ConsultationDetail>(`/admin/consultations/${id}`);
}

export async function updateConsultation(id: string, data: UpdateConsultationDto) {
  return patch<{ success: boolean; consultation: ConsultationDetail }>(
    `/admin/consultations/${id}`,
    data
  );
}

export async function cancelConsultation(id: string, reason: string) {
  return post<{ success: boolean }>(`/admin/consultations/${id}/cancel`, {
    reason,
  });
}

export async function refundConsultation(id: string, amount: number, reason: string) {
  return post<{ success: boolean }>(`/admin/consultations/${id}/refund`, {
    amount,
    reason,
  });
}

// ============================================================================
// Chat History
// ============================================================================

export async function getConsultationChat(id: string) {
  return get<ChatMessage[]>(`/admin/consultations/${id}/chat`);
}

export async function exportConsultationChat(id: string) {
  return get<{ url: string }>(`/admin/consultations/${id}/chat/export`);
}

// ============================================================================
// Stats
// ============================================================================

export async function getConsultationStats(dateRange?: DateRange) {
  return get<ConsultationStats>('/admin/consultations/stats', {
    params: dateRange
      ? {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }
      : undefined,
  });
}

// ============================================================================
// Disputes
// ============================================================================

export async function getDisputes(params: GetDisputesParams) {
  return get<PaginatedResponse<Dispute>>('/admin/disputes', {
    params,
  });
}

export async function getDispute(id: string) {
  return get<Dispute>(`/admin/disputes/${id}`);
}

export async function resolveDispute(id: string, resolution: DisputeResolution) {
  return post<{ success: boolean; dispute: Dispute }>(`/admin/disputes/${id}/resolve`, resolution);
}

export async function assignDispute(id: string, adminId: string) {
  return patch<{ success: boolean }>(`/admin/disputes/${id}/assign`, {
    adminId,
  });
}

export async function updateDisputePriority(id: string, priority: 'low' | 'medium' | 'high') {
  return patch<{ success: boolean }>(`/admin/disputes/${id}/priority`, {
    priority,
  });
}

export async function getDisputeStats(dateRange?: DateRange) {
  return get<DisputeStats>('/admin/disputes/stats', {
    params: dateRange
      ? {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }
      : undefined,
  });
}

// ============================================================================
// Emergency Calls
// ============================================================================

export async function getEmergencyCalls(params?: GetEmergencyCallsParams) {
  return get<EmergencyCall[]>('/admin/emergency-calls', {
    params,
  });
}

export async function getEmergencyCall(id: string) {
  return get<EmergencyCall>(`/admin/emergency-calls/${id}`);
}

export async function updateEmergencyCall(id: string, data: UpdateEmergencyCallDto) {
  return patch<{ success: boolean; call: EmergencyCall }>(
    `/admin/emergency-calls/${id}`,
    data
  );
}

export async function assignLawyerToEmergencyCall(id: string, lawyerId: string) {
  return post<{ success: boolean }>(`/admin/emergency-calls/${id}/assign`, {
    lawyerId,
  });
}

export async function completeEmergencyCall(id: string, notes?: string) {
  return post<{ success: boolean }>(`/admin/emergency-calls/${id}/complete`, {
    notes,
  });
}

export async function getEmergencyCallStats(dateRange?: DateRange) {
  return get<EmergencyCallStats>('/admin/emergency-calls/stats', {
    params: dateRange
      ? {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }
      : undefined,
  });
}
