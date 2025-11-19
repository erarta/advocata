import { SetMetadata } from '@nestjs/common';

/**
 * Admin role types for authorization
 * - super_admin: Full system access
 * - admin: General administrative access
 * - support: Customer support operations
 * - analyst: Analytics and reporting access
 * - content_manager: Content and document management
 */
export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'support'
  | 'analyst'
  | 'content_manager';

export const ADMIN_ROLES_KEY = 'admin_roles';

/**
 * Decorator to specify required admin roles for endpoints
 * @param roles - Array of admin roles that can access the endpoint
 * @example
 * @AdminRoles('super_admin', 'admin')
 */
export const AdminRoles = (...roles: AdminRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);
