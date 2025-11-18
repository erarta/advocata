// Audit Log Page
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, Search, TrendingUp } from 'lucide-react';
import {
  useAuditLog,
  useAuditLogStats,
  useExportAuditLog,
} from '@/lib/hooks/use-settings';
import { AuditLogTable } from '@/components/settings/audit-log-table';
import { AuditAction } from '@/lib/types/settings';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAuditLog({
    action: actionFilter === 'all' ? undefined : actionFilter,
    resource: resourceFilter === 'all' ? undefined : resourceFilter,
    page,
    limit: 20,
  });

  const { data: stats, isLoading: statsLoading } = useAuditLogStats();
  const exportLog = useExportAuditLog();

  const handleExport = async () => {
    await exportLog.mutateAsync({
      action: actionFilter === 'all' ? undefined : actionFilter,
      resource: resourceFilter === 'all' ? undefined : resourceFilter,
    });
  };

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Журнал аудита</h1>
          <p className="text-gray-600 mt-2">История действий администраторов</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Журнал аудита</h1>
          <p className="text-gray-600 mt-2">История действий администраторов</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки журнала: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Журнал аудита</h1>
          <p className="text-gray-600 mt-2">История действий администраторов</p>
        </div>
        <Button onClick={handleExport} disabled={exportLog.isPending}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего действий</CardDescription>
              <CardTitle className="text-3xl">
                {stats.totalActions.toLocaleString('ru-RU')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{stats.todayActions} сегодня</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Топ администратор</CardDescription>
              <CardTitle className="text-lg">
                {stats.topAdmins[0]?.adminName || 'Нет данных'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topAdmins[0] && (
                <div className="text-sm text-gray-600">
                  {stats.topAdmins[0].actionCount} действий
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Частое действие</CardDescription>
              <CardTitle className="text-lg">
                {stats.topActions[0]?.action || 'Нет данных'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topActions[0] && (
                <div className="text-sm text-gray-600">
                  {stats.topActions[0].count} раз
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по администратору..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Действие</label>
              <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все действия</SelectItem>
                  <SelectItem value="create">Создание</SelectItem>
                  <SelectItem value="update">Изменение</SelectItem>
                  <SelectItem value="delete">Удаление</SelectItem>
                  <SelectItem value="approve">Одобрение</SelectItem>
                  <SelectItem value="reject">Отклонение</SelectItem>
                  <SelectItem value="suspend">Приостановка</SelectItem>
                  <SelectItem value="activate">Активация</SelectItem>
                  <SelectItem value="login">Вход</SelectItem>
                  <SelectItem value="logout">Выход</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ресурс</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все ресурсы</SelectItem>
                  <SelectItem value="users">Пользователи</SelectItem>
                  <SelectItem value="lawyers">Юристы</SelectItem>
                  <SelectItem value="consultations">Консультации</SelectItem>
                  <SelectItem value="payments">Платежи</SelectItem>
                  <SelectItem value="settings">Настройки</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Журнал событий</CardTitle>
          <CardDescription>
            {pagination && `Показано ${logs.length} из ${pagination.total.toLocaleString('ru-RU')} записей`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={logs} />

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Страница {pagination.page} из {pagination.total_pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Предыдущая
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.total_pages}
                >
                  Следующая
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
