import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  banUser,
  reactivateUser,
  getUserConsultations,
  getUserPayments,
  getUserSubscription,
  changeUserSubscription,
  cancelUserSubscription,
  getUserActivity,
  getUserStats,
} from '@/lib/api/users';
import { queryKeys } from '@/lib/config/query-client';
import type { GetUsersParams, SuspendUserDto, BanUserDto, UpdateUserDto } from '@/lib/types/user';

// Fetch users with filters
export function useUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single user
export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
}

// Fetch user consultations
export function useUserConsultations(
  userId: string,
  params: { page?: number; limit?: number; status?: string; type?: string }
) {
  return useQuery({
    queryKey: queryKeys.users.consultations(userId, params),
    queryFn: () => getUserConsultations(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch user payments
export function useUserPayments(
  userId: string,
  params: { page?: number; limit?: number; type?: string; status?: string }
) {
  return useQuery({
    queryKey: queryKeys.users.payments(userId, params),
    queryFn: () => getUserPayments(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch user subscription
export function useUserSubscription(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.subscriptions(userId),
    queryFn: () => getUserSubscription(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch user activity
export function useUserActivity(
  userId: string,
  params: { page?: number; limit?: number; type?: string }
) {
  return useQuery({
    queryKey: queryKeys.users.activity(userId, params),
    queryFn: () => getUserActivity(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch user stats
export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: () => getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

// Suspend user mutation
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SuspendUserDto }) => suspendUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

// Ban user mutation
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BanUserDto }) => banUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

// Reactivate user mutation
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => deleteUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

// Change user subscription mutation
export function useChangeUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        type: string;
        action: 'upgrade' | 'downgrade' | 'cancel' | 'extend' | 'comp';
        duration?: number;
      };
    }) => changeUserSubscription(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.subscriptions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

// Cancel user subscription mutation
export function useCancelUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      cancelUserSubscription(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.subscriptions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
