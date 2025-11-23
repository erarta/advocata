import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditLogQuery } from './get-audit-log.query';

interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

@QueryHandler(GetAuditLogQuery)
export class GetAuditLogHandler implements IQueryHandler<GetAuditLogQuery> {
  constructor() {}

  async execute(
    query: GetAuditLogQuery,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    // TODO: Replace with database integration
    // For now, return mock audit log entries

    const mockAuditLogs: AuditLogEntry[] = [
      {
        id: 'audit_001',
        adminId: 'admin_001',
        adminName: 'Алексей Иванов',
        adminEmail: 'admin@advocata.ru',
        action: 'approve',
        resource: 'lawyer',
        resourceId: 'lawyer_123',
        oldValue: { status: 'pending' },
        newValue: { status: 'active' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-19T10:30:00'),
      },
      {
        id: 'audit_002',
        adminId: 'admin_002',
        adminName: 'Мария Петрова',
        adminEmail: 'maria@advocata.ru',
        action: 'update',
        resource: 'user',
        resourceId: 'user_456',
        oldValue: { email: 'old@email.com' },
        newValue: { email: 'new@email.com' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-19T09:15:00'),
      },
      {
        id: 'audit_003',
        adminId: 'admin_001',
        adminName: 'Алексей Иванов',
        adminEmail: 'admin@advocata.ru',
        action: 'delete',
        resource: 'consultation',
        resourceId: 'cons_789',
        oldValue: { status: 'cancelled' },
        newValue: null,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-18T16:45:00'),
      },
      {
        id: 'audit_004',
        adminId: 'admin_003',
        adminName: 'Дмитрий Сидоров',
        adminEmail: 'support@advocata.ru',
        action: 'create',
        resource: 'support_ticket',
        resourceId: 'ticket_999',
        oldValue: null,
        newValue: { subject: 'Проблема с оплатой', status: 'open' },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-18T14:20:00'),
      },
      {
        id: 'audit_005',
        adminId: 'admin_001',
        adminName: 'Алексей Иванов',
        adminEmail: 'admin@advocata.ru',
        action: 'suspend',
        resource: 'user',
        resourceId: 'user_111',
        oldValue: { status: 'active' },
        newValue: { status: 'suspended', reason: 'Нарушение правил' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-17T11:00:00'),
      },
      {
        id: 'audit_006',
        adminId: 'admin_004',
        adminName: 'Елена Смирнова',
        adminEmail: 'analyst@advocata.ru',
        action: 'login',
        resource: 'admin_session',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date('2025-11-19T08:00:00'),
      },
    ];

    // Filter by adminId, action, resource, and date range
    let filteredLogs = mockAuditLogs;
    if (query.adminId) {
      filteredLogs = filteredLogs.filter((log) => log.adminId === query.adminId);
    }
    if (query.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === query.action);
    }
    if (query.resource) {
      filteredLogs = filteredLogs.filter(
        (log) => log.resource === query.resource,
      );
    }
    if (query.dateFrom) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= query.dateFrom,
      );
    }
    if (query.dateTo) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= query.dateTo);
    }

    // Pagination
    const total = filteredLogs.length;
    const startIndex = (query.page - 1) * query.limit;
    const paginatedLogs = filteredLogs.slice(
      startIndex,
      startIndex + query.limit,
    );

    return {
      items: paginatedLogs,
      total,
    };
  }
}
