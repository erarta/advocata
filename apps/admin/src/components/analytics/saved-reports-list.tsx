'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';
import type { SavedReport } from '@/lib/types/analytics';

interface SavedReportsListProps {
  reports: SavedReport[];
  onDownload: (reportId: string) => void;
  onRegenerate: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  isLoading?: boolean;
}

export function SavedReportsList({
  reports,
  onDownload,
  onRegenerate,
  onDelete,
  isLoading = false,
}: SavedReportsListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Нет сохраненных отчетов</p>
        <p className="text-sm mt-2">Создайте отчет, чтобы он появился здесь</p>
      </div>
    );
  }

  const getTemplateLabel = (template: string) => {
    const labels: Record<string, string> = {
      revenue: 'Выручка',
      'user-acquisition': 'Пользователи',
      'lawyer-performance': 'Юристы',
      financial: 'Финансы',
      consultation: 'Консультации',
      custom: 'Пользовательский',
    };
    return labels[template] || template;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Шаблон</TableHead>
            <TableHead>Создан</TableHead>
            <TableHead>Последняя генерация</TableHead>
            <TableHead>Расписание</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{getTemplateLabel(report.config.template)}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(new Date(report.createdAt))}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {report.lastGenerated
                  ? formatDateTime(new Date(report.lastGenerated))
                  : 'Никогда'}
              </TableCell>
              <TableCell>
                {report.scheduled ? (
                  <Badge variant="secondary">{report.scheduled.frequency}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(report.id)}
                    title="Скачать"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerate(report.id)}
                    title="Перегенерировать"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(report.id)}
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
