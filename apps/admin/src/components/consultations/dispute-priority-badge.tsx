import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisputePriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
  className?: string;
  showIcon?: boolean;
}

const priorityConfig = {
  low: {
    label: 'Низкий',
    icon: Info,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  medium: {
    label: 'Средний',
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  high: {
    label: 'Высокий',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function DisputePriorityBadge({
  priority,
  className,
  showIcon = false,
}: DisputePriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, 'gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
