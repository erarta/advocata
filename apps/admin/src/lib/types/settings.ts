// Settings Types - Phase 7: System Settings

// ==================== PLATFORM CONFIGURATION ====================

export type Language = 'ru' | 'en';
export type Currency = 'RUB' | 'USD' | 'EUR';
export type DateFormat = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '24h' | '12h';

export interface SocialMediaLinks {
  vk?: string;
  telegram?: string;
  whatsapp?: string;
  youtube?: string;
  instagram?: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  logoUrl: string;
  faviconUrl: string;
  defaultLanguage: Language;
  timezone: string;
  currency: Currency;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  supportEmail: string;
  supportPhone: string;
  socialMedia: SocialMediaLinks;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  debugMode: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface PlatformConfigUpdate {
  name?: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultLanguage?: Language;
  timezone?: string;
  currency?: Currency;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  supportEmail?: string;
  supportPhone?: string;
  socialMedia?: SocialMediaLinks;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  debugMode?: boolean;
}

// ==================== NOTIFICATION TEMPLATES ====================

export type NotificationType = 'email' | 'sms' | 'push';

export type NotificationCategory =
  | 'auth'           // Регистрация, вход, восстановление пароля
  | 'consultation'   // Бронирование, напоминание, завершение
  | 'payment'        // Оплата, возврат
  | 'lawyer'         // Верификация, статус
  | 'support'        // Ответ на запрос
  | 'marketing';     // Рассылки, акции

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  subject?: string; // For email
  bodyText: string; // Plain text / SMS
  bodyHtml?: string; // For email
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplateUpdate {
  name?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  isActive?: boolean;
}

export interface NotificationTemplateParams {
  type?: NotificationType;
  category?: NotificationCategory;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TestNotificationDto {
  recipient: string; // email or phone
  sampleData?: Record<string, string>;
}

// ==================== EMAIL & SMS CONFIGURATION ====================

export type EmailProvider = 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
export type SMSProvider = 'twilio' | 'sms_ru' | 'smsc';

export interface EmailConfig {
  id: string;
  provider: EmailProvider;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string; // Encrypted/masked
  apiKey?: string; // For SendGrid, etc. (masked)
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  isActive: boolean;
  rateLimitPerHour: number;
  updatedAt: Date;
}

export interface EmailConfigUpdate {
  provider?: EmailProvider;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  apiKey?: string;
  senderName?: string;
  senderEmail?: string;
  replyToEmail?: string;
  isActive?: boolean;
  rateLimitPerHour?: number;
}

export interface SMSConfig {
  id: string;
  provider: SMSProvider;
  apiKey: string; // Masked
  apiSecret?: string; // Masked
  senderName: string;
  isActive: boolean;
  rateLimitPerHour: number;
  updatedAt: Date;
}

export interface SMSConfigUpdate {
  provider?: SMSProvider;
  apiKey?: string;
  apiSecret?: string;
  senderName?: string;
  isActive?: boolean;
  rateLimitPerHour?: number;
}

export interface CommunicationLog {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  status: 'sent' | 'failed' | 'bounced' | 'delivered';
  provider: string;
  error?: string;
  sentAt: Date;
}

export interface CommunicationLogParams {
  type?: 'email' | 'sms';
  status?: 'sent' | 'failed' | 'bounced' | 'delivered';
  dateFrom?: string;
  dateTo?: string;
  recipient?: string;
  page?: number;
  limit?: number;
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

// ==================== FEATURE FLAGS ====================

export type FeatureFlagCategory =
  | 'consultations'  // Консультации
  | 'payments'       // Платежи
  | 'features'       // Функции
  | 'experimental'   // Экспериментальные
  | 'maintenance';   // Обслуживание

export type Environment = 'development' | 'staging' | 'production';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  category: FeatureFlagCategory;
  isEnabled: boolean;
  rolloutPercentage: number; // 0-100
  environments: Environment[];
  affectedUsersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagUpdate {
  isEnabled?: boolean;
  rolloutPercentage?: number;
  environments?: Environment[];
}

// ==================== RATE LIMITS ====================

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export type UserRole = 'client' | 'lawyer' | 'admin' | 'guest';
export type TimeWindow = 'minute' | 'hour' | 'day';

export interface RateLimit {
  id: string;
  resource: string; // /api/consultations, /api/lawyers
  method: HTTPMethod;
  role: UserRole;
  limit: number;
  window: TimeWindow;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitCreate {
  resource: string;
  method: HTTPMethod;
  role: UserRole;
  limit: number;
  window: TimeWindow;
  isActive?: boolean;
}

export interface RateLimitUpdate {
  limit?: number;
  window?: TimeWindow;
  isActive?: boolean;
}

export interface IPWhitelist {
  id: string;
  ipAddress: string;
  description: string;
  createdAt: Date;
}

export interface IPWhitelistCreate {
  ipAddress: string;
  description: string;
}

export interface IPBlacklist {
  id: string;
  ipAddress: string;
  reason: string;
  createdAt: Date;
}

export interface IPBlacklistCreate {
  ipAddress: string;
  reason: string;
}

export interface RateLimitUsage {
  resource: string;
  currentCount: number;
  limit: number;
  resetAt: Date;
}

// ==================== ADMIN ROLES & PERMISSIONS (RBAC) ====================

export type PermissionResource =
  | 'users'
  | 'lawyers'
  | 'consultations'
  | 'payments'
  | 'financial'
  | 'content'
  | 'settings'
  | 'analytics';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description: string;
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: Permission[];
  adminsCount: number;
  isSystem: boolean; // Cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminRoleCreate {
  name: string;
  slug: string;
  description: string;
  permissionIds: string[];
}

export interface AdminRoleUpdate {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

// ==================== AUDIT LOG ====================

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'activate'
  | 'login'
  | 'logout';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminAvatar?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface AuditLogParams {
  adminId?: string;
  action?: AuditAction;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalActions: number;
  todayActions: number;
  topAdmins: Array<{
    adminId: string;
    adminName: string;
    actionCount: number;
  }>;
  topActions: Array<{
    action: AuditAction;
    count: number;
  }>;
}

// ==================== SHARED TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Legacy types (keep for backward compatibility)
export enum AdminRoleEnum {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  FINANCE = 'finance',
  ANALYST = 'analyst',
}

export interface PlatformSettings {
  name: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
}

export interface FeatureFlagLegacy {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}
