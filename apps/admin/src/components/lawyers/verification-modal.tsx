'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Download, Eye, Check, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVerifyLawyer } from '@/lib/hooks/use-lawyers';
import { PendingLawyer } from '@/lib/types/lawyer';
import { formatDate } from '@/lib/utils/formatters';

const verificationSchema = z.object({
  decision: z.enum(['approve', 'reject'], {
    required_error: 'Выберите решение',
  }),
  hourlyRate: z.number().min(500).max(50000).optional(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.decision === 'approve' && !data.hourlyRate) {
    return false;
  }
  if (data.decision === 'reject' && (!data.rejectionReason || data.rejectionReason.length < 10)) {
    return false;
  }
  return true;
}, {
  message: 'Заполните все обязательные поля',
  path: ['rejectionReason'],
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface VerificationModalProps {
  lawyer: PendingLawyer;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (decision: VerificationFormValues) => void;
}

export function VerificationModal({
  lawyer,
  isOpen,
  onClose,
  onVerify,
}: VerificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verifyMutation = useVerifyLawyer();

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      decision: undefined,
      hourlyRate: 5000,
      notes: '',
      rejectionReason: '',
    },
  });

  const decision = form.watch('decision');

  const onSubmit = async (data: VerificationFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Backend Integration
      // await verifyMutation.mutateAsync({
      //   id: lawyer.id,
      //   data,
      // });

      console.log('Verification decision:', data);

      if (onVerify) {
        onVerify(data);
      }

      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to verify lawyer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Проверка юриста</DialogTitle>
          <DialogDescription>
            Проверьте информацию и примите решение о верификации
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lawyer Information */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Информация о юристе</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">ФИО</p>
                <p className="font-medium">{lawyer.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{lawyer.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Телефон</p>
                <p className="font-medium">{lawyer.phoneNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Номер лицензии</p>
                <p className="font-medium">{lawyer.licenseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Опыт работы</p>
                <p className="font-medium">{lawyer.experienceYears} лет</p>
              </div>
              <div>
                <p className="text-muted-foreground">Дата подачи</p>
                <p className="font-medium">{formatDate(lawyer.submittedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Специализации</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {lawyer.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {lawyer.education && lawyer.education.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm">Образование</p>
                {lawyer.education.map((edu, idx) => (
                  <div key={idx} className="mt-1">
                    <p className="text-sm font-medium">
                      {edu.institution} ({edu.yearGraduated})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {edu.degree}, {edu.field}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          {lawyer.documents && lawyer.documents.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Документы</h3>
              <div className="space-y-2">
                {lawyer.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {doc.type === 'license' && 'Адвокатская лицензия'}
                          {doc.type === 'diploma' && 'Диплом об образовании'}
                          {doc.type === 'passport' && 'Паспорт'}
                          {doc.type === 'other' && 'Другой документ'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Загружен {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Decision Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Решение *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={field.value === 'approve' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => field.onChange('approve')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Одобрить
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'reject' ? 'destructive' : 'outline'}
                          className="flex-1"
                          onClick={() => field.onChange('reject')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Отклонить
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {decision === 'approve' && (
                <>
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Рекомендуемая ставка (₽/час) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заметки (необязательно)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Дополнительные комментарии..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {decision === 'reject' && (
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Причина отклонения *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Укажите причину отклонения заявки (минимум 10 символов)..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting || !decision}>
                  {isSubmitting
                    ? 'Обработка...'
                    : decision === 'approve'
                    ? 'Одобрить юриста'
                    : 'Отклонить заявку'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
