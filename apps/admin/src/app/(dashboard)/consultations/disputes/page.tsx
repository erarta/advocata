'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  ArrowUpDown,
  X,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { useDisputes, useDisputeStats, useDispute } from '@/lib/hooks/use-consultations';
import { DisputeStatusBadge } from '@/components/consultations/dispute-status-badge';
import { DisputePriorityBadge } from '@/components/consultations/dispute-priority-badge';
import { DisputeDetailModal } from '@/components/consultations/dispute-detail-modal';
import { DisputeStatus, DisputeReason } from '@/lib/types/consultation';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const reasonLabels: Record<DisputeReason, string> = {
  [DisputeReason.UNPROFESSIONAL_BEHAVIOR]: 'Непрофессиональное поведение',
  [DisputeReason.NO_SHOW]: 'Неявка',
  [DisputeReason.POOR_QUALITY]: 'Низкое качество',
  [DisputeReason.TECHNICAL_ISSUES]: 'Технические проблемы',
  [DisputeReason.PAYMENT_ISSUE]: 'Проблема с оплатой',
  [DisputeReason.OTHER]: 'Другое',
};

export default function DisputesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('filedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const limit = 50;

  // Fetch disputes
  const { data, isLoading, error } = useDisputes({
    page,
    limit,
    status: statusFilter !== 'all' ? (statusFilter as DisputeStatus) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as any) : undefined,
    reason: reasonFilter !== 'all' ? (reasonFilter as DisputeReason) : undefined,
    sortBy,
    sortOrder,
  });

  // Fetch stats
  const { data: stats } = useDisputeStats();

  // Fetch selected dispute
  const { data: selectedDispute } = useDispute(selectedDisputeId || '');

  const disputes = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const formatResolutionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `${hours}ч`;
    const days = Math.floor(hours / 24);
    return `${days}д`;
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setReasonFilter('all');
    setSortBy('filedAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    search || statusFilter !== 'all' || priorityFilter !== 'all' || reasonFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Разрешение споров</h1>
        <p className="text-gray-600 mt-1">
          Управление и разрешение споров между клиентами и юристами
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Открытые споры</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.open || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">На рассмотрении</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inReview || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Решено сегодня</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resolvedToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Среднее время</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatResolutionTime(stats.averageResolutionTime) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Поиск по ID консультации, клиенту, юристу..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value={DisputeStatus.PENDING}>Новый</SelectItem>
                  <SelectItem value={DisputeStatus.UNDER_REVIEW}>На рассмотрении</SelectItem>
                  <SelectItem value={DisputeStatus.AWAITING_RESPONSE}>Ожидает ответа</SelectItem>
                  <SelectItem value={DisputeStatus.RESOLVED}>Решен</SelectItem>
                  <SelectItem value={DisputeStatus.CLOSED}>Закрыт</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={priorityFilter}
                onValueChange={(value) => {
                  setPriorityFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>

              {/* Reason Filter */}
              <Select
                value={reasonFilter}
                onValueChange={(value) => {
                  setReasonFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Причина" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все причины</SelectItem>
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Сбросить
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-gray-600">Ошибка загрузки данных</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8 text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Споры не найдены</p>
              <p className="text-sm text-gray-500 mt-2">
                {hasActiveFilters ? 'Попробуйте изменить фильтры' : 'Споры появятся здесь'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('filedAt')}
                        className="-ml-3"
                      >
                        Подан
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Консультация</TableHead>
                    <TableHead>Подал</TableHead>
                    <TableHead>Против</TableHead>
                    <TableHead>Причина</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Назначен</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-xs">
                        #{dispute.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(dispute.filedAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        #{dispute.consultationId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{dispute.filedByName}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {dispute.filedBy === 'client' ? 'Клиент' : 'Юрист'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{dispute.againstName}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {dispute.filedBy === 'client' ? 'Юрист' : 'Клиент'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{reasonLabels[dispute.reason]}</span>
                      </TableCell>
                      <TableCell>
                        <DisputePriorityBadge priority={dispute.priority} />
                      </TableCell>
                      <TableCell>
                        <DisputeStatusBadge status={dispute.status} />
                      </TableCell>
                      <TableCell>
                        {dispute.investigation ? (
                          <span className="text-sm">{dispute.investigation.investigatedBy}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDisputeId(dispute.id)}
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          Открыть
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Страница {page} из {totalPages} • Всего: {data?.total || 0}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Вперед
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DisputeDetailModal
        dispute={selectedDispute || null}
        open={!!selectedDisputeId}
        onOpenChange={(open) => !open && setSelectedDisputeId(null)}
        onResolve={(id, resolution) => {
          console.log('Resolve dispute:', id, resolution);
          // TODO: Call mutation
        }}
        onUpdatePriority={(id, priority) => {
          console.log('Update priority:', id, priority);
          // TODO: Call mutation
        }}
        onAssign={(id, adminId) => {
          console.log('Assign:', id, adminId);
          // TODO: Call mutation
        }}
      />
    </div>
  );
}
