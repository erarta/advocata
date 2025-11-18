'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  FileText,
  Star,
  MoreVertical,
  Eye,
  MessageSquare,
  Video,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react';
import { useConsultations, useConsultationStats, useConsultation } from '@/lib/hooks/use-consultations';
import { ConsultationStatusBadge } from '@/components/consultations/consultation-status-badge';
import { ConsultationTypeIcon } from '@/components/consultations/consultation-type-icon';
import { ConsultationDetailModal } from '@/components/consultations/consultation-detail-modal';
import { ConsultationType, ConsultationStatus } from '@/lib/types/consultation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ConsultationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('scheduledStart');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const limit = 50;

  // Fetch consultations
  const { data, isLoading, error } = useConsultations({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? (statusFilter as ConsultationStatus) : undefined,
    type: typeFilter !== 'all' ? (typeFilter as ConsultationType) : undefined,
    sortBy,
    sortOrder,
  });

  // Fetch stats
  const { data: stats } = useConsultationStats();

  // Fetch selected consultation details
  const { data: selectedConsultation } = useConsultation(selectedConsultationId || '');

  const consultations = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes} мин`;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
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
    setTypeFilter('all');
    setSortBy('scheduledStart');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">История консультаций</h1>
          <p className="text-gray-600 mt-1">
            Полный архив всех консультаций на платформе
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/consultations/live">
              <Eye className="mr-2 h-4 w-4" />
              Активные сейчас
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/consultations/disputes">
              <AlertCircle className="mr-2 h-4 w-4" />
              Споры
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
            {stats && stats.total > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {((stats.completed / stats.total) * 100).toFixed(0)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Отменено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancelled || 0}</div>
            {stats && stats.total > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {((stats.cancelled / stats.total) * 100).toFixed(0)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Средняя длительность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatDuration(stats.averageDuration) : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Средняя оценка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">
                {stats?.averageRating?.toFixed(1) || '—'}
              </div>
              {stats && stats.averageRating > 0 && (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              )}
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
                  placeholder="Поиск по клиенту, юристу, ID..."
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
                  <SelectItem value={ConsultationStatus.PENDING}>Ожидает</SelectItem>
                  <SelectItem value={ConsultationStatus.ACTIVE}>Активна</SelectItem>
                  <SelectItem value={ConsultationStatus.COMPLETED}>Завершена</SelectItem>
                  <SelectItem value={ConsultationStatus.CANCELLED}>Отменена</SelectItem>
                  <SelectItem value={ConsultationStatus.DISPUTED}>Спорная</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value={ConsultationType.CHAT}>Чат</SelectItem>
                  <SelectItem value={ConsultationType.VIDEO}>Видео</SelectItem>
                  <SelectItem value={ConsultationType.EMERGENCY}>Экстренный</SelectItem>
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
          ) : consultations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Консультации не найдены</p>
              <p className="text-sm text-gray-500 mt-2">
                {hasActiveFilters ? 'Попробуйте изменить фильтры' : 'Консультации появятся здесь'}
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
                        onClick={() => toggleSort('scheduledStart')}
                        className="-ml-3"
                      >
                        Дата
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Юрист</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Длительность</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort('payment.amount')}
                        className="-ml-3"
                      >
                        Цена
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Оценка</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell className="font-mono text-xs">
                        #{consultation.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(consultation.scheduledStart), 'dd MMM yyyy, HH:mm', {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {consultation.client.fullName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {consultation.lawyer.fullName}
                      </TableCell>
                      <TableCell>
                        <ConsultationTypeIcon type={consultation.type} showLabel />
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(consultation.duration)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(consultation.payment.amount)}
                      </TableCell>
                      <TableCell>
                        <ConsultationStatusBadge status={consultation.status} />
                      </TableCell>
                      <TableCell>
                        {consultation.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {consultation.rating.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedConsultationId(consultation.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Детали
                            </DropdownMenuItem>
                            {consultation.type === 'chat' && (
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                История чата
                              </DropdownMenuItem>
                            )}
                            {consultation.recording && (
                              <DropdownMenuItem>
                                <Video className="mr-2 h-4 w-4" />
                                Запись
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Возврат средств
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Скачать отчет
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      <ConsultationDetailModal
        consultation={selectedConsultation || null}
        open={!!selectedConsultationId}
        onOpenChange={(open) => !open && setSelectedConsultationId(null)}
        onEdit={(id) => console.log('Edit:', id)}
        onCancel={(id) => console.log('Cancel:', id)}
        onRefund={(id) => console.log('Refund:', id)}
      />
    </div>
  );
}
