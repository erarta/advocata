'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { useSuspendUser } from '@/lib/hooks/use-users';

const suspendSchema = z.object({
  reason: z.string().min(1, 'Выберите причину'),
  details: z.string().min(10, 'Детали должны содержать минимум 10 символов'),
  durationDays: z.number().nullable(),
  notifyUser: z.boolean().default(true),
});

type SuspendFormValues = z.infer<typeof suspendSchema>;

interface SuspendUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function SuspendUserModal({
  open,
  onOpenChange,
  userId,
  userName,
}: SuspendUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suspendMutation = useSuspendUser();

  const form = useForm<SuspendFormValues>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      reason: '',
      details: '',
      durationDays: 7,
      notifyUser: true,
    },
  });

  const onSubmit = async (data: SuspendFormValues) => {
    setIsSubmitting(true);
    try {
      await suspendMutation.mutateAsync({
        id: userId,
        data,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Приостановить пользователя</DialogTitle>
          <DialogDescription>
            Приостановка доступа для пользователя: {userName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Причина</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите причину" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="violation_of_terms">Нарушение условий</SelectItem>
                      <SelectItem value="fraudulent_activity">
                        Мошенническая деятельность
                      </SelectItem>
                      <SelectItem value="spam_abuse">Спам/Злоупотребление</SelectItem>
                      <SelectItem value="payment_issues">Проблемы с оплатой</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Детали</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Укажите подробности..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationDays"
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
                      <SelectItem value="7">1 неделя</SelectItem>
                      <SelectItem value="30">1 месяц</SelectItem>
                      <SelectItem value="null">Бессрочно</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyUser"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Отправить уведомление пользователю</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Приостановка...' : 'Приостановить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
