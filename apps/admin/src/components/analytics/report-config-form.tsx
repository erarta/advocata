'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ReportConfig, ReportFormat, ReportGrouping, ReportSortBy } from '@/lib/types/analytics';
import { DateRangePicker } from './date-range-picker';
import { subDays } from 'date-fns';

interface ReportConfigFormProps {
  onGenerate: (config: ReportConfig) => void;
  isGenerating?: boolean;
}

export function ReportConfigForm({ onGenerate, isGenerating = false }: ReportConfigFormProps) {
  const [template, setTemplate] = React.useState<ReportConfig['template']>('revenue');
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [format, setFormat] = React.useState<ReportFormat>('excel');
  const [includeCharts, setIncludeCharts] = React.useState(true);
  const [grouping, setGrouping] = React.useState<ReportGrouping>('daily');
  const [sortBy, setSortBy] = React.useState<ReportSortBy>('date');

  const handleGenerate = () => {
    const config: ReportConfig = {
      template,
      dateRange: {
        start: dateRange.from.toISOString(),
        end: dateRange.to.toISOString(),
      },
      options: {
        format,
        includeCharts,
        grouping,
        sortBy,
      },
    };
    onGenerate(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройка отчета</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Шаблон отчета</Label>
          <Select value={template} onValueChange={(v) => setTemplate(v as ReportConfig['template'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Отчет по выручке</SelectItem>
              <SelectItem value="user-acquisition">Привлечение пользователей</SelectItem>
              <SelectItem value="lawyer-performance">Производительность юристов</SelectItem>
              <SelectItem value="financial">Финансовая сводка</SelectItem>
              <SelectItem value="consultation">Анализ консультаций</SelectItem>
              <SelectItem value="custom">Пользовательский отчет</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Период</Label>
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>Формат</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV (.csv)</SelectItem>
              <SelectItem value="pdf">PDF (только просмотр)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grouping */}
        <div className="space-y-2">
          <Label>Группировка</Label>
          <Select value={grouping} onValueChange={(v) => setGrouping(v as ReportGrouping)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">По дням</SelectItem>
              <SelectItem value="weekly">По неделям</SelectItem>
              <SelectItem value="monthly">По месяцам</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Сортировка</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as ReportSortBy)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="revenue">По выручке</SelectItem>
              <SelectItem value="consultations">По консультациям</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Charts */}
        <div className="flex items-center justify-between">
          <Label htmlFor="include-charts">Включить графики</Label>
          <Switch
            id="include-charts"
            checked={includeCharts}
            onCheckedChange={setIncludeCharts}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Генерация...' : 'Сгенерировать отчет'}
        </Button>
      </CardContent>
    </Card>
  );
}
