import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Circle } from 'lucide-react';
import { ActivityLog } from '@/lib/types/user';
import { cn } from '@/lib/utils/cn';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  className?: string;
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index !== activities.length - 1 && (
            <div className="absolute left-[7px] top-[24px] h-full w-[2px] bg-border" />
          )}

          {/* Timeline dot */}
          <div className="relative mt-1">
            <Circle
              className={cn(
                'h-4 w-4',
                getActivityColor(activity.type)
              )}
              fill="currentColor"
            />
          </div>

          {/* Activity content */}
          <div className="flex-1 space-y-1 pb-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.description}</p>
              <time className="text-xs text-muted-foreground">
                {format(new Date(activity.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
              </time>
            </div>
            {activity.performedBy && (
              <p className="text-xs text-muted-foreground">
                Выполнено: {activity.performedBy}
              </p>
            )}
            {activity.metadata && (
              <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                {JSON.stringify(activity.metadata, null, 2)}
              </div>
            )}
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет активности
        </div>
      )}
    </div>
  );
}

function getActivityColor(type: ActivityLog['type']): string {
  const colors: Record<ActivityLog['type'], string> = {
    account_created: 'text-blue-500',
    subscription_purchased: 'text-green-500',
    consultation_booked: 'text-purple-500',
    review_left: 'text-amber-500',
    address_added: 'text-gray-500',
    profile_updated: 'text-gray-500',
    suspended: 'text-red-500',
    banned: 'text-red-600',
    other: 'text-gray-400',
  };
  return colors[type] || 'text-gray-400';
}
