// Platform Configuration Form Component
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformConfig } from '@/lib/types/settings';
import { useUpdatePlatformConfig } from '@/lib/hooks/use-settings';
import { Loader2, Save } from 'lucide-react';

const platformConfigSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  defaultLanguage: z.enum(['ru', 'en']),
  timezone: z.string(),
  currency: z.enum(['RUB', 'USD', 'EUR']),
  dateFormat: z.enum(['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['24h', '12h']),
  supportEmail: z.string().email('Неверный формат email'),
  supportPhone: z.string().min(1, 'Телефон обязателен'),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  debugMode: z.boolean(),
  socialMedia: z.object({
    vk: z.string().optional(),
    telegram: z.string().optional(),
    whatsapp: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
  }),
});

type PlatformConfigFormData = z.infer<typeof platformConfigSchema>;

interface PlatformConfigFormProps {
  config: PlatformConfig;
}

export function PlatformConfigForm({ config }: PlatformConfigFormProps) {
  const updateConfig = useUpdatePlatformConfig();

  const form = useForm<PlatformConfigFormData>({
    resolver: zodResolver(platformConfigSchema),
    defaultValues: {
      name: config.name,
      defaultLanguage: config.defaultLanguage,
      timezone: config.timezone,
      currency: config.currency,
      dateFormat: config.dateFormat,
      timeFormat: config.timeFormat,
      supportEmail: config.supportEmail,
      supportPhone: config.supportPhone,
      maintenanceMode: config.maintenanceMode,
      maintenanceMessage: config.maintenanceMessage || '',
      debugMode: config.debugMode,
      socialMedia: {
        vk: config.socialMedia.vk || '',
        telegram: config.socialMedia.telegram || '',
        whatsapp: config.socialMedia.whatsapp || '',
        youtube: config.socialMedia.youtube || '',
        instagram: config.socialMedia.instagram || '',
      },
    },
  });

  const onSubmit = async (data: PlatformConfigFormData) => {
    await updateConfig.mutateAsync(data);
  };

  const maintenanceMode = form.watch('maintenanceMode');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>Базовая информация о платформе</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название платформы</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Advocata"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Язык по умолчанию</Label>
              <Select
                value={form.watch('defaultLanguage')}
                onValueChange={(value) => form.setValue('defaultLanguage', value as 'ru' | 'en')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Select
                value={form.watch('timezone')}
                onValueChange={(value) => form.setValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Europe/Moscow (МСК)</SelectItem>
                  <SelectItem value="Europe/Kiev">Europe/Kiev</SelectItem>
                  <SelectItem value="Asia/Yekaterinburg">Asia/Yekaterinburg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={form.watch('currency')}
                onValueChange={(value) => form.setValue('currency', value as 'RUB' | 'USD' | 'EUR')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">₽ RUB</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Формат даты</Label>
              <Select
                value={form.watch('dateFormat')}
                onValueChange={(value) => form.setValue('dateFormat', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD.MM.YYYY">ДД.ММ.ГГГГ</SelectItem>
                  <SelectItem value="MM/DD/YYYY">ММ/ДД/ГГГГ</SelectItem>
                  <SelectItem value="YYYY-MM-DD">ГГГГ-ММ-ДД</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Формат времени</Label>
              <Select
                value={form.watch('timeFormat')}
                onValueChange={(value) => form.setValue('timeFormat', value as '24h' | '12h')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-часовой</SelectItem>
                  <SelectItem value="12h">12-часовой</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>Контакты поддержки</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email поддержки</Label>
              <Input
                id="supportEmail"
                type="email"
                {...form.register('supportEmail')}
                placeholder="support@advocata.ru"
              />
              {form.formState.errors.supportEmail && (
                <p className="text-sm text-red-500">{form.formState.errors.supportEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">Телефон поддержки</Label>
              <Input
                id="supportPhone"
                {...form.register('supportPhone')}
                placeholder="+7 (800) 123-45-67"
              />
              {form.formState.errors.supportPhone && (
                <p className="text-sm text-red-500">{form.formState.errors.supportPhone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Социальные сети</CardTitle>
          <CardDescription>Ссылки на страницы в социальных сетях</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vk">ВКонтакте</Label>
              <Input
                id="vk"
                {...form.register('socialMedia.vk')}
                placeholder="https://vk.com/advocata"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                {...form.register('socialMedia.telegram')}
                placeholder="https://t.me/advocata"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...form.register('socialMedia.whatsapp')}
                placeholder="https://wa.me/79001234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                {...form.register('socialMedia.youtube')}
                placeholder="https://youtube.com/@advocata"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...form.register('socialMedia.instagram')}
                placeholder="https://instagram.com/advocata"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Системные настройки</CardTitle>
          <CardDescription>Режимы работы платформы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Режим обслуживания</Label>
              <p className="text-sm text-gray-500">Временно отключить доступ к платформе</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={form.watch('maintenanceMode')}
              onCheckedChange={(checked) => form.setValue('maintenanceMode', checked)}
            />
          </div>

          {maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Сообщение</Label>
              <Textarea
                id="maintenanceMessage"
                {...form.register('maintenanceMessage')}
                placeholder="Платформа временно недоступна. Ведутся технические работы."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="debugMode">Режим отладки</Label>
              <p className="text-sm text-gray-500">Включить расширенное логирование</p>
            </div>
            <Switch
              id="debugMode"
              checked={form.watch('debugMode')}
              onCheckedChange={(checked) => form.setValue('debugMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateConfig.isPending}>
          {updateConfig.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
