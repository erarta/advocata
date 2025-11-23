'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LawyerProfile } from '@/lib/types/lawyer';
import { suspendLawyer } from '@/lib/api/lawyers';

const suspendSchema = z.object({
  reason: z.string().min(10, 'Причина должна содержать минимум 10 символов'),
  duration: z.number().nullable().optional(),
  notifyLawyer: z.boolean().default(true),
});

type SuspendFormValues = z.infer<typeof suspendSchema>;

interface SuspendLawyerModalProps {
  lawyer: Pick<LawyerProfile, 'id' | 'fullName' | 'email'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspend?: (reason: string, duration?: number) => void;
}

export function SuspendLawyerModal({
  lawyer,
  open,
  onOpenChange,
  onSuspend,
}: SuspendLawyerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuspendFormValues>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      reason: '',
      duration: 7,
      notifyLawyer: true,
    },
  });

  const onSubmit = async (data: SuspendFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Backend Integration
      // await suspendLawyer(lawyer.id, data.reason, data.duration || undefined);

      console.log('Suspending lawyer:', {
        lawyerId: lawyer.id,
        ...data,
      });

      if (onSuspend) {
        onSuspend(data.reason, data.duration || undefined);
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to suspend lawyer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Приостановить юриста</DialogTitle>
          <DialogDescription>
            Временно заблокировать доступ для юриста
          </DialogDescription>
        </DialogHeader>

        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Вы собираетесь приостановить юриста
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>{lawyer.fullName}</strong> ({lawyer.email})
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Юрист не сможет принимать новые консультации во время приостановки.
              Текущие консультации будут завершены.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Причина приостановки *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите причину приостановки юриста (минимум 10 символов)..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Длительность</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'null' ? null : Number(value))
                    }
                    defaultValue={field.value?.toString() || '7'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите длительность" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 день</SelectItem>
                      <SelectItem value="3">3 дня</SelectItem>
                      <SelectItem value="7">7 дней (1 неделя)</SelectItem>
                      <SelectItem value="14">14 дней (2 недели)</SelectItem>
                      <SelectItem value="30">30 дней (1 месяц)</SelectItem>
                      <SelectItem value="null">Бессрочно</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyLawyer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Отправить уведомление юристу</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Юрист получит email с информацией о приостановке
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? 'Приостановка...' : 'Приостановить юриста'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
