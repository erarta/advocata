'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, Clock, Target, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatters';

export default function LawyerPerformancePage() {
  // TODO: Backend Integration - Replace with actual API call
  // const { data, isLoading } = useLawyerPerformance({});

  // Mock data for development
  const mockData = {
    averageMetrics: {
      averageRating: 4.3,
      averageConsultations: 45,
      averageResponseTime: 15, // minutes
      averageCompletionRate: 92, // %
    },
    topPerformers: [
      {
        id: '1',
        fullName: 'Мария Смирнова',
        rating: 5.0,
        reviewCount: 312,
        totalConsultations: 412,
        revenue: 2061000,
        avatar: null,
      },
      {
        id: '2',
        fullName: 'Алексей Петров',
        rating: 4.95,
        reviewCount: 124,
        totalConsultations: 247,
        revenue: 1234500,
        avatar: null,
      },
      {
        id: '3',
        fullName: 'Елена Козлова',
        rating: 4.85,
        reviewCount: 156,
        totalConsultations: 203,
        revenue: 1015000,
        avatar: null,
      },
      {
        id: '4',
        fullName: 'Дмитрий Иванов',
        rating: 4.7,
        reviewCount: 89,
        totalConsultations: 145,
        revenue: 725000,
        avatar: null,
      },
      {
        id: '5',
        fullName: 'Анна Васильева',
        rating: 4.65,
        reviewCount: 78,
        totalConsultations: 132,
        revenue: 660000,
        avatar: null,
      },
      {
        id: '6',
        fullName: 'Сергей Кузнецов',
        rating: 4.6,
        reviewCount: 92,
        totalConsultations: 128,
        revenue: 640000,
        avatar: null,
      },
      {
        id: '7',
        fullName: 'Ольга Новикова',
        rating: 4.55,
        reviewCount: 65,
        totalConsultations: 115,
        revenue: 575000,
        avatar: null,
      },
      {
        id: '8',
        fullName: 'Николай Попов',
        rating: 4.5,
        reviewCount: 71,
        totalConsultations: 108,
        revenue: 540000,
        avatar: null,
      },
      {
        id: '9',
        fullName: 'Татьяна Михайлова',
        rating: 4.45,
        reviewCount: 58,
        totalConsultations: 98,
        revenue: 490000,
        avatar: null,
      },
      {
        id: '10',
        fullName: 'Владимир Соколов',
        rating: 4.4,
        reviewCount: 52,
        totalConsultations: 87,
        revenue: 435000,
        avatar: null,
      },
    ],
    underperformers: [
      {
        id: '21',
        fullName: 'Иван Новиков',
        rating: 3.2,
        reviewCount: 12,
        totalConsultations: 5,
        revenue: 25000,
        avatar: null,
      },
      {
        id: '22',
        fullName: 'Петр Захаров',
        rating: 3.5,
        reviewCount: 8,
        totalConsultations: 8,
        revenue: 40000,
        avatar: null,
      },
      {
        id: '23',
        fullName: 'Максим Федоров',
        rating: 3.7,
        reviewCount: 15,
        totalConsultations: 12,
        revenue: 60000,
        avatar: null,
      },
      {
        id: '24',
        fullName: 'Андрей Морозов',
        rating: 3.8,
        reviewCount: 18,
        totalConsultations: 15,
        revenue: 75000,
        avatar: null,
      },
      {
        id: '25',
        fullName: 'Юлия Белова',
        rating: 3.9,
        reviewCount: 22,
        totalConsultations: 18,
        revenue: 90000,
        avatar: null,
      },
    ],
  };

  const data = mockData;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Загрузка данных о производительности...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Производительность юристов</h1>
          <p className="text-muted-foreground">
            Аналитика и бенчмаркинг производительности
          </p>
        </div>
      </div>

      {/* Average Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageMetrics.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">из 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средние консультации
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageMetrics.averageConsultations}
            </div>
            <p className="text-xs text-muted-foreground">на юриста</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Среднее время ответа
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageMetrics.averageResponseTime}
            </div>
            <p className="text-xs text-muted-foreground">минут</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средний процент завершения
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageMetrics.averageCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">консультаций</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <CardTitle>Топ-10 юристов</CardTitle>
            </div>
            <Badge variant="default" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Лучшие
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ранг</TableHead>
                <TableHead>Юрист</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Отзывы</TableHead>
                <TableHead>Консультации</TableHead>
                <TableHead>Заработок</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topPerformers.map((lawyer, index) => (
                <TableRow key={lawyer.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {index < 3 ? (
                        <Award
                          className={`h-5 w-5 ${
                            index === 0
                              ? 'text-yellow-500 fill-yellow-500'
                              : index === 1
                              ? 'text-gray-400 fill-gray-400'
                              : 'text-orange-600 fill-orange-600'
                          }`}
                        />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {lawyer.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{lawyer.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{lawyer.rating.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{lawyer.reviewCount}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {lawyer.totalConsultations}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatCurrency(lawyer.revenue)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/lawyers/${lawyer.id}`}>
                      <Button size="sm" variant="outline">
                        Просмотр
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Underperformers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle>Юристы с низкой производительностью</CardTitle>
            </div>
            <Badge variant="destructive" className="gap-1">
              <TrendingDown className="h-3 w-3" />
              Требуют внимания
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Юрист</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Отзывы</TableHead>
                <TableHead>Консультации</TableHead>
                <TableHead>Заработок</TableHead>
                <TableHead>Проблемы</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.underperformers.map((lawyer) => {
                const issues = [];
                if (lawyer.rating < 3.5) issues.push('Низкий рейтинг');
                if (lawyer.totalConsultations < 10) issues.push('Мало консультаций');
                if (lawyer.reviewCount < 15) issues.push('Мало отзывов');

                return (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {lawyer.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{lawyer.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span
                          className={`font-semibold ${
                            lawyer.rating < 3.5 ? 'text-red-600' : ''
                          }`}
                        >
                          {lawyer.rating.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lawyer.reviewCount}</TableCell>
                    <TableCell
                      className={`text-sm font-medium ${
                        lawyer.totalConsultations < 10 ? 'text-red-600' : ''
                      }`}
                    >
                      {lawyer.totalConsultations}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(lawyer.revenue)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {issues.map((issue) => (
                          <Badge key={issue} variant="destructive" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/lawyers/${lawyer.id}`}>
                        <Button size="sm" variant="outline">
                          Просмотр
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Trends - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Тренды производительности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <TrendingUp className="mx-auto h-12 w-12 mb-4" />
            <p>Графики и тренды будут доступны в следующей версии</p>
            <p className="text-sm mt-2">
              Здесь будут отображаться линейные и столбчатые диаграммы производительности
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
