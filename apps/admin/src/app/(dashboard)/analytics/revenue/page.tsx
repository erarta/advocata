'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { MetricCardWithChart } from '@/components/analytics/metric-card-with-chart';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { RevenuePieChart } from '@/components/analytics/revenue-pie-chart';
import { BarChart } from '@/components/analytics/bar-chart';
import { TopLawyersTable } from '@/components/analytics/top-lawyers-table';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  useRevenueMetrics,
  useRevenueOverTime,
  useRevenueBreakdown,
  useRevenueByConsultationType,
  useTopPerformingLawyers,
  useCommissionAnalysis,
} from '@/lib/hooks/use-analytics';
import { formatCurrency } from '@/lib/utils/formatters';
import { subDays } from 'date-fns';
import type { TimeRange } from '@/lib/types/analytics';

export default function RevenueDashboardPage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useRevenueMetrics(params);
  const { data: overTime, isLoading: overTimeLoading } = useRevenueOverTime(params);
  const { data: breakdown, isLoading: breakdownLoading } = useRevenueBreakdown(params);
  const { data: byType, isLoading: byTypeLoading } = useRevenueByConsultationType(params);
  const { data: topLawyers, isLoading: topLawyersLoading } = useTopPerformingLawyers(10);
  const { data: commission, isLoading: commissionLoading } = useCommissionAnalysis(params);

  const handleExport = () => {
    // Export functionality will be implemented with report generation
    console.log('Export revenue data');
  };

  // Prepare sparkline data for metric cards
  const sparklineData = overTime?.data.slice(-7).map((d) => ({ value: d.totalRevenue })) || [];

  // Prepare consultation type chart data
  const consultationTypeChartData = byType
    ? [
        { type: 'Чат', value: byType.chat, name: 'Чат' },
        { type: 'Видео', value: byType.video, name: 'Видео' },
        { type: 'Звонок', value: byType.voice, name: 'Звонок' },
        { type: 'Личная встреча', value: byType.inPerson, name: 'Личная встреча' },
        { type: 'Экстренные', value: byType.emergency, name: 'Экстренные' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика выручки</h1>
          <p className="text-muted-foreground">
            Полный обзор доходов платформы и производительности
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={(range, rangeType) => setDateRange(range)}
          />
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardWithChart
          title="Общая выручка"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '-'}
          change={metrics?.totalRevenueChange}
          subtitle="за выбранный период"
          icon={<DollarSign className="h-4 w-4" />}
          chartData={sparklineData}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Комиссия платформы"
          value={metrics ? formatCurrency(metrics.platformCommission) : '-'}
          change={metrics?.platformCommissionChange}
          subtitle={`${metrics?.platformCommissionPercent.toFixed(1)}% от выручки`}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Консультации"
          value={metrics ? formatCurrency(metrics.consultationRevenue) : '-'}
          change={metrics?.consultationRevenueChange}
          subtitle="доход от консультаций"
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Подписки"
          value={metrics ? formatCurrency(metrics.subscriptionRevenue) : '-'}
          change={metrics?.subscriptionRevenueChange}
          subtitle={`${metrics?.activeSubscribers || 0} активных подписчиков | MRR: ${formatCurrency(metrics?.mrr || 0)}`}
          icon={<Users className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Revenue Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Выручка по времени</CardTitle>
          <CardDescription>Динамика доходов за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          {overTimeLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : overTime && overTime.data.length > 0 ? (
            <RevenueChart data={overTime.data} />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных за выбранный период
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Breakdown - Pie Chart and Bar Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Структура выручки</CardTitle>
            <CardDescription>Распределение по источникам дохода</CardDescription>
          </CardHeader>
          <CardContent>
            {breakdownLoading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : breakdown ? (
              <RevenuePieChart data={breakdown} />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Выручка по типам консультаций</CardTitle>
            <CardDescription>Доход от разных форматов обслуживания</CardDescription>
          </CardHeader>
          <CardContent>
            {byTypeLoading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : consultationTypeChartData.length > 0 ? (
              <BarChart
                data={consultationTypeChartData}
                xDataKey="type"
                bars={[
                  {
                    dataKey: 'value',
                    name: 'Выручка',
                    color: 'hsl(var(--primary))',
                  },
                ]}
                valueFormatter={(value) => formatCurrency(value)}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Lawyers */}
      <Card>
        <CardHeader>
          <CardTitle>Топ юристов по выручке</CardTitle>
          <CardDescription>10 лучших юристов по доходу за период</CardDescription>
        </CardHeader>
        <CardContent>
          <TopLawyersTable lawyers={topLawyers || []} isLoading={topLawyersLoading} />
        </CardContent>
      </Card>

      {/* Commission Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Анализ комиссий</CardTitle>
          <CardDescription>Детальная информация о платформенных комиссиях</CardDescription>
        </CardHeader>
        <CardContent>
          {commissionLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : commission ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Ставка комиссии</p>
                  <p className="text-2xl font-bold">{commission.platformRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Всего комиссий</p>
                  <p className="text-2xl font-bold">{formatCurrency(commission.totalCommission)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Средняя комиссия</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(commission.averageCommissionPerConsultation)}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Комиссии по типам консультаций:</p>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Чат</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(commission.commissionByType.chat)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Видео</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(commission.commissionByType.video)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Звонок</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(commission.commissionByType.voice)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Личная встреча</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(commission.commissionByType.inPerson)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Экстренные</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(commission.commissionByType.emergency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Нет данных</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
