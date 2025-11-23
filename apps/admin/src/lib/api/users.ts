import { get, post, patch, del } from './client';
import type {
  UserProfile,
  UserListItem,
  GetUsersParams,
  SuspendUserDto,
  BanUserDto,
  UpdateUserDto,
  SubscriptionInfo,
  SubscriptionHistory,
  ActivityLog,
} from '@/lib/types/user';
import type { PaginatedResponse } from '@/lib/types/api';
import type { ConsultationDetail } from '@/lib/types/consultation';
import type { Transaction } from '@/lib/types/payment';

// User Management
export async function getUsers(params: GetUsersParams) {
  return get<PaginatedResponse<UserListItem>>('/admin/users', { params });
}

export async function getUser(id: string) {
  return get<UserProfile>(`/admin/users/${id}`);
}

export async function updateUser(id: string, data: UpdateUserDto) {
  return patch<{ success: boolean; user: UserProfile }>(`/admin/users/${id}`, data);
}

export async function deleteUser(id: string, reason: string) {
  return del<{ success: boolean }>(`/admin/users/${id}`, {
    data: { reason },
  });
}

// User Status Management
export async function suspendUser(id: string, data: SuspendUserDto) {
  return post<{ success: boolean }>(`/admin/users/${id}/suspend`, data);
}

export async function banUser(id: string, data: BanUserDto) {
  return post<{ success: boolean }>(`/admin/users/${id}/ban`, data);
}

export async function reactivateUser(id: string) {
  return post<{ success: boolean }>(`/admin/users/${id}/reactivate`);
}

// User Consultations
export async function getUserConsultations(
  userId: string,
  params: { page?: number; limit?: number; status?: string; type?: string }
) {
  return get<PaginatedResponse<ConsultationDetail>>(`/admin/users/${userId}/consultations`, {
    params,
  });
}

// User Payments
export async function getUserPayments(
  userId: string,
  params: { page?: number; limit?: number; type?: string; status?: string }
) {
  return get<PaginatedResponse<Transaction>>(`/admin/users/${userId}/payments`, { params });
}

// User Subscription
export async function getUserSubscription(userId: string) {
  return get<{
    current: SubscriptionInfo;
    history: SubscriptionHistory[];
  }>(`/admin/users/${userId}/subscriptions`);
}

export async function changeUserSubscription(
  userId: string,
  data: {
    type: string;
    action: 'upgrade' | 'downgrade' | 'cancel' | 'extend' | 'comp';
    duration?: number;
  }
) {
  return post<{ success: boolean; subscription: SubscriptionInfo }>(
    `/admin/users/${userId}/subscriptions`,
    data
  );
}

export async function cancelUserSubscription(userId: string, reason: string) {
  return post<{ success: boolean }>(`/admin/users/${userId}/subscriptions/cancel`, { reason });
}

// User Activity
export async function getUserActivity(
  userId: string,
  params: { page?: number; limit?: number; type?: string }
) {
  return get<PaginatedResponse<ActivityLog>>(`/admin/users/${userId}/activity`, { params });
}

// User Stats
export async function getUserStats() {
  return get<{
    totalUsers: number;
    activeSubscriptions: number;
    suspendedUsers: number;
    newUsersThisMonth: number;
  }>('/admin/users/stats');
}

// Export Users
export async function exportUsers(params: GetUsersParams) {
  return get<Blob>('/admin/users/export', {
    params,
    responseType: 'blob',
  });
}
