import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminRolesQuery } from './get-admin-roles.query';

interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

@QueryHandler(GetAdminRolesQuery)
export class GetAdminRolesHandler
  implements IQueryHandler<GetAdminRolesQuery>
{
  constructor() {}

  async execute(query: GetAdminRolesQuery): Promise<{ roles: AdminRole[] }> {
    // TODO: Replace with database integration
    // For now, return mock admin roles

    const mockRoles: AdminRole[] = [
      {
        id: 'role_001',
        name: 'Super Admin',
        slug: 'super_admin',
        description: 'Полный доступ ко всем функциям системы',
        permissions: [
          'users.*',
          'lawyers.*',
          'consultations.*',
          'payments.*',
          'analytics.*',
          'settings.*',
          'admin.*',
        ],
        isSystem: true,
        userCount: 2,
      },
      {
        id: 'role_002',
        name: 'Admin',
        slug: 'admin',
        description: 'Доступ к большинству функций управления',
        permissions: [
          'users.read',
          'users.update',
          'lawyers.read',
          'lawyers.verify',
          'lawyers.update',
          'consultations.*',
          'analytics.read',
        ],
        isSystem: true,
        userCount: 5,
      },
      {
        id: 'role_003',
        name: 'Support',
        slug: 'support',
        description: 'Поддержка пользователей',
        permissions: [
          'users.read',
          'lawyers.read',
          'consultations.read',
          'support.*',
        ],
        isSystem: true,
        userCount: 8,
      },
      {
        id: 'role_004',
        name: 'Analyst',
        slug: 'analyst',
        description: 'Просмотр аналитики и отчетов',
        permissions: ['analytics.*', 'users.read', 'lawyers.read'],
        isSystem: true,
        userCount: 3,
      },
      {
        id: 'role_005',
        name: 'Content Manager',
        slug: 'content_manager',
        description: 'Управление контентом платформы',
        permissions: [
          'content.*',
          'faq.*',
          'documents.*',
          'legal_pages.*',
        ],
        isSystem: false,
        userCount: 4,
      },
    ];

    return { roles: mockRoles };
  }
}
