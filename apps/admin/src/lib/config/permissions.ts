import { AdminRole } from '../types/settings';

export enum Permission {
  // Lawyer permissions
  LAWYER_VIEW = 'lawyer:view',
  LAWYER_VERIFY = 'lawyer:verify',
  LAWYER_BAN = 'lawyer:ban',
  LAWYER_EDIT = 'lawyer:edit',

  // User permissions
  USER_VIEW = 'user:view',
  USER_BAN = 'user:ban',
  USER_EDIT_SUBSCRIPTION = 'user:edit_subscription',

  // Consultation permissions
  CONSULTATION_VIEW = 'consultation:view',
  CONSULTATION_INTERVENE = 'consultation:intervene',
  CONSULTATION_REFUND = 'consultation:refund',

  // Financial permissions
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_REFUND = 'payment:refund',
  PAYOUT_PROCESS = 'payout:process',

  // Content permissions
  CONTENT_VIEW = 'content:view',
  CONTENT_EDIT = 'content:edit',

  // Settings permissions
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',

  // Analytics permissions
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',

  // Support permissions
  SUPPORT_VIEW = 'support:view',
  SUPPORT_RESPOND = 'support:respond',

  // Moderation permissions
  MODERATION_VIEW = 'moderation:view',
  MODERATION_ACTION = 'moderation:action',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission),

  [AdminRole.ADMIN]: [
    Permission.LAWYER_VIEW,
    Permission.LAWYER_VERIFY,
    Permission.LAWYER_EDIT,
    Permission.USER_VIEW,
    Permission.USER_EDIT_SUBSCRIPTION,
    Permission.CONSULTATION_VIEW,
    Permission.CONSULTATION_INTERVENE,
    Permission.PAYMENT_VIEW,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_EDIT,
    Permission.ANALYTICS_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
    Permission.MODERATION_VIEW,
    Permission.MODERATION_ACTION,
  ],

  [AdminRole.MODERATOR]: [
    Permission.LAWYER_VIEW,
    Permission.USER_VIEW,
    Permission.CONSULTATION_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
    Permission.MODERATION_VIEW,
    Permission.MODERATION_ACTION,
  ],

  [AdminRole.SUPPORT]: [
    Permission.USER_VIEW,
    Permission.CONSULTATION_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
  ],

  [AdminRole.FINANCE]: [
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_REFUND,
    Permission.PAYOUT_PROCESS,
    Permission.ANALYTICS_VIEW,
  ],

  [AdminRole.ANALYST]: [Permission.ANALYTICS_VIEW, Permission.ANALYTICS_EXPORT],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
