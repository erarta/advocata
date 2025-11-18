import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { EmergencyCall } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EmergencyCallCardProps {
  call: EmergencyCall;
  onViewDetails?: (id: string) => void;
  onAssignLawyer?: (id: string) => void;
  onContactClient?: (id: string) => void;
  onViewLocation?: (id: string) => void;
}

const statusConfig = {
  pending: {
    label: 'Ожидает',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  assigned: {
    label: 'Назначен',
    icon: User,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  active: {
    label: 'Активен',
    icon: Phone,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  completed: {
    label: 'Завершен',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Отменен',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function EmergencyCallCard({
  call,
  onViewDetails,
  onAssignLawyer,
  onContactClient,
  onViewLocation,
}: EmergencyCallCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatWaitTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const config = statusConfig[call.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        call.status === 'pending' && call.isUrgent && 'border-red-300 bg-red-50/50'
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Status & Urgent */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={config.color}>
              <StatusIcon className="mr-1.5 h-3 w-3" />
              {config.label}
            </Badge>
            {call.isUrgent && (
              <Badge variant="destructive" className="animate-pulse">
                Срочно
              </Badge>
            )}
          </div>

          {/* Client Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(call.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{call.userName}</p>
              <p className="text-sm text-gray-500">Клиент</p>
            </div>
          </div>

          {/* Lawyer (if assigned) */}
          {call.lawyerId && call.lawyerName && (
            <div className="flex items-center gap-3 pl-2 border-l-2 border-purple-200">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                  {getInitials(call.lawyerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{call.lawyerName}</p>
                <p className="text-xs text-gray-500">Назначенный юрист</p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900">{call.location.address}</p>
              <p className="text-xs text-gray-500">{call.location.city}</p>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {formatDistanceToNow(new Date(call.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            {call.status === 'pending' && (
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                Ожидание: {formatWaitTime(call.waitTime)}
              </Badge>
            )}
            {call.responseTime && (
              <span className="text-xs text-gray-500">
                Ответ: {formatWaitTime(call.responseTime)}
              </span>
            )}
          </div>

          {/* Notes */}
          {call.notes && (
            <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
              <p className="line-clamp-2">{call.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onViewDetails?.(call.id)}>
              Детали
            </Button>
            {call.status === 'pending' && (
              <Button variant="default" size="sm" onClick={() => onAssignLawyer?.(call.id)}>
                Назначить юриста
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onViewLocation?.(call.id)}>
              <MapPin className="mr-1.5 h-3.5 w-3.5" />
              Карта
            </Button>
            <Button variant="outline" size="sm" onClick={() => onContactClient?.(call.id)}>
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Связаться
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
