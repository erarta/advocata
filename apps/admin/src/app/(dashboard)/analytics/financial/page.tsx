'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { LineChart } from '@/components/analytics/line-chart';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import {
  useFinancialMetrics,
  useRevenueVsCosts,
  usePaymentMethodsDistribution,
  useRefundAnalysis,
  useUpcomingPayouts,
  useFinancialForecast,
} from '@/lib/hooks/use-analytics';
import { formatCurrency, formatPercentage, formatDateTime } from '@/lib/utils/formatters';
import { subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const COLORS = ['hsl(220, 70%, 50%)', 'hsl(142, 70%, 45%)', 'hsl(280, 60%, 50%)'];

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useFinancialMetrics(params);
  const { data: revenueVsCosts, isLoading: rvcLoading } = useRevenueVsCosts(params);
  const { data: paymentMethods, isLoading: pmLoading } = usePaymentMethodsDistribution(params);
  const { data: refundAnalysis, isLoading: refundLoading } = useRefundAnalysis(params);
  const { data: upcomingPayouts, isLoading: payoutsLoading } = useUpcomingPayouts(10);
  const { data: forecast, isLoading: forecastLoading } = useFinancialForecast(3);

  // Prepare revenue vs costs chart data
  const rvcChartData = revenueVsCosts?.data.map(d => ({
    month: d.month,
    Выручка: d.revenue,
    Расходы: d.costs,
    Прибыль: d.profit,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Финансовые отчеты</h1>
          <p className="text-muted-foreground">
            Детальная финансовая аналитика платформы
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Общая выручка"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '-'}
          subtitle="год до настоящего времени"
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Чистая выручка"
          value={metrics ? formatCurrency(metrics.netRevenue) : '-'}
          subtitle="после комиссий"
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Невыплаченные платежи"
          value={metrics ? formatCurrency(metrics.outstandingPayments) : '-'}
          subtitle="ожидают обработки"
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Возвраты"
          value={metrics ? formatCurrency(metrics.refundsIssued) : '-'}
          change={metrics?.refundsIssuedChange}
          icon={<TrendingDown className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Средний чек"
          value={metrics ? formatCurrency(metrics.averageTransactionValue) : '-'}
          subtitle="на транзакцию"
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Revenue vs Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Выручка vs Расходы</CardTitle>
          <CardDescription>Сравнение доходов и расходов по месяцам</CardDescription>
        </CardHeader>
        <CardContent>
          {rvcLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : rvcChartData.length > 0 ? (
            <LineChart
              data={rvcChartData}
              xDataKey="month"
              lines={[
                { dataKey: 'Выручка', name: 'Выручка', color: 'hsl(142, 70%, 45%)', strokeWidth: 2 },
                { dataKey: 'Расходы', name: 'Расходы', color: 'hsl(0, 70%, 50%)', strokeWidth: 2 },
                { dataKey: 'Прибыль', name: 'Прибыль', color: 'hsl(220, 70%, 50%)', strokeWidth: 3 },
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

      {/* Payment Methods and Refund Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
            <CardDescription>Распределение по методам оплаты</CardDescription>
          </CardHeader>
          <CardContent>
            {pmLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.method} (${entry.percent.toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
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
            <CardTitle>Анализ возвратов</CardTitle>
            <CardDescription>Информация о возвратах средств</CardDescription>
          </CardHeader>
          <CardContent>
            {refundLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : refundAnalysis ? (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего возвратов</p>
                    <p className="text-2xl font-bold">{refundAnalysis.totalRefunds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Сумма возвратов</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(refundAnalysis.totalRefundAmount)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Процент возвратов</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(refundAnalysis.refundRate)}
                    </p>
                  </div>
                </div>
                {refundAnalysis.refundsByReason.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Причины возвратов:</p>
                    <div className="space-y-1">
                      {refundAnalysis.refundsByReason.slice(0, 3).map((reason, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{reason.reason}</span>
                          <span className="text-muted-foreground">
                            {reason.count} ({formatPercentage(reason.percent)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие выплаты</CardTitle>
          <CardDescription>Выплаты юристам в ближайшее время</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : upcomingPayouts && upcomingPayouts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Юрист</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Дата выплаты</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Консультации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.lawyerName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payout.amount)}
                      </TableCell>
                      <TableCell>{formatDateTime(new Date(payout.scheduledDate))}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payout.status === 'completed'
                              ? 'default'
                              : payout.status === 'processing'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {payout.status === 'completed'
                            ? 'Выплачено'
                            : payout.status === 'processing'
                            ? 'Обработка'
                            : 'Ожидание'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{payout.consultationCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет предстоящих выплат
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Финансовый прогноз</CardTitle>
          <CardDescription>Прогнозируемая выручка на следующие месяцы</CardDescription>
        </CardHeader>
        <CardContent>
          {forecastLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Загрузка...
            </div>
          ) : forecast && forecast.projectedRevenue.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {forecast.projectedRevenue.map((item, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground mb-1">{item.month}</p>
                    <p className="text-2xl font-bold">{formatCurrency(item.projected)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Уверенность: {item.confidence}%
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                * Прогноз основан на исторических данных и текущих трендах
              </p>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Нет данных для прогноза
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
