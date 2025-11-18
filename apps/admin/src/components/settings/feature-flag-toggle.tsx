// Feature Flag Toggle Component
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FeatureFlag } from '@/lib/types/settings';
import { FeatureFlagCategoryBadge } from './feature-flag-category-badge';
import { useUpdateFeatureFlag } from '@/lib/hooks/use-settings';
import { Users } from 'lucide-react';

interface FeatureFlagToggleProps {
  flag: FeatureFlag;
}

export function FeatureFlagToggle({ flag }: FeatureFlagToggleProps) {
  const [isEnabled, setIsEnabled] = useState(flag.isEnabled);
  const [rolloutPercentage, setRolloutPercentage] = useState(flag.rolloutPercentage);
  const updateFlag = useUpdateFeatureFlag();

  const handleToggle = async (enabled: boolean) => {
    setIsEnabled(enabled);
    await updateFlag.mutateAsync({
      id: flag.id,
      data: { isEnabled: enabled },
    });
  };

  const handleRolloutChange = async (value: number[]) => {
    const percentage = value[0];
    setRolloutPercentage(percentage);

    // Debounce the API call
    await updateFlag.mutateAsync({
      id: flag.id,
      data: { rolloutPercentage: percentage },
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor={`flag-${flag.id}`} className="text-base font-semibold">
                {flag.name}
              </Label>
              <FeatureFlagCategoryBadge category={flag.category} />
              {isEnabled && (
                <Badge variant="default" className="bg-green-500">
                  Активна
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{flag.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Ключ: <code className="bg-gray-100 px-1 rounded">{flag.key}</code>
            </p>
          </div>
          <Switch
            id={`flag-${flag.id}`}
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={updateFlag.isPending}
          />
        </div>

        {/* Rollout Percentage */}
        {isEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Процент охвата</Label>
              <span className="text-sm font-semibold">{rolloutPercentage}%</span>
            </div>
            <Slider
              value={[rolloutPercentage]}
              onValueChange={handleRolloutChange}
              max={100}
              step={5}
              className="w-full"
              disabled={updateFlag.isPending}
            />
            <p className="text-xs text-gray-500">
              Функция доступна для {rolloutPercentage}% пользователей
            </p>
          </div>
        )}

        {/* Environments */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Окружения:</span>
          {flag.environments.map((env) => (
            <Badge key={env} variant="outline" className="text-xs">
              {env}
            </Badge>
          ))}
        </div>

        {/* Affected Users */}
        {flag.affectedUsersCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Затронутых пользователей: {flag.affectedUsersCount.toLocaleString('ru-RU')}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
