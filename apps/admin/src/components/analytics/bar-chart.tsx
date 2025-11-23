'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  xDataKey: string;
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  height?: number;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  xDataKey,
  bars,
  height = 400,
  valueFormatter = (value) => value.toString(),
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xDataKey}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={valueFormatter}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
