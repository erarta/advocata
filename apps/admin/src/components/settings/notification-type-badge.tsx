// Notification Type Badge Component
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Bell } from 'lucide-react';
import { NotificationType } from '@/lib/types/settings';

interface NotificationTypeBadgeProps {
  type: NotificationType;
}

const typeConfig: Record<NotificationType, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: typeof Mail }> = {
  email: {
    label: 'Email',
    variant: 'default',
    icon: Mail,
  },
  sms: {
    label: 'SMS',
    variant: 'secondary',
    icon: MessageSquare,
  },
  push: {
    label: 'Push',
    variant: 'outline',
    icon: Bell,
  },
};

export function NotificationTypeBadge({ type }: NotificationTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
