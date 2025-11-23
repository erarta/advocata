'use client';

import { Card } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { EmergencyCall } from '@/lib/types/consultation';
import { cn } from '@/lib/utils';

interface EmergencyCallMapProps {
  calls: EmergencyCall[];
  onMarkerClick?: (callId: string) => void;
  className?: string;
}

/**
 * Emergency Call Map Component
 *
 * This is a placeholder component for the emergency calls map.
 * In production, this should be replaced with actual map integration
 * using Yandex Maps API or similar service.
 *
 * TODO: Integrate with Yandex Maps API
 * - Add map initialization
 * - Add markers for each call
 * - Add marker clustering
 * - Add click handlers
 * - Add geolocation support
 */
export function EmergencyCallMap({ calls, onMarkerClick, className }: EmergencyCallMapProps) {
  const getMarkerColor = (status: EmergencyCall['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-red-500';
      case 'assigned':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-400';
    }
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Map placeholder */}
      <div className="relative h-full min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #9ca3af 1px, transparent 1px),
              linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Mock markers */}
        <div className="absolute inset-0 p-8">
          {calls.slice(0, 10).map((call, index) => {
            // Distribute markers across the map area (mock positioning)
            const left = 10 + (index % 5) * 18;
            const top = 10 + Math.floor(index / 5) * 30;

            return (
              <button
                key={call.id}
                onClick={() => onMarkerClick?.(call.id)}
                className="absolute group"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {/* Marker pin */}
                <div className="relative">
                  <MapPin
                    className={cn(
                      'h-8 w-8 drop-shadow-lg transition-transform hover:scale-110',
                      getMarkerColor(call.status),
                      call.isUrgent && 'animate-pulse'
                    )}
                    fill="currentColor"
                  />

                  {/* Tooltip on hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-10">
                    <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] text-left">
                      <p className="font-medium text-sm text-gray-900">{call.userName}</p>
                      <p className="text-xs text-gray-600 mt-1">{call.location.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {call.status === 'pending' ? 'Ожидает назначения' : call.lawyerName}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 bg-red-500" fill="currentColor" />
            <span className="text-gray-700">Ожидает ({calls.filter(c => c.status === 'pending').length})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 bg-yellow-500" fill="currentColor" />
            <span className="text-gray-700">Назначен ({calls.filter(c => c.status === 'assigned').length})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 bg-blue-500" fill="currentColor" />
            <span className="text-gray-700">Активен ({calls.filter(c => c.status === 'active').length})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 bg-green-500" fill="currentColor" />
            <span className="text-gray-700">Завершен ({calls.filter(c => c.status === 'completed').length})</span>
          </div>
        </div>

        {/* Integration notice */}
        <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-900">
              <p className="font-medium">Интеграция с картой</p>
              <p className="text-blue-700 mt-1">
                Для продакшена необходимо подключить Yandex Maps API
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
