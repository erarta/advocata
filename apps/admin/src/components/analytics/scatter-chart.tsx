'use client';

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';

interface ScatterChartProps {
  data: Array<{ [key: string]: string | number }>;
  xDataKey: string;
  yDataKey: string;
  zDataKey?: string;
  nameKey?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

export function ScatterChart({
  data,
  xDataKey,
  yDataKey,
  zDataKey,
  nameKey = 'name',
  height = 400,
  xLabel,
  yLabel,
  color = 'hsl(var(--primary))',
}: ScatterChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          dataKey={xDataKey}
          name={xLabel || xDataKey}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{
            value: xLabel,
            position: 'insideBottom',
            offset: -10,
            style: { fill: 'hsl(var(--muted-foreground))' },
          }}
        />
        <YAxis
          type="number"
          dataKey={yDataKey}
          name={yLabel || yDataKey}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft',
            style: { fill: 'hsl(var(--muted-foreground))' },
          }}
        />
        {zDataKey && <ZAxis type="number" dataKey={zDataKey} range={[50, 400]} />}
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    {nameKey && <div className="font-medium">{data[nameKey]}</div>}
                    <div className="text-sm text-muted-foreground">
                      {xLabel || xDataKey}: {data[xDataKey]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {yLabel || yDataKey}: {data[yDataKey]}
                    </div>
                    {zDataKey && (
                      <div className="text-sm text-muted-foreground">
                        {zDataKey}: {data[zDataKey]}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter name="Юристы" data={data} fill={color} />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
