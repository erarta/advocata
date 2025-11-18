// Settings API Client - Phase 7: System Settings
import {
  PlatformConfig,
  PlatformConfigUpdate,
  NotificationTemplate,
  NotificationTemplateUpdate,
  NotificationTemplateParams,
  TestNotificationDto,
  TemplateVariable,
  EmailConfig,
  EmailConfigUpdate,
  SMSConfig,
  SMSConfigUpdate,
  CommunicationLog,
  CommunicationLogParams,
  TestResult,
  FeatureFlag,
  FeatureFlagUpdate,
  RateLimit,
  RateLimitCreate,
  RateLimitUpdate,
  IPWhitelist,
  IPWhitelistCreate,
  IPBlacklist,
  IPBlacklistCreate,
  RateLimitUsage,
  AdminRole,
  AdminRoleCreate,
  AdminRoleUpdate,
  Permission,
  AdminUser,
  AssignRoleDto,
  AuditLogEntry,
  AuditLogParams,
  AuditLogStats,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types/settings';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add authentication header from session
      // 'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// ==================== PLATFORM CONFIGURATION APIs ====================

/**
 * Get platform configuration
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  // TODO: Replace with actual backend endpoint
  return apiCall<PlatformConfig>('/admin/settings/platform');
}

/**
 * Update platform configuration
 * NOTE: Critical operation - affects entire platform
 */
export async function updatePlatformConfig(
  data: PlatformConfigUpdate
): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>('/admin/settings/platform', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Upload platform logo
 */
export async function uploadLogo(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('logo', file);

  // TODO: Replace with actual backend endpoint
  const response = await fetch(`${API_BASE_URL}/admin/settings/platform/logo`, {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header for FormData
  });

  if (!response.ok) {
    throw new Error('Failed to upload logo');
  }

  return response.json();
}

/**
 * Upload platform favicon
 */
export async function uploadFavicon(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('favicon', file);

  // TODO: Replace with actual backend endpoint
  const response = await fetch(`${API_BASE_URL}/admin/settings/platform/favicon`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload favicon');
  }

  return response.json();
}

/**
 * Test email configuration
 */
export async function testEmail(): Promise<TestResult> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TestResult>('/admin/settings/platform/test-email', {
    method: 'POST',
  });
}

/**
 * Test SMS configuration
 */
export async function testSMS(): Promise<TestResult> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TestResult>('/admin/settings/platform/test-sms', {
    method: 'POST',
  });
}

// ==================== NOTIFICATION TEMPLATES APIs ====================

/**
 * Get notification templates with filters
 */
export async function getNotificationTemplates(
  params?: NotificationTemplateParams
): Promise<PaginatedResponse<NotificationTemplate>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  // TODO: Replace with actual backend endpoint
  const endpoint = `/admin/settings/notifications/templates?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<NotificationTemplate>>(endpoint);
}

/**
 * Get single notification template
 */
export async function getNotificationTemplate(
  id: string
): Promise<NotificationTemplate> {
  // TODO: Replace with actual backend endpoint
  return apiCall<NotificationTemplate>(`/admin/settings/notifications/templates/${id}`);
}

/**
 * Update notification template
 */
export async function updateNotificationTemplate(
  id: string,
  data: NotificationTemplateUpdate
): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/notifications/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Test notification template by sending to recipient
 */
export async function testNotificationTemplate(
  id: string,
  data: TestNotificationDto
): Promise<TestResult> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TestResult>(`/admin/settings/notifications/templates/${id}/test`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get available template variables
 */
export async function getTemplateVariables(): Promise<TemplateVariable[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TemplateVariable[]>('/admin/settings/notifications/variables');
}

// ==================== EMAIL CONFIGURATION APIs ====================

/**
 * Get email configuration
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  // TODO: Replace with actual backend endpoint
  return apiCall<EmailConfig>('/admin/settings/communication/email');
}

/**
 * Update email configuration
 * NOTE: Sensitive operation - API keys are masked on read
 */
export async function updateEmailConfig(data: EmailConfigUpdate): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>('/admin/settings/communication/email', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Test email configuration/connection
 */
export async function testEmailConfig(): Promise<TestResult> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TestResult>('/admin/settings/communication/email/test', {
    method: 'POST',
  });
}

// ==================== SMS CONFIGURATION APIs ====================

/**
 * Get SMS configuration
 */
export async function getSMSConfig(): Promise<SMSConfig> {
  // TODO: Replace with actual backend endpoint
  return apiCall<SMSConfig>('/admin/settings/communication/sms');
}

/**
 * Update SMS configuration
 * NOTE: Sensitive operation - API keys are masked on read
 */
export async function updateSMSConfig(data: SMSConfigUpdate): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>('/admin/settings/communication/sms', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Test SMS configuration/connection
 */
export async function testSMSConfig(): Promise<TestResult> {
  // TODO: Replace with actual backend endpoint
  return apiCall<TestResult>('/admin/settings/communication/sms/test', {
    method: 'POST',
  });
}

// ==================== COMMUNICATION LOGS APIs ====================

/**
 * Get communication logs with filters
 */
export async function getCommunicationLogs(
  params: CommunicationLogParams
): Promise<PaginatedResponse<CommunicationLog>> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // TODO: Replace with actual backend endpoint
  const endpoint = `/admin/settings/communication/logs?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<CommunicationLog>>(endpoint);
}

// ==================== FEATURE FLAGS APIs ====================

/**
 * Get all feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<FeatureFlag[]>('/admin/settings/features');
}

/**
 * Get single feature flag
 */
export async function getFeatureFlag(id: string): Promise<FeatureFlag> {
  // TODO: Replace with actual backend endpoint
  return apiCall<FeatureFlag>(`/admin/settings/features/${id}`);
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  id: string,
  data: FeatureFlagUpdate
): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/features/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Quick toggle feature flag on/off
 */
export async function toggleFeatureFlag(id: string): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/features/${id}/toggle`, {
    method: 'POST',
  });
}

// ==================== RATE LIMITS APIs ====================

/**
 * Get all rate limits
 */
export async function getRateLimits(): Promise<RateLimit[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<RateLimit[]>('/admin/settings/rate-limits');
}

/**
 * Get single rate limit
 */
export async function getRateLimit(id: string): Promise<RateLimit> {
  // TODO: Replace with actual backend endpoint
  return apiCall<RateLimit>(`/admin/settings/rate-limits/${id}`);
}

/**
 * Create new rate limit
 */
export async function createRateLimit(data: RateLimitCreate): Promise<RateLimit> {
  // TODO: Replace with actual backend endpoint
  return apiCall<RateLimit>('/admin/settings/rate-limits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update rate limit
 */
export async function updateRateLimit(
  id: string,
  data: RateLimitUpdate
): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/rate-limits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete rate limit
 */
export async function deleteRateLimit(id: string): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/rate-limits/${id}`, {
    method: 'DELETE',
  });
}

// ==================== IP WHITELIST APIs ====================

/**
 * Get IP whitelist
 */
export async function getIPWhitelist(): Promise<IPWhitelist[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<IPWhitelist[]>('/admin/settings/rate-limits/whitelist');
}

/**
 * Add IP to whitelist
 */
export async function addIPToWhitelist(data: IPWhitelistCreate): Promise<IPWhitelist> {
  // TODO: Replace with actual backend endpoint
  return apiCall<IPWhitelist>('/admin/settings/rate-limits/whitelist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Remove IP from whitelist
 */
export async function removeIPFromWhitelist(id: string): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/rate-limits/whitelist/${id}`, {
    method: 'DELETE',
  });
}

// ==================== IP BLACKLIST APIs ====================

/**
 * Get IP blacklist
 */
export async function getIPBlacklist(): Promise<IPBlacklist[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<IPBlacklist[]>('/admin/settings/rate-limits/blacklist');
}

/**
 * Add IP to blacklist
 */
export async function addIPToBlacklist(data: IPBlacklistCreate): Promise<IPBlacklist> {
  // TODO: Replace with actual backend endpoint
  return apiCall<IPBlacklist>('/admin/settings/rate-limits/blacklist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Remove IP from blacklist
 */
export async function removeIPFromBlacklist(id: string): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/rate-limits/blacklist/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get current rate limit usage
 */
export async function getRateLimitUsage(): Promise<RateLimitUsage[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<RateLimitUsage[]>('/admin/settings/rate-limits/usage');
}

// ==================== ADMIN ROLES & PERMISSIONS APIs ====================

/**
 * Get all admin roles
 */
export async function getAdminRoles(): Promise<AdminRole[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AdminRole[]>('/admin/settings/permissions/roles');
}

/**
 * Get single admin role
 */
export async function getAdminRole(id: string): Promise<AdminRole> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AdminRole>(`/admin/settings/permissions/roles/${id}`);
}

/**
 * Create new admin role
 */
export async function createAdminRole(data: AdminRoleCreate): Promise<AdminRole> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AdminRole>('/admin/settings/permissions/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update admin role
 */
export async function updateAdminRole(
  id: string,
  data: AdminRoleUpdate
): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/permissions/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete admin role
 * NOTE: Cannot delete system roles
 */
export async function deleteAdminRole(id: string): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>(`/admin/settings/permissions/roles/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all available permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<Permission[]>('/admin/settings/permissions/available');
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AdminUser[]>('/admin/settings/permissions/users');
}

/**
 * Assign role to admin user
 * NOTE: Requires audit logging
 */
export async function assignRole(data: AssignRoleDto): Promise<void> {
  // TODO: Replace with actual backend endpoint
  await apiCall<void>('/admin/settings/permissions/assign-role', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get role change audit log
 */
export async function getRoleAuditLog(roleId: string): Promise<AuditLogEntry[]> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AuditLogEntry[]>(`/admin/settings/permissions/roles/${roleId}/audit`);
}

// ==================== AUDIT LOG APIs ====================

/**
 * Get audit log with filters
 */
export async function getAuditLog(
  params: AuditLogParams
): Promise<PaginatedResponse<AuditLogEntry>> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // TODO: Replace with actual backend endpoint
  const endpoint = `/admin/settings/audit-log?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<AuditLogEntry>>(endpoint);
}

/**
 * Get single audit log entry
 */
export async function getAuditLogEntry(id: string): Promise<AuditLogEntry> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AuditLogEntry>(`/admin/settings/audit-log/${id}`);
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(): Promise<AuditLogStats> {
  // TODO: Replace with actual backend endpoint
  return apiCall<AuditLogStats>('/admin/settings/audit-log/stats');
}

/**
 * Export audit log to CSV/Excel
 */
export async function exportAuditLog(params: AuditLogParams): Promise<Blob> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // TODO: Replace with actual backend endpoint
  const response = await fetch(
    `${API_BASE_URL}/admin/settings/audit-log/export?${queryParams.toString()}`,
    {
      headers: {
        // TODO: Add authentication header
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export audit log');
  }

  return response.blob();
}
