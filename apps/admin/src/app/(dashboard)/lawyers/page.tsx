'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, UserCheck, Users, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LawyerStatusBadge } from '@/components/lawyers/lawyer-status-badge';
import { useLawyers } from '@/lib/hooks/use-lawyers';
import { LawyerStatus } from '@/lib/types/lawyer';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Avatar } from '@/components/ui/avatar';

export default function LawyersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LawyerStatus | 'all'>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    specialization: specializationFilter !== 'all' ? specializationFilter : undefined,
  };

  // TODO: Backend Integration - Replace with actual API call
  // const { data, isLoading, error } = useLawyers(queryParams);

  // Mock data for development
  const mockData = {
    items: [
      {
        id: '1',
        fullName: 'Алексей Петров',
        email: 'alexey.petrov.law@advocata.ru',
        phoneNumber: '+7 921 900-10-01',
        avatar: null,
        licenseNumber: '78/12345',
        specializations: ['Уголовное право', 'ДТП'],
        rating: 4.95,
        reviewCount: 124,
        totalConsultations: 247,
        experienceYears: 15,
        status: LawyerStatus.ACTIVE,
        verifiedAt: '2023-01-15T10:00:00Z',
        revenue: 1234500,
      },
      {
        id: '2',
        fullName: 'Мария Смирнова',
        email: 'maria.smirnova@advocata.ru',
        phoneNumber: '+7 921 900-10-02',
        avatar: null,
        licenseNumber: '78/12346',
        specializations: ['Трудовое право', 'Налоговое право'],
        rating: 5.0,
        reviewCount: 312,
        totalConsultations: 412,
        experienceYears: 12,
        status: LawyerStatus.ACTIVE,
        verifiedAt: '2023-02-20T10:00:00Z',
        revenue: 2061000,
      },
      {
        id: '3',
        fullName: 'Дмитрий Иванов',
        email: 'dmitry.ivanov@advocata.ru',
        phoneNumber: '+7 921 900-10-03',
        avatar: null,
        licenseNumber: '78/12347',
        specializations: ['Семейное право'],
        rating: 4.7,
        reviewCount: 89,
        totalConsultations: 145,
        experienceYears: 8,
        status: LawyerStatus.ACTIVE,
        verifiedAt: '2023-03-10T10:00:00Z',
        revenue: 725000,
      },
      {
        id: '4',
        fullName: 'Елена Козлова',
        email: 'elena.kozlova@advocata.ru',
        phoneNumber: '+7 921 900-10-04',
        avatar: null,
        licenseNumber: '78/12348',
        specializations: ['Жилищное право', 'Наследственное право'],
        rating: 4.85,
        reviewCount: 156,
        totalConsultations: 203,
        experienceYears: 10,
        status: LawyerStatus.SUSPENDED,
        verifiedAt: '2023-01-25T10:00:00Z',
        revenue: 1015000,
      },
    ],
    total: 30,
    page: 1,
    totalPages: 2,
  };

  const data = mockData;
  const isLoading = false;
  const error = null;

  // Calculate stats from data
  const stats = {
    totalLawyers: data?.total || 0,
    activeLawyers: data?.items.filter((l) => l.status === LawyerStatus.ACTIVE).length || 0,
    averageRating: data?.items.length
      ? (data.items.reduce((sum, l) => sum + l.rating, 0) / data.items.length).toFixed(2)
      : '0',
    totalConsultations: data?.items.reduce((sum, l) => sum + l.totalConsultations, 0) || 0,
  };

  const handleViewDetails = (lawyerId: string) => {
    router.push(`/lawyers/${lawyerId}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Ошибка загрузки данных</p>
          <p className="mt-2 text-gray-600">Пожалуйста, попробуйте позже</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Юристы</h1>
          <p className="text-muted-foreground">
            Управление юристами и их профилями
          </p>
        </div>
        <Link href="/lawyers/pending">
          <Button>
            <UserCheck className="mr-2 h-4 w-4" />
            Ожидающие проверки
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего юристов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLawyers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLawyers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">из 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего консультаций</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsultations.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени, email, телефону, лицензии..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as LawyerStatus | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value={LawyerStatus.ACTIVE}>Активный</SelectItem>
                <SelectItem value={LawyerStatus.INACTIVE}>Неактивный</SelectItem>
                <SelectItem value={LawyerStatus.SUSPENDED}>Приостановлен</SelectItem>
                <SelectItem value={LawyerStatus.BANNED}>Заблокирован</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={specializationFilter}
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Специализация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все специализации</SelectItem>
                <SelectItem value="Уголовное право">Уголовное право</SelectItem>
                <SelectItem value="ДТП">ДТП</SelectItem>
                <SelectItem value="Трудовое право">Трудовое право</SelectItem>
                <SelectItem value="Налоговое право">Налоговое право</SelectItem>
                <SelectItem value="Семейное право">Семейное право</SelectItem>
                <SelectItem value="Жилищное право">Жилищное право</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">Экспорт CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lawyers Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Загрузка юристов...</p>
              </div>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Юристы не найдены</h3>
              <p className="mt-2 text-gray-600">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Юрист</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Специализации</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Консультации</TableHead>
                  <TableHead>Опыт (лет)</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((lawyer) => (
                  <TableRow key={lawyer.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {lawyer.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{lawyer.fullName}</p>
                          <p className="text-xs text-gray-500">{lawyer.licenseNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lawyer.email}</TableCell>
                    <TableCell className="text-sm">{lawyer.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specializations.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {lawyer.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lawyer.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{lawyer.rating.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">({lawyer.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {lawyer.totalConsultations}
                    </TableCell>
                    <TableCell className="text-sm">{lawyer.experienceYears}</TableCell>
                    <TableCell>
                      <LawyerStatusBadge status={lawyer.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(lawyer.id)}
                        >
                          Просмотр
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600">
            Страница {page} из {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}
