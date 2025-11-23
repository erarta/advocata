'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { useOnboardingSlides, useDeleteOnboardingSlide, useUpdateOnboardingSlide } from '@/lib/hooks/use-content';
import { OnboardingAudience, OnboardingStatus } from '@/lib/types/content';
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

export default function OnboardingPage() {
  const [audienceFilter, setAudienceFilter] = useState<OnboardingAudience>('client');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: slides, isLoading, refetch } = useOnboardingSlides({
    targetAudience: audienceFilter,
  });

  const deleteSlide = useDeleteOnboardingSlide();
  const updateSlide = useUpdateOnboardingSlide();

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSlide.mutateAsync(deleteId);
    setDeleteId(null);
    refetch();
  };

  const handleStatusToggle = async (id: string, currentStatus: OnboardingStatus) => {
    await updateSlide.mutateAsync({
      id,
      data: { status: currentStatus === 'active' ? 'inactive' : 'active' },
    });
    refetch();
  };

  const clientSlides = slides?.filter(s => s.targetAudience === 'client') || [];
  const lawyerSlides = slides?.filter(s => s.targetAudience === 'lawyer') || [];
  const currentSlides = audienceFilter === 'client' ? clientSlides : lawyerSlides;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Онбординг</h1>
          <p className="text-gray-500">Управление экранами приветствия для мобильного приложения</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать слайд
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Слайдов для клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientSlides.length}</div>
            <p className="text-xs text-gray-500">
              {clientSlides.filter(s => s.status === 'active').length} активных
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Слайдов для юристов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawyerSlides.length}</div>
            <p className="text-xs text-gray-500">
              {lawyerSlides.filter(s => s.status === 'active').length} активных
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего слайдов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slides?.length || 0}</div>
            <p className="text-xs text-gray-500">
              {slides?.filter(s => s.status === 'active').length || 0} активных
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Целевая аудитория:</span>
            <Select value={audienceFilter} onValueChange={(value) => setAudienceFilter(value as OnboardingAudience)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите аудиторию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Клиенты</SelectItem>
                <SelectItem value="lawyer">Юристы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Slides Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Слайды для {audienceFilter === 'client' ? 'клиентов' : 'юристов'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">№</TableHead>
                <TableHead>Превью</TableHead>
                <TableHead>Заголовок</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Текст кнопки</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                    <TableCell><Skeleton className="h-16 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  </TableRow>
                ))
              ) : currentSlides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Слайды не найдены
                  </TableCell>
                </TableRow>
              ) : (
                currentSlides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell className="text-sm text-gray-500">{slide.order}</TableCell>
                    <TableCell>
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{slide.title}</TableCell>
                    <TableCell className="max-w-md truncate text-sm text-gray-600">
                      {slide.description}
                    </TableCell>
                    <TableCell className="text-sm">{slide.buttonText}</TableCell>
                    <TableCell>
                      <Badge
                        variant={slide.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleStatusToggle(slide.id, slide.status)}
                      >
                        {slide.status === 'active' ? 'Активен' : 'Неактивен'}
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
                          onClick={() => setDeleteId(slide.id)}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить слайд?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Слайд будет удалён навсегда.
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
