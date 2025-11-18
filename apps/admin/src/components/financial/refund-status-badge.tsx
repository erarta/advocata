import { Badge } from '@/components/ui/badge';
import { RefundStatus } from '@/lib/types/financial';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface RefundStatusBadgeProps {
  status: RefundStatus;
  className?: string;
}

export function RefundStatusBadge({ status, className }: RefundStatusBadgeProps) {
  const config = {
    'pending-review': {
      label: 'Pending Review',
      variant: 'outline' as const,
      icon: AlertCircle,
      className: 'border-yellow-500 text-yellow-700 bg-yellow-50',
    },
    approved: {
      label: 'Approved',
      variant: 'outline' as const,
      icon: CheckCircle2,
      className: 'border-green-500 text-green-700 bg-green-50',
    },
    rejected: {
      label: 'Rejected',
      variant: 'outline' as const,
      icon: XCircle,
      className: 'border-red-500 text-red-700 bg-red-50',
    },
  };

  const { label, variant, icon: Icon, className: statusClassName } = config[status];

  return (
    <Badge variant={variant} className={`${statusClassName} ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
