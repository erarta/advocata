import { Badge } from '@/components/ui/badge';
import { DisputeStatus } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

const statusConfig = {
  [DisputeStatus.PENDING]: {
    label: 'Новый',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [DisputeStatus.UNDER_REVIEW]: {
    label: 'На рассмотрении',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [DisputeStatus.AWAITING_RESPONSE]: {
    label: 'Ожидает ответа',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  [DisputeStatus.RESOLVED]: {
    label: 'Решен',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [DisputeStatus.CLOSED]: {
    label: 'Закрыт',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function DisputeStatusBadge({ status, className }: DisputeStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
