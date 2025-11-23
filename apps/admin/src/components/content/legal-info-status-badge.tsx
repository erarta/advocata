import { Badge } from '@/components/ui/badge';
import { LegalInfoStatus } from '@/lib/types/content';

interface LegalInfoStatusBadgeProps {
  status: LegalInfoStatus;
}

const STATUS_CONFIG: Record<
  LegalInfoStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  published: { label: 'Опубликовано', variant: 'default' },
  draft: { label: 'Черновик', variant: 'outline' },
  scheduled: { label: 'Запланировано', variant: 'secondary' },
};

export function LegalInfoStatusBadge({ status }: LegalInfoStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
