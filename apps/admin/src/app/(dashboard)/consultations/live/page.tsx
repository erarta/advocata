'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useLiveConsultations, useConsultationStats } from '@/lib/hooks/use-consultations';
import { LiveConsultationCard } from '@/components/consultations/live-consultation-card';
import { ConsultationDetailModal } from '@/components/consultations/consultation-detail-modal';
import { ConsultationType, ConsultationStatus } from '@/lib/types/consultation';

export default function LiveConsultationsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  // Fetch data with auto-refresh every 10 seconds
  const {
    data: liveConsultations,
    isLoading,
    error,
    dataUpdatedAt,
  } = useLiveConsultations(10000);

  const { data: stats } = useConsultationStats();

  // Filter consultations
  const filteredConsultations =
    liveConsultations?.filter((consultation) => {
      const matchesType = typeFilter === 'all' || consultation.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        consultation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.lawyerName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    }) || [];

  // Calculate stats from live data
  const activeCount = liveConsultations?.length || 0;
  const waitingCount =
    liveConsultations?.filter((c) => c.status === ConsultationStatus.PENDING).length || 0;
  const inProgressCount =
    liveConsultations?.filter((c) => c.status === ConsultationStatus.ACTIVE).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Мониторинг консультаций в реальном времени</h1>
        <p className="text-gray-600 mt-1">
          Отслеживайте активные консультации и управляйте текущими сессиями
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Активно сейчас</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-2xl font-bold">{activeCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают юриста</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">В процессе</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Завершено сегодня</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedToday || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Поиск по клиенту или юристу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value={ConsultationStatus.PENDING}>Ожидает</SelectItem>
                <SelectItem value={ConsultationStatus.ACTIVE}>В процессе</SelectItem>
              </SelectContent>
            </Select>

            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Обновление каждые 10с</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Consultations List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-gray-600">Ошибка загрузки данных</p>
              <p className="text-sm text-gray-500 mt-2">
                {error instanceof Error ? error.message : 'Неизвестная ошибка'}
              </p>
            </CardContent>
          </Card>
        ) : filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Нет активных консультаций</p>
              <p className="text-sm text-gray-500 mt-2">
                {liveConsultations && liveConsultations.length > 0
                  ? 'Нет результатов по заданным фильтрам'
                  : 'Консультации появятся здесь, как только начнутся'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredConsultations.map((consultation) => (
              <LiveConsultationCard
                key={consultation.id}
                consultation={consultation}
                onViewDetails={setSelectedConsultationId}
                onViewChat={(id) => {
                  // TODO: Open chat viewer
                  console.log('View chat:', id);
                }}
                onJoinSession={(id) => {
                  // TODO: Open video session
                  console.log('Join session:', id);
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Results count */}
      {!isLoading && filteredConsultations.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Показано {filteredConsultations.length} из {liveConsultations?.length || 0} консультаций
        </div>
      )}

      {/* Last updated */}
      {dataUpdatedAt && (
        <div className="text-center text-xs text-gray-400">
          Последнее обновление: {new Date(dataUpdatedAt).toLocaleTimeString('ru-RU')}
        </div>
      )}

      {/* Detail Modal */}
      {/* TODO: Fetch full consultation details when modal opens */}
      <ConsultationDetailModal
        consultation={null}
        open={!!selectedConsultationId}
        onOpenChange={(open) => !open && setSelectedConsultationId(null)}
      />
    </div>
  );
}
