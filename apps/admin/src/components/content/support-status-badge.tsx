import { Badge } from '@/components/ui/badge';
import { SupportStatus } from '@/lib/types/content';

interface SupportStatusBadgeProps {
  status: SupportStatus;
}

const STATUS_CONFIG: Record<
  SupportStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  open: { label: 'Открыт', variant: 'destructive' },
  in_progress: { label: 'В работе', variant: 'default' },
  waiting_for_user: { label: 'Ожидание пользователя', variant: 'secondary' },
  resolved: { label: 'Решён', variant: 'default' },
  closed: { label: 'Закрыт', variant: 'outline' },
};

export function SupportStatusBadge({ status }: SupportStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
