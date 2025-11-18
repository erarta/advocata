// Settings Types
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  FINANCE = 'finance',
  ANALYST = 'analyst',
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface PlatformSettings {
  name: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
  updatedAt: Date;
}
