import { Badge } from '@/components/ui/badge';
import { SupportPriority } from '@/lib/types/content';

interface SupportPriorityBadgeProps {
  priority: SupportPriority;
}

const PRIORITY_CONFIG: Record<
  SupportPriority,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  low: { label: 'Низкий', variant: 'secondary' },
  medium: { label: 'Средний', variant: 'default' },
  high: { label: 'Высокий', variant: 'destructive' },
  urgent: { label: 'Срочный', variant: 'destructive' },
};

export function SupportPriorityBadge({ priority }: SupportPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
