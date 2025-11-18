'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';
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
import { LegalInfoStatusBadge } from '@/components/content/legal-info-status-badge';
import { useLegalInfoPages, useDeleteLegalInfoPage, usePublishLegalInfoPage } from '@/lib/hooks/use-content';
import { LegalInfoStatus, LegalInfoPageType } from '@/lib/types/content';
import { Skeleton } from '@/components/ui/skeleton';
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
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function LegalInfoPagesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LegalInfoStatus | 'all'>('all');
  const [pageTypeFilter, setPageTypeFilter] = useState<LegalInfoPageType | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: pages, isLoading, refetch } = useLegalInfoPages({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    pageType: pageTypeFilter !== 'all' ? pageTypeFilter : undefined,
    page: 1,
    limit: 50,
  });

  const deletePageMutation = useDeleteLegalInfoPage();
  const publishPageMutation = usePublishLegalInfoPage();

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePageMutation.mutateAsync(deleteId);
    setDeleteId(null);
    refetch();
  };

  const handlePublish = async (id: string) => {
    await publishPageMutation.mutateAsync(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Правовая информация</h1>
          <p className="text-gray-500">Управление страницами правовой информации</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать страницу
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Поиск по названию или содержимому..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={pageTypeFilter} onValueChange={(value) => setPageTypeFilter(value as LegalInfoPageType | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип страницы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="about">О нас</SelectItem>
                <SelectItem value="privacy_policy">Политика конфиденциальности</SelectItem>
                <SelectItem value="terms_of_service">Условия использования</SelectItem>
                <SelectItem value="user_agreement">Пользовательское соглашение</SelectItem>
                <SelectItem value="lawyer_agreement">Соглашение с юристами</SelectItem>
                <SelectItem value="refund_policy">Политика возврата</SelectItem>
                <SelectItem value="cookies_policy">Политика cookies</SelectItem>
                <SelectItem value="custom">Пользовательская</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LegalInfoStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="scheduled">Запланировано</SelectItem>
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
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Обновлено</TableHead>
              <TableHead>Версия</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                </TableRow>
              ))
            ) : pages?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Страницы не найдены
                </TableCell>
              </TableRow>
            ) : (
              pages?.data.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-sm text-gray-500">/{page.slug}</TableCell>
                  <TableCell>
                    <LegalInfoStatusBadge status={page.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(page.updatedAt), 'dd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell>v{page.version}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {page.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePublish(page.id)}
                        >
                          <Calendar className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(page.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Страница будет удалена навсегда.
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
