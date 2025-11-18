// Communication Settings Page (Email & SMS)
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Mail, MessageSquare, TestTube, Save } from 'lucide-react';
import {
  useEmailConfig,
  useSMSConfig,
  useUpdateEmailConfig,
  useUpdateSMSConfig,
  useTestEmailConfig,
  useTestSMSConfig,
} from '@/lib/hooks/use-settings';
import { useForm } from 'react-hook-form';
import { EmailConfigUpdate, SMSConfigUpdate } from '@/lib/types/settings';

export default function CommunicationSettingsPage() {
  const { data: emailConfig, isLoading: emailLoading, error: emailError } = useEmailConfig();
  const { data: smsConfig, isLoading: smsLoading, error: smsError } = useSMSConfig();

  const updateEmail = useUpdateEmailConfig();
  const updateSMS = useUpdateSMSConfig();
  const testEmail = useTestEmailConfig();
  const testSMS = useTestSMSConfig();

  const emailForm = useForm<EmailConfigUpdate>({
    defaultValues: emailConfig,
  });

  const smsForm = useForm<SMSConfigUpdate>({
    defaultValues: smsConfig,
  });

  const handleEmailSubmit = async (data: EmailConfigUpdate) => {
    await updateEmail.mutateAsync(data);
  };

  const handleSMSSubmit = async (data: SMSConfigUpdate) => {
    await updateSMS.mutateAsync(data);
  };

  const handleTestEmail = async () => {
    await testEmail.mutateAsync();
  };

  const handleTestSMS = async () => {
    await testSMS.mutateAsync();
  };

  if (emailLoading || smsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки связи</h1>
          <p className="text-gray-600 mt-2">Конфигурация email и SMS</p>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (emailError || smsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки связи</h1>
          <p className="text-gray-600 mt-2">Конфигурация email и SMS</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки настроек: {emailError?.message || smsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки связи</h1>
        <p className="text-gray-600 mt-2">Конфигурация email и SMS</p>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Настройки Email</span>
                  {emailConfig?.isActive && (
                    <Badge variant="default" className="bg-green-500">
                      Активно
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Конфигурация email-провайдера</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Провайдер</Label>
                  <Select
                    value={emailForm.watch('provider')}
                    onValueChange={(value) => emailForm.setValue('provider', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {emailForm.watch('provider') === 'smtp' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          {...emailForm.register('smtpHost')}
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          {...emailForm.register('smtpPort', { valueAsNumber: true })}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">Username</Label>
                        <Input
                          id="smtpUsername"
                          {...emailForm.register('smtpUsername')}
                          placeholder="user@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          {...emailForm.register('smtpPassword')}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}

                {emailForm.watch('provider') !== 'smtp' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      {...emailForm.register('apiKey')}
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-gray-500">
                      API ключ замаскирован в целях безопасности
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Имя отправителя</Label>
                    <Input
                      id="senderName"
                      {...emailForm.register('senderName')}
                      placeholder="Advocata Support"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Email отправителя</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      {...emailForm.register('senderEmail')}
                      placeholder="noreply@advocata.ru"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    {...emailForm.register('replyToEmail')}
                    placeholder="support@advocata.ru"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitPerHour">Лимит в час</Label>
                  <Input
                    id="rateLimitPerHour"
                    type="number"
                    {...emailForm.register('rateLimitPerHour', { valueAsNumber: true })}
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500">
                    Максимальное количество писем в час
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailActive">Активировать</Label>
                    <p className="text-sm text-gray-500">Использовать эту конфигурацию</p>
                  </div>
                  <Switch
                    id="emailActive"
                    checked={emailForm.watch('isActive')}
                    onCheckedChange={(checked) => emailForm.setValue('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                disabled={testEmail.isPending}
              >
                {testEmail.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Тестирование...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Тест подключения
                  </>
                )}
              </Button>

              <Button type="submit" disabled={updateEmail.isPending}>
                {updateEmail.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* SMS Settings */}
        <TabsContent value="sms" className="space-y-6">
          <form onSubmit={smsForm.handleSubmit(handleSMSSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Настройки SMS</span>
                  {smsConfig?.isActive && (
                    <Badge variant="default" className="bg-green-500">
                      Активно
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Конфигурация SMS-провайдера</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">Провайдер</Label>
                  <Select
                    value={smsForm.watch('provider')}
                    onValueChange={(value) => smsForm.setValue('provider', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="sms_ru">SMS.ru</SelectItem>
                      <SelectItem value="smsc">SMSC.ru</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsApiKey">API Key</Label>
                  <Input
                    id="smsApiKey"
                    type="password"
                    {...smsForm.register('apiKey')}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-gray-500">
                    API ключ замаскирован в целях безопасности
                  </p>
                </div>

                {smsForm.watch('provider') === 'twilio' && (
                  <div className="space-y-2">
                    <Label htmlFor="smsApiSecret">API Secret</Label>
                    <Input
                      id="smsApiSecret"
                      type="password"
                      {...smsForm.register('apiSecret')}
                      placeholder="••••••••••••••••"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="smsSenderName">Имя отправителя</Label>
                  <Input
                    id="smsSenderName"
                    {...smsForm.register('senderName')}
                    placeholder="Advocata"
                  />
                  <p className="text-xs text-gray-500">
                    Имя, отображаемое получателю (до 11 символов)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsRateLimitPerHour">Лимит в час</Label>
                  <Input
                    id="smsRateLimitPerHour"
                    type="number"
                    {...smsForm.register('rateLimitPerHour', { valueAsNumber: true })}
                    placeholder="50"
                  />
                  <p className="text-xs text-gray-500">
                    Максимальное количество SMS в час
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsActive">Активировать</Label>
                    <p className="text-sm text-gray-500">Использовать эту конфигурацию</p>
                  </div>
                  <Switch
                    id="smsActive"
                    checked={smsForm.watch('isActive')}
                    onCheckedChange={(checked) => smsForm.setValue('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestSMS}
                disabled={testSMS.isPending}
              >
                {testSMS.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Тестирование...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Тест подключения
                  </>
                )}
              </Button>

              <Button type="submit" disabled={updateSMS.isPending}>
                {updateSMS.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* TODO: Communication Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Журнал отправки</CardTitle>
          <CardDescription>История отправленных сообщений</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            TODO: Добавить таблицу с логами отправки email/SMS
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
