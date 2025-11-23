// Settings Custom Hooks - Phase 7: System Settings
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  PlatformConfigUpdate,
  NotificationTemplateParams,
  NotificationTemplateUpdate,
  TestNotificationDto,
  EmailConfigUpdate,
  SMSConfigUpdate,
  CommunicationLogParams,
  FeatureFlagUpdate,
  RateLimitCreate,
  RateLimitUpdate,
  IPWhitelistCreate,
  IPBlacklistCreate,
  AdminRoleCreate,
  AdminRoleUpdate,
  AssignRoleDto,
  AuditLogParams,
} from '@/lib/types/settings';
import * as settingsApi from '@/lib/api/settings';

// ==================== PLATFORM CONFIGURATION HOOKS ====================

/**
 * Fetch platform configuration
 */
export function usePlatformConfig() {
  return useQuery({
    queryKey: ['settings', 'platform'],
    queryFn: () => settingsApi.getPlatformConfig(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Update platform configuration
 */
export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PlatformConfigUpdate) =>
      settingsApi.updatePlatformConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'platform'] });
      toast({
        title: 'Настройки обновлены',
        description: 'Настройки платформы успешно обновлены.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Upload platform logo
 */
export function useUploadLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'platform'] });
      toast({
        title: 'Логотип загружен',
        description: 'Логотип платформы успешно обновлен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Upload platform favicon
 */
export function useUploadFavicon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadFavicon(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'platform'] });
      toast({
        title: 'Favicon загружен',
        description: 'Favicon платформы успешно обновлен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test email configuration
 */
export function useTestEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => settingsApi.testEmail(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Тест успешен',
          description: result.message,
        });
      } else {
        toast({
          title: 'Тест не пройден',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test SMS configuration
 */
export function useTestSMS() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => settingsApi.testSMS(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Тест успешен',
          description: result.message,
        });
      } else {
        toast({
          title: 'Тест не пройден',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== NOTIFICATION TEMPLATES HOOKS ====================

/**
 * Fetch notification templates with filters
 */
export function useNotificationTemplates(params?: NotificationTemplateParams) {
  return useQuery({
    queryKey: ['settings', 'notifications', 'templates', params],
    queryFn: () => settingsApi.getNotificationTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single notification template
 */
export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: ['settings', 'notifications', 'templates', id],
    queryFn: () => settingsApi.getNotificationTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update notification template
 */
export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NotificationTemplateUpdate }) =>
      settingsApi.updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications', 'templates'] });
      toast({
        title: 'Шаблон обновлен',
        description: 'Шаблон уведомления успешно обновлен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test notification template
 */
export function useTestNotificationTemplate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestNotificationDto }) =>
      settingsApi.testNotificationTemplate(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Тест успешен',
          description: result.message,
        });
      } else {
        toast({
          title: 'Тест не пройден',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch available template variables
 */
export function useTemplateVariables() {
  return useQuery({
    queryKey: ['settings', 'notifications', 'variables'],
    queryFn: () => settingsApi.getTemplateVariables(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
  });
}

// ==================== EMAIL CONFIGURATION HOOKS ====================

/**
 * Fetch email configuration
 */
export function useEmailConfig() {
  return useQuery({
    queryKey: ['settings', 'communication', 'email'],
    queryFn: () => settingsApi.getEmailConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update email configuration
 */
export function useUpdateEmailConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: EmailConfigUpdate) => settingsApi.updateEmailConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'communication', 'email'] });
      toast({
        title: 'Настройки обновлены',
        description: 'Настройки email успешно обновлены.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test email configuration
 */
export function useTestEmailConfig() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => settingsApi.testEmailConfig(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Подключение успешно',
          description: result.message,
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== SMS CONFIGURATION HOOKS ====================

/**
 * Fetch SMS configuration
 */
export function useSMSConfig() {
  return useQuery({
    queryKey: ['settings', 'communication', 'sms'],
    queryFn: () => settingsApi.getSMSConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update SMS configuration
 */
export function useUpdateSMSConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SMSConfigUpdate) => settingsApi.updateSMSConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'communication', 'sms'] });
      toast({
        title: 'Настройки обновлены',
        description: 'Настройки SMS успешно обновлены.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test SMS configuration
 */
export function useTestSMSConfig() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => settingsApi.testSMSConfig(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Подключение успешно',
          description: result.message,
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== COMMUNICATION LOGS HOOKS ====================

/**
 * Fetch communication logs
 */
export function useCommunicationLogs(params: CommunicationLogParams) {
  return useQuery({
    queryKey: ['settings', 'communication', 'logs', params],
    queryFn: () => settingsApi.getCommunicationLogs(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ==================== FEATURE FLAGS HOOKS ====================

/**
 * Fetch all feature flags
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: ['settings', 'features'],
    queryFn: () => settingsApi.getFeatureFlags(),
    staleTime: 2 * 60 * 1000, // 2 minutes (dynamic)
  });
}

/**
 * Fetch single feature flag
 */
export function useFeatureFlag(id: string) {
  return useQuery({
    queryKey: ['settings', 'features', id],
    queryFn: () => settingsApi.getFeatureFlag(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Update feature flag
 */
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeatureFlagUpdate }) =>
      settingsApi.updateFeatureFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'features'] });
      toast({
        title: 'Флаг обновлен',
        description: 'Настройки функции успешно обновлены.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Toggle feature flag
 */
export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => settingsApi.toggleFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'features'] });
      toast({
        title: 'Флаг переключен',
        description: 'Статус функции успешно изменен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка переключения',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== RATE LIMITS HOOKS ====================

/**
 * Fetch all rate limits
 */
export function useRateLimits() {
  return useQuery({
    queryKey: ['settings', 'rate-limits'],
    queryFn: () => settingsApi.getRateLimits(),
    staleTime: 1 * 60 * 1000, // 1 minute (dynamic)
  });
}

/**
 * Fetch single rate limit
 */
export function useRateLimit(id: string) {
  return useQuery({
    queryKey: ['settings', 'rate-limits', id],
    queryFn: () => settingsApi.getRateLimit(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Create rate limit
 */
export function useCreateRateLimit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: RateLimitCreate) => settingsApi.createRateLimit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits'] });
      toast({
        title: 'Лимит создан',
        description: 'Новый лимит успешно создан.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update rate limit
 */
export function useUpdateRateLimit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RateLimitUpdate }) =>
      settingsApi.updateRateLimit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits'] });
      toast({
        title: 'Лимит обновлен',
        description: 'Лимит успешно обновлен.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete rate limit
 */
export function useDeleteRateLimit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteRateLimit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits'] });
      toast({
        title: 'Лимит удален',
        description: 'Лимит успешно удален.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== IP WHITELIST HOOKS ====================

/**
 * Fetch IP whitelist
 */
export function useIPWhitelist() {
  return useQuery({
    queryKey: ['settings', 'rate-limits', 'whitelist'],
    queryFn: () => settingsApi.getIPWhitelist(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Add IP to whitelist
 */
export function useAddIPToWhitelist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IPWhitelistCreate) => settingsApi.addIPToWhitelist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits', 'whitelist'] });
      toast({
        title: 'IP добавлен',
        description: 'IP-адрес добавлен в белый список.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка добавления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove IP from whitelist
 */
export function useRemoveIPFromWhitelist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => settingsApi.removeIPFromWhitelist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits', 'whitelist'] });
      toast({
        title: 'IP удален',
        description: 'IP-адрес удален из белого списка.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== IP BLACKLIST HOOKS ====================

/**
 * Fetch IP blacklist
 */
export function useIPBlacklist() {
  return useQuery({
    queryKey: ['settings', 'rate-limits', 'blacklist'],
    queryFn: () => settingsApi.getIPBlacklist(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Add IP to blacklist
 */
export function useAddIPToBlacklist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IPBlacklistCreate) => settingsApi.addIPToBlacklist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits', 'blacklist'] });
      toast({
        title: 'IP заблокирован',
        description: 'IP-адрес добавлен в черный список.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка блокировки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove IP from blacklist
 */
export function useRemoveIPFromBlacklist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => settingsApi.removeIPFromBlacklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'rate-limits', 'blacklist'] });
      toast({
        title: 'IP разблокирован',
        description: 'IP-адрес удален из черного списка.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка разблокировки',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch rate limit usage
 */
export function useRateLimitUsage() {
  return useQuery({
    queryKey: ['settings', 'rate-limits', 'usage'],
    queryFn: () => settingsApi.getRateLimitUsage(),
    staleTime: 30 * 1000, // 30 seconds (real-time)
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

// ==================== ADMIN ROLES & PERMISSIONS HOOKS ====================

/**
 * Fetch all admin roles
 */
export function useAdminRoles() {
  return useQuery({
    queryKey: ['settings', 'permissions', 'roles'],
    queryFn: () => settingsApi.getAdminRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single admin role
 */
export function useAdminRole(id: string) {
  return useQuery({
    queryKey: ['settings', 'permissions', 'roles', id],
    queryFn: () => settingsApi.getAdminRole(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create admin role
 */
export function useCreateAdminRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AdminRoleCreate) => settingsApi.createAdminRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'permissions', 'roles'] });
      toast({
        title: 'Роль создана',
        description: 'Новая роль администратора успешно создана.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update admin role
 */
export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminRoleUpdate }) =>
      settingsApi.updateAdminRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'permissions', 'roles'] });
      toast({
        title: 'Роль обновлена',
        description: 'Роль успешно обновлена.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete admin role
 */
export function useDeleteAdminRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteAdminRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'permissions', 'roles'] });
      toast({
        title: 'Роль удалена',
        description: 'Роль успешно удалена.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch all available permissions
 */
export function useAllPermissions() {
  return useQuery({
    queryKey: ['settings', 'permissions', 'available'],
    queryFn: () => settingsApi.getAllPermissions(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
  });
}

/**
 * Fetch all admin users
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ['settings', 'permissions', 'users'],
    queryFn: () => settingsApi.getAdminUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Assign role to admin user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AssignRoleDto) => settingsApi.assignRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'permissions', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit-log'] });
      toast({
        title: 'Роль назначена',
        description: 'Роль успешно назначена пользователю.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка назначения',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch role audit log
 */
export function useRoleAuditLog(roleId: string) {
  return useQuery({
    queryKey: ['settings', 'permissions', 'roles', roleId, 'audit'],
    queryFn: () => settingsApi.getRoleAuditLog(roleId),
    enabled: !!roleId,
    staleTime: 1 * 60 * 1000,
  });
}

// ==================== AUDIT LOG HOOKS ====================

/**
 * Fetch audit log with filters
 */
export function useAuditLog(params: AuditLogParams) {
  return useQuery({
    queryKey: ['settings', 'audit-log', params],
    queryFn: () => settingsApi.getAuditLog(params),
    staleTime: 30 * 1000, // 30 seconds (real-time)
  });
}

/**
 * Fetch single audit log entry
 */
export function useAuditLogEntry(id: string) {
  return useQuery({
    queryKey: ['settings', 'audit-log', id],
    queryFn: () => settingsApi.getAuditLogEntry(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch audit log statistics
 */
export function useAuditLogStats() {
  return useQuery({
    queryKey: ['settings', 'audit-log', 'stats'],
    queryFn: () => settingsApi.getAuditLogStats(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Export audit log
 */
export function useExportAuditLog() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: AuditLogParams) => settingsApi.exportAuditLog(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Экспорт завершен',
        description: 'Журнал аудита успешно экспортирован.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка экспорта',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
