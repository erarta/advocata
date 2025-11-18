'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportConfigForm } from '@/components/analytics/report-config-form';
import { SavedReportsList } from '@/components/analytics/saved-reports-list';
import {
  useGenerateReport,
  useExportReport,
  useSavedReports,
  useDeleteSavedReport,
} from '@/lib/hooks/use-analytics';
import { useToast } from '@/components/ui/use-toast';
import type { ReportConfig } from '@/lib/types/analytics';

export default function CustomReportsPage() {
  const { toast } = useToast();
  const { mutate: generateReport, isPending: isGenerating } = useGenerateReport();
  const { mutate: exportReport } = useExportReport();
  const { data: savedReports, isLoading: reportsLoading } = useSavedReports();
  const { mutate: deleteReport } = useDeleteSavedReport();

  const handleGenerate = (config: ReportConfig) => {
    generateReport(config, {
      onSuccess: (data) => {
        toast({
          title: 'Отчет сгенерирован',
          description: 'Отчет успешно создан и готов к экспорту',
        });
        // Auto-export the report
        if (config.options?.format) {
          exportReport({
            reportId: data.id,
            format: config.options.format,
          });
        }
      },
      onError: () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось сгенерировать отчет',
          variant: 'destructive',
        });
      },
    });
  };

  const handleDownload = (reportId: string) => {
    exportReport(
      { reportId, format: 'excel' },
      {
        onError: () => {
          toast({
            title: 'Ошибка',
            description: 'Не удалось скачать отчет',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRegenerate = (reportId: string) => {
    toast({
      title: 'Функция в разработке',
      description: 'Перегенерация отчетов будет доступна в следующей версии',
    });
  };

  const handleDelete = (reportId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот отчет?')) {
      deleteReport(reportId, {
        onSuccess: () => {
          toast({
            title: 'Отчет удален',
            description: 'Отчет успешно удален',
          });
        },
        onError: () => {
          toast({
            title: 'Ошибка',
            description: 'Не удалось удалить отчет',
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Генератор отчетов</h1>
        <p className="text-muted-foreground">
          Создавайте пользовательские отчеты и экспортируйте данные
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Создать отчет</TabsTrigger>
          <TabsTrigger value="saved">Сохраненные отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <ReportConfigForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Предварительный просмотр</CardTitle>
                  <CardDescription>
                    Здесь будет отображаться предпросмотр отчета
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="text-lg mb-2">Настройте параметры отчета</p>
                    <p className="text-sm">
                      После генерации отчет будет автоматически скачан
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Доступные шаблоны</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Отчет по выручке</h4>
                      <p className="text-sm text-muted-foreground">
                        Полный анализ доходов, разбивка по источникам
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Привлечение пользователей</h4>
                      <p className="text-sm text-muted-foreground">
                        Источники, рост, когортный анализ
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Производительность юристов</h4>
                      <p className="text-sm text-muted-foreground">
                        Рейтинги, консультации, выручка
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Финансовая сводка</h4>
                      <p className="text-sm text-muted-foreground">
                        Доходы, расходы, прибыль, прогнозы
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Анализ консультаций</h4>
                      <p className="text-sm text-muted-foreground">
                        Типы, статусы, география
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-1">Пользовательский</h4>
                      <p className="text-sm text-muted-foreground">
                        Настройте свои собственные метрики
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сохраненные отчеты</CardTitle>
              <CardDescription>
                Управляйте ранее созданными отчетами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SavedReportsList
                reports={savedReports || []}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                isLoading={reportsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
