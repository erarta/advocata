import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminUsersQuery } from './get-admin-users.query';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'suspended' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
}

@QueryHandler(GetAdminUsersQuery)
export class GetAdminUsersHandler
  implements IQueryHandler<GetAdminUsersQuery>
{
  constructor() {}

  async execute(
    query: GetAdminUsersQuery,
  ): Promise<{ items: AdminUser[]; total: number }> {
    // TODO: Replace with database integration
    // For now, return mock admin users

    const mockAdminUsers: AdminUser[] = [
      {
        id: 'admin_001',
        email: 'admin@advocata.ru',
        fullName: 'Алексей Иванов',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date('2025-11-19T10:30:00'),
        createdAt: new Date('2025-01-01'),
        permissions: ['users.*', 'lawyers.*', 'consultations.*', 'settings.*'],
      },
      {
        id: 'admin_002',
        email: 'maria@advocata.ru',
        fullName: 'Мария Петрова',
        role: 'admin',
        status: 'active',
        lastLogin: new Date('2025-11-19T09:15:00'),
        createdAt: new Date('2025-02-10'),
        permissions: ['users.read', 'lawyers.read', 'consultations.*'],
      },
      {
        id: 'admin_003',
        email: 'support@advocata.ru',
        fullName: 'Дмитрий Сидоров',
        role: 'support',
        status: 'active',
        lastLogin: new Date('2025-11-18T16:45:00'),
        createdAt: new Date('2025-03-15'),
        permissions: ['users.read', 'support.*'],
      },
      {
        id: 'admin_004',
        email: 'analyst@advocata.ru',
        fullName: 'Елена Смирнова',
        role: 'analyst',
        status: 'active',
        lastLogin: new Date('2025-11-19T08:00:00'),
        createdAt: new Date('2025-04-01'),
        permissions: ['analytics.*', 'users.read'],
      },
      {
        id: 'admin_005',
        email: 'content@advocata.ru',
        fullName: 'Андрей Козлов',
        role: 'content_manager',
        status: 'active',
        lastLogin: new Date('2025-11-17T14:20:00'),
        createdAt: new Date('2025-05-10'),
        permissions: ['content.*', 'faq.*'],
      },
      {
        id: 'admin_006',
        email: 'olga@advocata.ru',
        fullName: 'Ольга Новикова',
        role: 'support',
        status: 'suspended',
        lastLogin: new Date('2025-11-10T12:00:00'),
        createdAt: new Date('2025-06-01'),
        permissions: ['support.*'],
      },
    ];

    // Filter by role, status, and search
    let filteredUsers = mockAdminUsers;
    if (query.role) {
      filteredUsers = filteredUsers.filter((u) => u.role === query.role);
    }
    if (query.status) {
      filteredUsers = filteredUsers.filter((u) => u.status === query.status);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          u.fullName.toLowerCase().includes(searchLower),
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const startIndex = (query.page - 1) * query.limit;
    const paginatedUsers = filteredUsers.slice(
      startIndex,
      startIndex + query.limit,
    );

    return {
      items: paginatedUsers,
      total,
    };
  }
}
