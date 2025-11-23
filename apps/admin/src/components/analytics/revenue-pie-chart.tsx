'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import type { RevenueBreakdown } from '@/lib/types/analytics';

interface RevenuePieChartProps {
  data: RevenueBreakdown;
  height?: number;
}

const COLORS = [
  'hsl(220, 70%, 50%)', // Blue for consultations
  'hsl(142, 70%, 45%)', // Green for subscriptions
  'hsl(0, 70%, 50%)', // Red for emergency
  'hsl(280, 60%, 50%)', // Purple for other
];

export function RevenuePieChart({ data, height = 400 }: RevenuePieChartProps) {
  const chartData = [
    {
      name: 'Консультации',
      value: data.consultations,
      percent: data.consultationsPercent,
    },
    {
      name: 'Подписки',
      value: data.subscriptions,
      percent: data.subscriptionsPercent,
    },
    {
      name: 'Экстренные вызовы',
      value: data.emergency,
      percent: data.emergencyPercent,
    },
    {
      name: 'Прочее',
      value: data.other,
      percent: data.otherPercent,
    },
  ].filter((item) => item.value > 0); // Only show non-zero values

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name} (${entry.percent.toFixed(1)}%)`}
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
