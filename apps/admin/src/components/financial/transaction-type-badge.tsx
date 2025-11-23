import { Badge } from '@/components/ui/badge';
import { TransactionType } from '@/lib/types/financial';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Percent } from 'lucide-react';

interface TransactionTypeBadgeProps {
  type: TransactionType;
  className?: string;
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  const config = {
    payment: {
      label: 'Payment',
      variant: 'outline' as const,
      icon: ArrowDownLeft,
      className: 'border-green-500 text-green-700 bg-green-50',
    },
    refund: {
      label: 'Refund',
      variant: 'outline' as const,
      icon: ArrowUpRight,
      className: 'border-red-500 text-red-700 bg-red-50',
    },
    payout: {
      label: 'Payout',
      variant: 'outline' as const,
      icon: CreditCard,
      className: 'border-blue-500 text-blue-700 bg-blue-50',
    },
    commission: {
      label: 'Commission',
      variant: 'outline' as const,
      icon: Percent,
      className: 'border-purple-500 text-purple-700 bg-purple-50',
    },
  };

  const { label, variant, icon: Icon, className: typeClassName } = config[type];

  return (
    <Badge variant={variant} className={`${typeClassName} ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
