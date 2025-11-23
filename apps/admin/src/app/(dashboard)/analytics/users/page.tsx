'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, UserPlus, Activity, TrendingDown } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { LineChart } from '@/components/analytics/line-chart';
import { RevenuePieChart } from '@/components/analytics/revenue-pie-chart';
import { CohortAnalysisTable } from '@/components/analytics/cohort-analysis-table';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  useUserGrowthMetrics,
  useUserGrowthOverTime,
  useUserAcquisitionSources,
  useUserCohortAnalysis,
  useUserSegmentation,
} from '@/lib/hooks/use-analytics';
import { formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(220, 70%, 50%)', 'hsl(142, 70%, 45%)', 'hsl(280, 60%, 50%)', 'hsl(0, 70%, 50%)', 'hsl(30, 70%, 50%)'];

export default function UserGrowthPage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useUserGrowthMetrics(params);
  const { data: growthData, isLoading: growthLoading } = useUserGrowthOverTime(params);
  const { data: acquisitionSources, isLoading: sourcesLoading } = useUserAcquisitionSources(params);
  const { data: cohortData, isLoading: cohortLoading } = useUserCohortAnalysis();
  const { data: segmentation, isLoading: segmentationLoading } = useUserSegmentation(params);

  // Prepare growth chart data
  const growthChartData = growthData
    ? growthData.totalUsers.map((item, index) => ({
        date: item.date,
        'Всего пользователей': growthData.totalUsers[index]?.value || 0,
        'Новые пользователи': growthData.newUsers[index]?.value || 0,
        'Активные пользователи': growthData.activeUsers[index]?.value || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Рост пользователей</h1>
          <p className="text-muted-foreground">
            Аналитика привлечения и удержания пользователей
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
          title="Всего пользователей"
          value={metrics ? formatNumber(metrics.totalUsers) : '-'}
          change={metrics?.totalUsersGrowth}
          subtitle="активных пользователей"
          icon={<Users className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Новые пользователи"
          value={metrics ? formatNumber(metrics.newUsers) : '-'}
          subtitle={`${formatNumber(metrics?.newUsersAvgPerDay || 0)} в день`}
          icon={<UserPlus className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Активные пользователи"
          value={metrics ? formatNumber(metrics.activeUsers) : '-'}
          subtitle={`${formatPercentage(metrics?.activeUsersPercent || 0)} от общего числа`}
          icon={<Activity className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Отток (Churn)"
          value={metrics ? formatPercentage(metrics.churnRate) : '-'}
          change={metrics?.churnRateChange ? -metrics.churnRateChange : undefined}
          subtitle={`удержание ${formatPercentage(metrics?.retentionRate || 0)}`}
          icon={<TrendingDown className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* User Growth Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика роста</CardTitle>
          <CardDescription>Количество пользователей по времени</CardDescription>
        </CardHeader>
        <CardContent>
          {growthLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : growthChartData.length > 0 ? (
            <LineChart
              data={growthChartData}
              xDataKey="date"
              lines={[
                { dataKey: 'Всего пользователей', name: 'Всего пользователей', color: 'hsl(var(--primary))' },
                { dataKey: 'Новые пользователи', name: 'Новые пользователи', color: 'hsl(142, 70%, 45%)' },
                { dataKey: 'Активные пользователи', name: 'Активные пользователи', color: 'hsl(220, 70%, 50%)' },
              ]}
              valueFormatter={(value) => formatNumber(value)}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acquisition Sources and Segmentation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Источники привлечения</CardTitle>
            <CardDescription>Откуда приходят пользователи</CardDescription>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : acquisitionSources && acquisitionSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={acquisitionSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.source} (${entry.percent.toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {acquisitionSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сегментация по подпискам</CardTitle>
            <CardDescription>Распределение пользователей по тарифам</CardDescription>
          </CardHeader>
          <CardContent>
            {segmentationLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : segmentation && segmentation.bySubscriptionTier.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentation.bySubscriptionTier}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.tier} (${entry.percent.toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {segmentation.bySubscriptionTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Когортный анализ</CardTitle>
          <CardDescription>
            Удержание пользователей по месяцам регистрации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortAnalysisTable cohorts={cohortData || []} isLoading={cohortLoading} />
        </CardContent>
      </Card>

      {/* User Segmentation Details */}
      {segmentation && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>По количеству консультаций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {segmentation.byConsultationCount.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm font-medium">{segment.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(segment.count)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatPercentage(segment.percent)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>По общим расходам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {segmentation.byTotalSpent.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm font-medium">{segment.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(segment.count)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatPercentage(segment.percent)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
