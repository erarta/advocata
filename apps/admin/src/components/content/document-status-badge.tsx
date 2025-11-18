import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/lib/types/content';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  active: { label: 'Активен', variant: 'default' },
  inactive: { label: 'Неактивен', variant: 'secondary' },
  draft: { label: 'Черновик', variant: 'outline' },
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
