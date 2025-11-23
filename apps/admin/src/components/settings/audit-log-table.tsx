// Audit Log Table Component
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { AuditLogEntry } from '@/lib/types/settings';
import { AuditActionBadge } from './audit-action-badge';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  onViewDetails?: (log: AuditLogEntry) => void;
}

export function AuditLogTable({ logs, onViewDetails }: AuditLogTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Администратор</TableHead>
            <TableHead>Действие</TableHead>
            <TableHead>Ресурс</TableHead>
            <TableHead>IP-адрес</TableHead>
            <TableHead>Время</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                Нет записей в журнале
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={log.adminAvatar} />
                      <AvatarFallback>{getInitials(log.adminName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{log.adminName}</div>
                      <div className="text-xs text-gray-500">{log.adminId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <AuditActionBadge action={log.action} />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.resource}</div>
                    {log.resourceId && (
                      <div className="text-xs text-gray-500">ID: {log.resourceId}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {log.ipAddress}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString('ru-RU')}
                  </div>
                </TableCell>
                <TableCell>
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
