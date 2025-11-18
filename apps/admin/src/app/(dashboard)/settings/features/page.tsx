// Feature Flags Page
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Search } from 'lucide-react';
import { useFeatureFlags } from '@/lib/hooks/use-settings';
import { FeatureFlagToggle } from '@/components/settings/feature-flag-toggle';
import { FeatureFlagCategory } from '@/lib/types/settings';

export default function FeatureFlagsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeatureFlagCategory | 'all'>('all');

  const { data: flags, isLoading, error } = useFeatureFlags();

  // Filter flags
  const filteredFlags = flags?.filter((flag) => {
    const matchesSearch =
      flag.name.toLowerCase().includes(search.toLowerCase()) ||
      flag.description.toLowerCase().includes(search.toLowerCase()) ||
      flag.key.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || flag.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Управление функциями</h1>
          <p className="text-gray-600 mt-2">Включение и отключение функций платформы</p>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Управление функциями</h1>
          <p className="text-gray-600 mt-2">Включение и отключение функций платформы</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки флагов: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление функциями</h1>
        <p className="text-gray-600 mt-2">Включение и отключение функций платформы</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или ключу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Категория</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="consultations">Консультации</SelectItem>
                  <SelectItem value="payments">Платежи</SelectItem>
                  <SelectItem value="features">Функции</SelectItem>
                  <SelectItem value="experimental">Экспериментальные</SelectItem>
                  <SelectItem value="maintenance">Обслуживание</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Функции ({filteredFlags?.length || 0})
          </h2>
          <p className="text-sm text-gray-600">
            Управляйте доступностью функций для пользователей
          </p>
        </div>

        <div className="space-y-4">
          {filteredFlags && filteredFlags.length > 0 ? (
            filteredFlags.map((flag) => (
              <FeatureFlagToggle key={flag.id} flag={flag} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">
                  Функции не найдены
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
