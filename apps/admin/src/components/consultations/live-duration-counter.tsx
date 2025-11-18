'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveDurationCounterProps {
  startedAt: Date;
  className?: string;
  showIcon?: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function calculateDuration(startedAt: Date): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

export function LiveDurationCounter({
  startedAt,
  className,
  showIcon = true,
}: LiveDurationCounterProps) {
  const [duration, setDuration] = useState(() => calculateDuration(startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(calculateDuration(startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const isLong = duration > 2 * 60 * 60; // > 2 hours

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm font-mono',
        isLong ? 'text-red-600' : 'text-gray-700',
        className
      )}
    >
      {showIcon && <Clock className="h-3.5 w-3.5" />}
      <span>{formatDuration(duration)}</span>
      {isLong && (
        <span className="ml-1 text-xs font-normal text-red-500">(длительная)</span>
      )}
    </div>
  );
}
