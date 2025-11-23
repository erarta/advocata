import { MessageSquare, Video, Phone, MapPin } from 'lucide-react';
import { ConsultationType } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';

interface ConsultationTypeIconProps {
  type: ConsultationType | 'call' | 'in-person';
  className?: string;
  showLabel?: boolean;
}

const typeConfig = {
  [ConsultationType.CHAT]: {
    icon: MessageSquare,
    label: 'Чат',
    color: 'text-blue-600',
  },
  [ConsultationType.VIDEO]: {
    icon: Video,
    label: 'Видео',
    color: 'text-purple-600',
  },
  [ConsultationType.EMERGENCY]: {
    icon: Phone,
    label: 'Экстренный',
    color: 'text-red-600',
  },
  call: {
    icon: Phone,
    label: 'Звонок',
    color: 'text-green-600',
  },
  'in-person': {
    icon: MapPin,
    label: 'Лично',
    color: 'text-orange-600',
  },
};

export function ConsultationTypeIcon({
  type,
  className,
  showLabel = false,
}: ConsultationTypeIconProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Icon className={cn('h-4 w-4', config.color)} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return <Icon className={cn('h-4 w-4', config.color, className)} />;
}
