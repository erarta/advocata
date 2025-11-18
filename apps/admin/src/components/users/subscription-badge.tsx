import { Badge } from '@/components/ui/badge';
import { SubscriptionType, SubscriptionStatus } from '@/lib/types/user';
import { cn } from '@/lib/utils/cn';

interface SubscriptionBadgeProps {
  type: SubscriptionType;
  status?: SubscriptionStatus;
  className?: string;
}

export function SubscriptionBadge({ type, status, className }: SubscriptionBadgeProps) {
  // Type variants with colors
  const typeVariants: Record<
    SubscriptionType,
    { className: string; label: string }
  > = {
    [SubscriptionType.NONE]: {
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      label: 'Нет подписки',
    },
    [SubscriptionType.FREE_TRIAL]: {
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      label: 'Пробный',
    },
    [SubscriptionType.BASIC]: {
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      label: 'Базовый',
    },
    [SubscriptionType.PREMIUM]: {
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      label: 'Премиум',
    },
    [SubscriptionType.VIP]: {
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      label: 'VIP',
    },
  };

  const config = typeVariants[type];

  // Show status indicator if provided
  const statusLabel = status && status !== SubscriptionStatus.ACTIVE
    ? ` (${getStatusLabel(status)})`
    : '';

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}{statusLabel}
    </Badge>
  );
}

function getStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.ACTIVE]: 'Активная',
    [SubscriptionStatus.TRIAL]: 'Пробная',
    [SubscriptionStatus.EXPIRED]: 'Истекла',
    [SubscriptionStatus.CANCELLED]: 'Отменена',
  };
  return labels[status];
}
