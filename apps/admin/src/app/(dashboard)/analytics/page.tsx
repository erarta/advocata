'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  DollarSign,
  Users,
  Briefcase,
  Activity,
  FileText,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { MetricCardWithChart } from '@/components/analytics/metric-card-with-chart';
import { useRevenueMetrics, useUserGrowthMetrics, useLawyerPerformanceMetrics, usePlatformMetrics } from '@/lib/hooks/use-analytics';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { subDays } from 'date-fns';

const analyticsModules = [
  {
    title: 'Аналитика выручки',
    description: 'Полный обзор доходов платформы, комиссий и производительности',
    icon: DollarSign,
    href: '/dashboard/analytics/revenue',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Рост пользователей',
    description: 'Метрики привлечения, удержания и сегментация аудитории',
    icon: Users,
    href: '/dashboard/analytics/users',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Производительность юристов',
    description: 'KPI юристов, рейтинги, доступность и лидеры',
    icon: Briefcase,
    href: '/dashboard/analytics/lawyers',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Производительность платформы',
    description: 'Общие метрики работы, объемы консультаций, география',
    icon: Activity,
    href: '/dashboard/analytics/platform',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Генератор отчетов',
    description: 'Создание пользовательских отчетов и экспорт данных',
    icon: FileText,
    href: '/dashboard/analytics/reports',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Финансовые отчеты',
    description: 'Детальная финансовая аналитика, прогнозы и выплаты',
    icon: TrendingUp,
    href: '/dashboard/analytics/financial',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
];

export default function AnalyticsOverviewPage() {
  const dateRange = {
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: new Date().toISOString(),
  };

  // Fetch overview metrics
  const { data: revenueMetrics } = useRevenueMetrics(dateRange);
  const { data: userMetrics } = useUserGrowthMetrics(dateRange);
  const { data: lawyerMetrics } = useLawyerPerformanceMetrics(dateRange);
  const { data: platformMetrics } = usePlatformMetrics(dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Аналитика и отчетность</h1>
        <p className="text-muted-foreground">
          Комплексный анализ бизнес-показателей платформы Advocata
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardWithChart
          title="Выручка (30 дней)"
          value={revenueMetrics ? formatCurrency(revenueMetrics.totalRevenue) : '-'}
          change={revenueMetrics?.totalRevenueChange}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCardWithChart
          title="Всего пользователей"
          value={userMetrics ? formatNumber(userMetrics.totalUsers) : '-'}
          change={userMetrics?.totalUsersGrowth}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCardWithChart
          title="Активные юристы"
          value={lawyerMetrics ? formatNumber(lawyerMetrics.totalActiveLawyers) : '-'}
          change={lawyerMetrics?.totalActiveLawyersGrowth}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <MetricCardWithChart
          title="Консультации (30 дней)"
          value={platformMetrics ? formatNumber(platformMetrics.totalConsultations) : '-'}
          change={platformMetrics?.totalConsultationsGrowth}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Analytics Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Модули аналитики</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analyticsModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <Link href={module.href}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardTitle className="mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={module.href}>
                    <Button variant="outline" className="w-full">
                      Открыть
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрая статистика (последние 30 дней)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Платформенная комиссия</p>
              <p className="text-2xl font-bold">
                {revenueMetrics ? formatCurrency(revenueMetrics.platformCommission) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {revenueMetrics ? `${revenueMetrics.platformCommissionPercent.toFixed(1)}% от выручки` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Активные пользователи</p>
              <p className="text-2xl font-bold">
                {userMetrics ? formatNumber(userMetrics.activeUsers) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {userMetrics ? `${formatPercentage(userMetrics.activeUsersPercent)} от общего числа` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Средний рейтинг юристов</p>
              <p className="text-2xl font-bold">
                {lawyerMetrics ? lawyerMetrics.averageRating.toFixed(2) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {lawyerMetrics ? `${formatPercentage(lawyerMetrics.verifiedPercent)} верифицированы` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Процент завершения</p>
              <p className="text-2xl font-bold">
                {platformMetrics ? formatPercentage(platformMetrics.completionRate) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {platformMetrics ? `CSAT: ${platformMetrics.customerSatisfaction.toFixed(1)}` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Начало работы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Используйте модули аналитики для детального анализа различных аспектов платформы:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Отслеживайте выручку и комиссии в реальном времени</li>
              <li>Анализируйте рост и удержание пользователей</li>
              <li>Оценивайте производительность юристов</li>
              <li>Создавайте пользовательские отчеты</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Экспорт данных</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Все страницы аналитики поддерживают экспорт данных:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Экспорт в Excel (.xlsx) и CSV</li>
              <li>Генерация PDF отчетов (в разработке)</li>
              <li>Настраиваемые фильтры и периоды</li>
              <li>Сохранение избранных отчетов</li>
            </ul>
            <Link href="/dashboard/analytics/reports">
              <Button variant="outline" className="w-full mt-4">
                Перейти к генератору отчетов
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
