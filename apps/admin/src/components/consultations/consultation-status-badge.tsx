import { Badge } from '@/components/ui/badge';
import { ConsultationStatus } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';

interface ConsultationStatusBadgeProps {
  status: ConsultationStatus;
  className?: string;
}

const statusConfig = {
  [ConsultationStatus.PENDING]: {
    label: 'Ожидает',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [ConsultationStatus.ACTIVE]: {
    label: 'Активна',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [ConsultationStatus.COMPLETED]: {
    label: 'Завершена',
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [ConsultationStatus.CANCELLED]: {
    label: 'Отменена',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  [ConsultationStatus.DISPUTED]: {
    label: 'Спорная',
    variant: 'destructive' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export function ConsultationStatusBadge({ status, className }: ConsultationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
