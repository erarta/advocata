'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Clock,
  Phone,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Map as MapIcon,
} from 'lucide-react';
import { useEmergencyCalls, useEmergencyCallStats } from '@/lib/hooks/use-consultations';
import { EmergencyCallCard } from '@/components/consultations/emergency-call-card';
import { EmergencyCallMap } from '@/components/consultations/emergency-call-map';

export default function EmergencyCallsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  // Fetch data with auto-refresh every 5 seconds
  const {
    data: emergencyCalls,
    isLoading,
    error,
    dataUpdatedAt,
  } = useEmergencyCalls(
    {
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    },
    5000
  );

  const { data: stats } = useEmergencyCallStats();

  // Calculate stats from calls
  const activeCount =
    emergencyCalls?.filter((c) => c.status === 'active' || c.status === 'assigned').length || 0;
  const pendingCount = emergencyCalls?.filter((c) => c.status === 'pending').length || 0;
  const urgentCount = emergencyCalls?.filter((c) => c.isUrgent && c.status !== 'completed').length || 0;

  const formatResponseTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Экстренные вызовы</h1>
          <p className="text-gray-600 mt-1">
            Мониторинг и управление экстренными запросами юридической помощи
          </p>
        </div>
        {urgentCount > 0 && (
          <Badge variant="destructive" className="animate-pulse text-lg px-4 py-2">
            <AlertCircle className="mr-2 h-5 w-5" />
            {urgentCount} срочных
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Активные вызовы</CardTitle>
            <Phone className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="text-2xl font-bold">{activeCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают назначения</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Среднее время ответа</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatResponseTime(stats.averageResponseTime) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидает назначения</SelectItem>
                  <SelectItem value="assigned">Назначен юрист</SelectItem>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                  <SelectItem value="cancelled">Отменен</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Список
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  Карта
                </Button>
              </div>
            </div>

            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Обновление каждые 5с</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48" />
              </CardContent>
            </Card>
          ))}
        </div>
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
      ) : !emergencyCalls || emergencyCalls.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium">Нет экстренных вызовов</p>
            <p className="text-sm text-gray-500 mt-2">
              Вызовы появятся здесь, как только будут созданы
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'map' ? (
        /* Map View */
        <EmergencyCallMap
          calls={emergencyCalls}
          onMarkerClick={(id) => {
            console.log('View call:', id);
            // TODO: Open detail modal
          }}
          className="h-[600px]"
        />
      ) : (
        /* List View */
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Ожидают
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Активные
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Все ({emergencyCalls.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {emergencyCalls
              .filter((call) => call.status === 'pending')
              .sort((a, b) => (a.isUrgent === b.isUrgent ? 0 : a.isUrgent ? -1 : 1))
              .map((call) => (
                <EmergencyCallCard
                  key={call.id}
                  call={call}
                  onViewDetails={(id) => console.log('View details:', id)}
                  onAssignLawyer={(id) => console.log('Assign lawyer:', id)}
                  onContactClient={(id) => console.log('Contact client:', id)}
                  onViewLocation={(id) => console.log('View location:', id)}
                />
              ))}
            {emergencyCalls.filter((call) => call.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-600">Нет ожидающих вызовов</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Все вызовы обработаны
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {emergencyCalls
              .filter((call) => call.status === 'assigned' || call.status === 'active')
              .map((call) => (
                <EmergencyCallCard
                  key={call.id}
                  call={call}
                  onViewDetails={(id) => console.log('View details:', id)}
                  onAssignLawyer={(id) => console.log('Assign lawyer:', id)}
                  onContactClient={(id) => console.log('Contact client:', id)}
                  onViewLocation={(id) => console.log('View location:', id)}
                />
              ))}
            {emergencyCalls.filter((call) => call.status === 'assigned' || call.status === 'active')
              .length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Нет активных вызовов</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {emergencyCalls.map((call) => (
              <EmergencyCallCard
                key={call.id}
                call={call}
                onViewDetails={(id) => console.log('View details:', id)}
                onAssignLawyer={(id) => console.log('Assign lawyer:', id)}
                onContactClient={(id) => console.log('Contact client:', id)}
                onViewLocation={(id) => console.log('View location:', id)}
              />
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Last updated */}
      {dataUpdatedAt && (
        <div className="text-center text-xs text-gray-400">
          Последнее обновление: {new Date(dataUpdatedAt).toLocaleTimeString('ru-RU')}
        </div>
      )}
    </div>
  );
}
