import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatPercentage } from '@/lib/utils/formatters';

interface TrendIndicatorProps {
  value: number;
  showValue?: boolean;
  className?: string;
}

export function TrendIndicator({ value, showValue = true, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium',
        isPositive && 'text-green-600',
        isNeutral && 'text-muted-foreground',
        !isPositive && !isNeutral && 'text-red-600',
        className
      )}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {showValue && <span>{formatPercentage(Math.abs(value))}</span>}
    </div>
  );
}
