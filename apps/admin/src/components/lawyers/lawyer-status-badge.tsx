import { Badge } from '@/components/ui/badge';
import { LawyerStatus } from '@/lib/types/lawyer';

interface LawyerStatusBadgeProps {
  status: LawyerStatus;
}

export function LawyerStatusBadge({ status }: LawyerStatusBadgeProps) {
  const variants: Record<LawyerStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    [LawyerStatus.PENDING]: { variant: 'outline', label: 'Pending' },
    [LawyerStatus.ACTIVE]: { variant: 'default', label: 'Active' },
    [LawyerStatus.INACTIVE]: { variant: 'secondary', label: 'Inactive' },
    [LawyerStatus.SUSPENDED]: { variant: 'destructive', label: 'Suspended' },
    [LawyerStatus.BANNED]: { variant: 'destructive', label: 'Banned' },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
