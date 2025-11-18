// Platform Settings Page
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePlatformConfig } from '@/lib/hooks/use-settings';
import { PlatformConfigForm } from '@/components/settings/platform-config-form';

export default function PlatformSettingsPage() {
  const { data: config, isLoading, error } = usePlatformConfig();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки платформы</h1>
          <p className="text-gray-600 mt-2">Основные настройки и конфигурация платформы</p>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки платформы</h1>
          <p className="text-gray-600 mt-2">Основные настройки и конфигурация платформы</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки настроек: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки платформы</h1>
        <p className="text-gray-600 mt-2">Основные настройки и конфигурация платформы</p>
      </div>

      <PlatformConfigForm config={config} />

      {/* TODO: Add logo/favicon upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Брендинг</CardTitle>
          <CardDescription>Логотип и favicon платформы</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            TODO: Добавить загрузку логотипа и favicon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
