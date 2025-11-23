import { Badge } from '@/components/ui/badge';
import { PayoutStatus } from '@/lib/types/financial';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

interface PayoutStatusBadgeProps {
  status: PayoutStatus;
  className?: string;
}

export function PayoutStatusBadge({ status, className }: PayoutStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      variant: 'outline' as const,
      icon: Clock,
      className: 'border-yellow-500 text-yellow-700 bg-yellow-50',
    },
    processing: {
      label: 'Processing',
      variant: 'outline' as const,
      icon: Loader2,
      className: 'border-blue-500 text-blue-700 bg-blue-50',
    },
    completed: {
      label: 'Completed',
      variant: 'outline' as const,
      icon: CheckCircle2,
      className: 'border-green-500 text-green-700 bg-green-50',
    },
    failed: {
      label: 'Failed',
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
