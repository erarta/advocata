'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FAQCategoryBadge } from '@/components/content/faq-category-badge';
import { useFAQs, useFAQStats, useDeleteFAQ, useUpdateFAQ } from '@/lib/hooks/use-content';
import { FAQCategory, FAQStatus } from '@/lib/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FAQCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FAQStatus | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useFAQStats();
  const { data: faqs, isLoading, refetch } = useFAQs({
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: 1,
    limit: 100,
  });

  const deleteFAQ = useDeleteFAQ();
  const updateFAQ = useUpdateFAQ();

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteFAQ.mutateAsync(deleteId);
    setDeleteId(null);
    refetch();
  };

  const handleStatusToggle = async (id: string, currentStatus: FAQStatus) => {
    await updateFAQ.mutateAsync({
      id,
      data: { status: currentStatus === 'active' ? 'inactive' : 'active' },
    });
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Часто задаваемые вопросы</h1>
          <p className="text-gray-500">Управление FAQ для пользователей и юристов</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать FAQ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalFAQs || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeFAQs || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотров</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Полезность</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.averageHelpfulness.toFixed(0)}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Поиск по вопросу или ответу..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as FAQCategory | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="general">Общие вопросы</SelectItem>
                <SelectItem value="for_lawyers">Юристам</SelectItem>
                <SelectItem value="for_clients">Клиентам</SelectItem>
                <SelectItem value="payments">Оплата</SelectItem>
                <SelectItem value="technical">Технические</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FAQStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Неактивен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">№</TableHead>
              <TableHead>Вопрос</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Просмотры</TableHead>
              <TableHead>Полезно</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                </TableRow>
              ))
            ) : faqs?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  FAQ не найдены
                </TableCell>
              </TableRow>
            ) : (
              faqs?.data.map((faq) => {
                const helpfulRate = faq.helpfulCount + faq.notHelpfulCount > 0
                  ? Math.round((faq.helpfulCount / (faq.helpfulCount + faq.notHelpfulCount)) * 100)
                  : 0;

                return (
                  <TableRow key={faq.id}>
                    <TableCell className="text-sm text-gray-500">{faq.order}</TableCell>
                    <TableCell className="font-medium max-w-md truncate">{faq.question}</TableCell>
                    <TableCell>
                      <FAQCategoryBadge category={faq.category} />
                    </TableCell>
                    <TableCell className="text-sm">{faq.viewCount}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {helpfulRate}% ({faq.helpfulCount}/{faq.helpfulCount + faq.notHelpfulCount})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={faq.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleStatusToggle(faq.id, faq.status)}
                      >
                        {faq.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Переместить вверх">
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Переместить вниз">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(faq.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. FAQ будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
