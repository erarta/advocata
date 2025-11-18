import { get, post, patch } from './client';
import type {
  LawyerProfile,
  PendingLawyer,
  VerificationDecision,
  LawyerListItem,
  PerformanceMetrics,
} from '@/lib/types/lawyer';
import type { PaginatedResponse, QueryParams } from '@/lib/types/api';

export async function getPendingLawyers(params: QueryParams) {
  return get<PaginatedResponse<PendingLawyer>>('/admin/lawyers/pending', {
    params,
  });
}

export async function getLawyers(params: QueryParams) {
  return get<PaginatedResponse<LawyerListItem>>('/admin/lawyers', {
    params,
  });
}

export async function getLawyer(id: string) {
  return get<LawyerProfile>(`/admin/lawyers/${id}`);
}

export async function verifyLawyer(id: string, data: Partial<VerificationDecision>) {
  return post<{ success: boolean; lawyer: LawyerProfile }>(
    `/admin/lawyers/${id}/verify`,
    data
  );
}

export async function updateLawyer(id: string, data: Partial<LawyerProfile>) {
  return patch<{ success: boolean; lawyer: LawyerProfile }>(`/admin/lawyers/${id}`, data);
}

export async function suspendLawyer(id: string, reason: string, duration?: number) {
  return post<{ success: boolean }>(`/admin/lawyers/${id}/suspend`, {
    reason,
    duration,
  });
}

export async function banLawyer(id: string, reason: string, permanent: boolean) {
  return post<{ success: boolean }>(`/admin/lawyers/${id}/ban`, {
    reason,
    permanent,
  });
}

export async function getLawyerPerformance(params: QueryParams) {
  return get<{
    topPerformers: LawyerListItem[];
    underperformers: LawyerListItem[];
    averageMetrics: PerformanceMetrics;
  }>('/admin/lawyers/performance', { params });
}
