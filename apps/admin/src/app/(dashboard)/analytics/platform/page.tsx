'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, CheckCircle, Clock, ThumbsUp } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { AreaChart } from '@/components/analytics/area-chart';
import { LineChart } from '@/components/analytics/line-chart';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  usePlatformMetrics,
  useConsultationVolume,
  useSuccessMetrics,
  useGeographicDistribution,
} from '@/lib/hooks/use-analytics';
import { formatNumber, formatPercentage, formatDuration, formatCurrency } from '@/lib/utils/formatters';
import { subDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PlatformPerformancePage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics(params);
  const { data: volume, isLoading: volumeLoading } = useConsultationVolume(params);
  const { data: successMetrics, isLoading: successLoading } = useSuccessMetrics(params);
  const { data: geographic, isLoading: geoLoading } = useGeographicDistribution(params);

  // Prepare volume chart data
  const volumeChartData = volume
    ? volume.total.map((item, index) => ({
        date: format(new Date(item.date), 'dd MMM', { locale: ru }),
        Всего: item.value as number,
        Чат: volume.byType.chat[index]?.value as number || 0,
        Видео: volume.byType.video[index]?.value as number || 0,
        Звонок: volume.byType.voice[index]?.value as number || 0,
        Личная: volume.byType.inPerson[index]?.value as number || 0,
      }))
    : [];

  // Prepare success metrics chart data
  const successChartData = successMetrics
    ? successMetrics.completionRate.map((item, index) => ({
        date: format(new Date(item.date), 'dd MMM', { locale: ru }),
        'Завершено': item.value as number,
        'Отменено': successMetrics.cancellationRate[index]?.value as number || 0,
        'Споры': successMetrics.disputeRate[index]?.value as number || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Производительность платформы</h1>
          <p className="text-muted-foreground">
            Общие метрики работы платформы
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
          />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Всего консультаций"
          value={metrics ? formatNumber(metrics.totalConsultations) : '-'}
          change={metrics?.totalConsultationsGrowth}
          subtitle="за выбранный период"
          icon={<MessageSquare className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Процент завершения"
          value={metrics ? formatPercentage(metrics.completionRate) : '-'}
          change={metrics?.completionRateTrend}
          subtitle="успешно завершенных"
          icon={<CheckCircle className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Средняя длительность"
          value={metrics ? formatDuration(metrics.averageSessionDuration) : '-'}
          change={metrics?.averageSessionDurationTrend}
          subtitle="сессии консультации"
          icon={<Clock className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Удовлетворенность (CSAT)"
          value={metrics ? metrics.customerSatisfaction.toFixed(1) : '-'}
          subtitle={`NPS: ${metrics?.npsScore.toFixed(0) || '-'}`}
          icon={<ThumbsUp className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Consultation Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Объем консультаций</CardTitle>
          <CardDescription>Количество консультаций по типам</CardDescription>
        </CardHeader>
        <CardContent>
          {volumeLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : volumeChartData.length > 0 ? (
            <AreaChart
              data={volumeChartData}
              xDataKey="date"
              areas={[
                { dataKey: 'Чат', name: 'Чат', color: 'hsl(220, 70%, 50%)' },
                { dataKey: 'Видео', name: 'Видео', color: 'hsl(142, 70%, 45%)' },
                { dataKey: 'Звонок', name: 'Звонок', color: 'hsl(280, 60%, 50%)' },
                { dataKey: 'Личная', name: 'Личная', color: 'hsl(30, 70%, 50%)' },
              ]}
              stacked
              valueFormatter={(value) => formatNumber(value)}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Метрики успеха</CardTitle>
          <CardDescription>
            Процент завершений, отмен и споров по времени
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : successChartData.length > 0 ? (
            <LineChart
              data={successChartData}
              xDataKey="date"
              lines={[
                { dataKey: 'Завершено', name: 'Завершено', color: 'hsl(142, 70%, 45%)', strokeWidth: 2 },
                { dataKey: 'Отменено', name: 'Отменено', color: 'hsl(30, 70%, 50%)', strokeWidth: 2 },
                { dataKey: 'Споры', name: 'Споры', color: 'hsl(0, 70%, 50%)', strokeWidth: 2 },
              ]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>География</CardTitle>
          <CardDescription>Распределение по городам</CardDescription>
        </CardHeader>
        <CardContent>
          {geoLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : geographic && geographic.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Город</TableHead>
                    <TableHead className="text-right">Консультации</TableHead>
                    <TableHead className="text-right">Выручка</TableHead>
                    <TableHead className="text-right">Пользователи</TableHead>
                    <TableHead className="text-right">Юристы</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geographic.slice(0, 10).map((city, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell className="text-right">{formatNumber(city.consultations)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(city.revenue)}</TableCell>
                      <TableCell className="text-right">{formatNumber(city.users)}</TableCell>
                      <TableCell className="text-right">{formatNumber(city.lawyers)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Нет данных</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
