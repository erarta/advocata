'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TimeRange } from '@/lib/types/analytics';

interface DateRangePickerProps {
  value: {
    from: Date;
    to: Date;
  };
  onChange: (range: { from: Date; to: Date }, rangeType: TimeRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [activeRange, setActiveRange] = React.useState<TimeRange>('30d');

  const presets: Array<{ label: string; range: TimeRange; getValue: () => { from: Date; to: Date } }> = [
    {
      label: 'Последние 7 дней',
      range: '7d',
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      label: 'Последние 30 дней',
      range: '30d',
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      label: 'Последние 90 дней',
      range: '90d',
      getValue: () => ({
        from: subDays(new Date(), 90),
        to: new Date(),
      }),
    },
    {
      label: 'Последний год',
      range: '1y',
      getValue: () => ({
        from: subYears(new Date(), 1),
        to: new Date(),
      }),
    },
  ];

  const handlePresetChange = (rangeType: TimeRange) => {
    const preset = presets.find((p) => p.range === rangeType);
    if (preset) {
      setActiveRange(rangeType);
      onChange(preset.getValue(), rangeType);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Tabs value={activeRange} onValueChange={(v) => handlePresetChange(v as TimeRange)}>
        <TabsList>
          {presets.map((preset) => (
            <TabsTrigger key={preset.range} value={preset.range} className="text-xs">
              {preset.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd MMM yyyy', { locale: ru })} -{' '}
                  {format(value.to, 'dd MMM yyyy', { locale: ru })}
                </>
              ) : (
                format(value.from, 'dd MMM yyyy', { locale: ru })
              )
            ) : (
              <span>Выберите даты</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3 text-sm text-muted-foreground">
            Пользовательский выбор дат будет доступен в следующей версии
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
