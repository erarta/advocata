import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, MessageSquare, Video } from 'lucide-react';
import { LiveConsultation } from '@/lib/types/consultation';
import { ConsultationTypeIcon } from './consultation-type-icon';
import { LiveDurationCounter } from './live-duration-counter';
import { cn } from '@/lib/utils';

interface LiveConsultationCardProps {
  consultation: LiveConsultation;
  onViewDetails?: (id: string) => void;
  onViewChat?: (id: string) => void;
  onJoinSession?: (id: string) => void;
}

export function LiveConsultationCard({
  consultation,
  onViewDetails,
  onViewChat,
  onJoinSession,
}: LiveConsultationCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn('transition-shadow hover:shadow-md', consultation.hasAlert && 'border-red-300 bg-red-50/50')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Participants */}
          <div className="flex-1 space-y-3">
            {/* Status & Type */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-600">В эфире</span>
              </div>
              <ConsultationTypeIcon type={consultation.type} showLabel />
            </div>

            {/* Client */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {getInitials(consultation.clientName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {consultation.clientName}
                </p>
                <p className="text-xs text-gray-500">Клиент</p>
              </div>
            </div>

            {/* Lawyer */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                  {getInitials(consultation.lawyerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {consultation.lawyerName}
                </p>
                <p className="text-xs text-gray-500">Юрист</p>
              </div>
            </div>
          </div>

          {/* Right: Duration & Actions */}
          <div className="flex flex-col items-end gap-3">
            <LiveDurationCounter startedAt={consultation.startedAt} />

            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(consultation.id)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Детали
              </Button>

              {consultation.type === 'chat' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewChat?.(consultation.id)}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Чат
                </Button>
              )}

              {(consultation.type === 'video' || consultation.type === 'emergency') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onJoinSession?.(consultation.id)}
                >
                  <Video className="mr-1.5 h-3.5 w-3.5" />
                  Подключиться
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert */}
        {consultation.hasAlert && consultation.alertReason && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs text-red-700">
              <strong>Внимание:</strong> {consultation.alertReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
