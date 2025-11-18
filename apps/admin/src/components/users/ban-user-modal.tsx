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
import { Input } from '@/components/ui/input';
import { useBanUser } from '@/lib/hooks/use-users';

const banSchema = z.object({
  reason: z.string().min(1, 'Выберите причину'),
  details: z.string().min(10, 'Детали должны содержать минимум 10 символов'),
  permanent: z.boolean().default(true),
  expiryDate: z.date().optional(),
  notifyUser: z.boolean().default(true),
});

type BanFormValues = z.infer<typeof banSchema>;

interface BanUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function BanUserModal({ open, onOpenChange, userId, userName }: BanUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const banMutation = useBanUser();

  const form = useForm<BanFormValues>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      reason: '',
      details: '',
      permanent: true,
      notifyUser: true,
    },
  });

  const isPermanent = form.watch('permanent');

  const onSubmit = async (data: BanFormValues) => {
    setIsSubmitting(true);
    try {
      await banMutation.mutateAsync({
        id: userId,
        data,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Заблокировать пользователя</DialogTitle>
          <DialogDescription>
            Блокировка доступа для пользователя: {userName}
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
                      <SelectItem value="severe_violation">Серьезное нарушение</SelectItem>
                      <SelectItem value="repeated_offenses">
                        Повторные нарушения
                      </SelectItem>
                      <SelectItem value="fraudulent_account">
                        Мошеннический аккаунт
                      </SelectItem>
                      <SelectItem value="legal_issues">Юридические проблемы</SelectItem>
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
                  <FormLabel>Детали (обязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Укажите подробности блокировки..."
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
              name="permanent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Постоянная блокировка</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!isPermanent && (
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата окончания блокировки</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
