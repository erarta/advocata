'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, Star, MessageSquare, Clock } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { ScatterChart } from '@/components/analytics/scatter-chart';
import { BarChart } from '@/components/analytics/bar-chart';
import { LeaderboardTable } from '@/components/analytics/leaderboard-table';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  useLawyerPerformanceMetrics,
  useLawyerPerformanceDistribution,
  useRatingDistribution,
  useConsultationsBySpecialization,
  useLawyerLeaderboard,
  useAvailabilityAnalysis,
} from '@/lib/hooks/use-analytics';
import { formatNumber, formatPercentage, formatDuration, formatCurrency } from '@/lib/utils/formatters';
import { subDays } from 'date-fns';

export default function LawyerPerformancePage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [sortBy, setSortBy] = React.useState('revenue');

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useLawyerPerformanceMetrics(params);
  const { data: distribution, isLoading: distributionLoading } = useLawyerPerformanceDistribution(params);
  const { data: ratingDist, isLoading: ratingLoading } = useRatingDistribution(params);
  const { data: bySpecialization, isLoading: specializationLoading } = useConsultationsBySpecialization(params);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLawyerLeaderboard(sortBy, params);
  const { data: availability, isLoading: availabilityLoading } = useAvailabilityAnalysis(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Производительность юристов</h1>
          <p className="text-muted-foreground">
            Метрики и KPI юристов на платформе
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
          title="Активные юристы"
          value={metrics ? formatNumber(metrics.totalActiveLawyers) : '-'}
          change={metrics?.totalActiveLawyersGrowth}
          subtitle={`${formatPercentage(metrics?.verifiedPercent || 0)} верифицированы`}
          icon={<Users className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Средний рейтинг"
          value={metrics ? metrics.averageRating.toFixed(2) : '-'}
          change={metrics?.averageRatingTrend}
          subtitle="по всем юристам"
          icon={<Star className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Всего консультаций"
          value={metrics ? formatNumber(metrics.totalConsultations) : '-'}
          change={metrics?.totalConsultationsGrowth}
          subtitle={`${formatNumber(metrics?.averageConsultationsPerLawyer || 0)} в среднем на юриста`}
          icon={<MessageSquare className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Скорость отклика"
          value={metrics ? formatDuration(metrics.averageResponseTime) : '-'}
          subtitle={`${formatPercentage(metrics?.responseRate || 0)} принято`}
          icon={<Clock className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Performance Distribution (Scatter Plot) */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение производительности</CardTitle>
          <CardDescription>
            Рейтинг vs количество консультаций (размер = выручка)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distributionLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : distribution && distribution.data.length > 0 ? (
            <ScatterChart
              data={distribution.data}
              xDataKey="consultations"
              yDataKey="rating"
              zDataKey="revenue"
              nameKey="name"
              xLabel="Консультации"
              yLabel="Рейтинг"
              height={400}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Distribution and Consultations by Specialization */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Распределение рейтингов</CardTitle>
            <CardDescription>Количество юристов по диапазонам рейтинга</CardDescription>
          </CardHeader>
          <CardContent>
            {ratingLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : ratingDist && ratingDist.length > 0 ? (
              <BarChart
                data={ratingDist}
                xDataKey="range"
                bars={[
                  {
                    dataKey: 'count',
                    name: 'Юристов',
                    color: 'hsl(var(--primary))',
                  },
                ]}
                height={300}
                valueFormatter={(value) => formatNumber(value)}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>По специализациям</CardTitle>
            <CardDescription>Консультации по областям права</CardDescription>
          </CardHeader>
          <CardContent>
            {specializationLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : bySpecialization && bySpecialization.length > 0 ? (
              <BarChart
                data={bySpecialization.map(s => ({
                  spec: s.specialization,
                  count: s.consultationCount,
                }))}
                xDataKey="spec"
                bars={[
                  {
                    dataKey: 'count',
                    name: 'Консультаций',
                    color: 'hsl(220, 70%, 50%)',
                  },
                ]}
                height={300}
                valueFormatter={(value) => formatNumber(value)}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lawyer Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Рейтинг юристов</CardTitle>
          <CardDescription>
            Топ-20 юристов по различным метрикам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable
            lawyers={leaderboard || []}
            onSort={setSortBy}
            isLoading={leaderboardLoading}
          />
        </CardContent>
      </Card>

      {/* Availability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Анализ доступности</CardTitle>
          <CardDescription>Когда юристы онлайн и готовы к консультациям</CardDescription>
        </CardHeader>
        <CardContent>
          {availabilityLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : availability ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Юристов онлайн сейчас</p>
                  <p className="text-3xl font-bold">{availability.lawyersOnlineNow}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Средняя доступность</p>
                  <p className="text-3xl font-bold">
                    {availability.averageAvailabilityHours.toFixed(1)} ч/день
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Пик доступности</p>
                  <p className="text-3xl font-bold">{availability.peakAvailabilityTime}</p>
                </div>
              </div>
              {availability.availabilityByHour.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Доступность по часам:</p>
                  <BarChart
                    data={availability.availabilityByHour.map(h => ({
                      hour: `${h.hour}:00`,
                      count: h.count,
                    }))}
                    xDataKey="hour"
                    bars={[
                      {
                        dataKey: 'count',
                        name: 'Юристов онлайн',
                        color: 'hsl(142, 70%, 45%)',
                      },
                    ]}
                    height={250}
                    valueFormatter={(value) => formatNumber(value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Нет данных</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
