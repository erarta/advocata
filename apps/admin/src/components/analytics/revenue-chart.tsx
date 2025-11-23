'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { RevenueDataPoint } from '@/lib/types/analytics';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  height?: number;
}

export function RevenueChart({ data, height = 400 }: RevenueChartProps) {
  // Format data for Recharts
  const chartData = data.map((point) => ({
    date: formatDate(new Date(point.date), 'dd MMM'),
    'Общая выручка': point.totalRevenue,
    'Консультации': point.consultationRevenue,
    'Подписки': point.subscriptionRevenue,
    'Комиссия': point.commission,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `₽${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Общая выручка"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Консультации"
          stroke="hsl(220, 70%, 50%)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="Подписки"
          stroke="hsl(142, 70%, 45%)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="Комиссия"
          stroke="hsl(280, 60%, 50%)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
