'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Ban,
  UserX,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { UserStatusBadge } from '@/components/users/user-status-badge';
import { SubscriptionBadge } from '@/components/users/subscription-badge';
import { ActivityTimeline } from '@/components/users/activity-timeline';
import { SuspendUserModal } from '@/components/users/suspend-user-modal';
import { BanUserModal } from '@/components/users/ban-user-modal';
import {
  useUser,
  useUserSubscription,
  useUserConsultations,
  useUserPayments,
  useUserActivity,
} from '@/lib/hooks/use-users';

export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const defaultTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [suspendModal, setSuspendModal] = useState(false);
  const [banModal, setBanModal] = useState(false);

  // Fetch user data
  const { data: user, isLoading } = useUser(userId);
  const { data: subscriptionData } = useUserSubscription(userId);
  const { data: consultationsData } = useUserConsultations(userId, { page: 1, limit: 10 });
  const { data: paymentsData } = useUserPayments(userId, { page: 1, limit: 10 });
  const { data: activityData } = useUserActivity(userId, { page: 1, limit: 20 });

  if (isLoading) {
    return <div className="flex justify-center py-8">Загрузка...</div>;
  }

  if (!user) {
    return <div className="flex justify-center py-8">Пользователь не найден</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/users">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
      </Link>

      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <UserStatusBadge status={user.status} />
              <SubscriptionBadge
                type={user.subscription.type}
                status={user.subscription.status}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {user.phoneNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(user.registeredAt), 'dd.MM.yyyy', { locale: ru })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSuspendModal(true)}>
            <UserX className="mr-2 h-4 w-4" />
            Приостановить
          </Button>
          <Button variant="outline" onClick={() => setBanModal(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Заблокировать
          </Button>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="subscription">Подписка</TabsTrigger>
          <TabsTrigger value="consultations">Консультации</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                  <p className="text-sm">{user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата рождения</p>
                  <p className="text-sm">
                    {format(new Date(user.dateOfBirth), 'dd.MM.yyyy', { locale: ru })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Адрес</p>
                  <p className="text-sm">{user.address.city}, {user.address.street}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2">Статистика</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{user.statistics.totalConsultations}</p>
                    <p className="text-xs text-muted-foreground">Всего консультаций</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {user.statistics.completionRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Завершено</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {user.statistics.totalSpent.toLocaleString()} ₽
                    </p>
                    <p className="text-xs text-muted-foreground">Потрачено</p>
                  </div>
                </div>
              </div>

              {user.referral && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Реферальная программа</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Реферальный код</p>
                        <p className="text-sm text-muted-foreground">{user.referral.code}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Приглашено</p>
                        <p className="text-sm text-muted-foreground">
                          {user.referral.referralCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Бонусы</p>
                        <p className="text-sm text-muted-foreground">
                          {user.referral.bonusEarned.toLocaleString()} ₽
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Текущая подписка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Тип</p>
                  <SubscriptionBadge
                    type={user.subscription.type}
                    status={user.subscription.status}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Статус</p>
                  <p className="text-sm">{user.subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата начала</p>
                  <p className="text-sm">
                    {format(new Date(user.subscription.startDate), 'dd.MM.yyyy', {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Дата продления
                  </p>
                  <p className="text-sm">
                    {format(new Date(user.subscription.renewalDate), 'dd.MM.yyyy', {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Стоимость</p>
                  <p className="text-sm">{user.subscription.amount.toLocaleString()} ₽/мес</p>
                </div>
              </div>

              <Separator />

              {subscriptionData?.history && subscriptionData.history.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">История подписок</h4>
                  <div className="space-y-2">
                    {subscriptionData.history.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <div>
                          <p className="text-sm font-medium">{sub.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(sub.createdAt), 'dd.MM.yyyy HH:mm', {
                              locale: ru,
                            })}
                          </p>
                        </div>
                        <SubscriptionBadge type={sub.type} status={sub.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История консультаций</CardTitle>
            </CardHeader>
            <CardContent>
              {consultationsData?.items && consultationsData.items.length > 0 ? (
                <div className="space-y-2">
                  {consultationsData.items.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {consultation.lawyer.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(consultation.scheduledStart), 'dd.MM.yyyy HH:mm', {
                            locale: ru,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {consultation.payment.amount.toLocaleString()} ₽
                        </p>
                        <p className="text-xs text-muted-foreground">{consultation.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Нет консультаций
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История платежей</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsData?.items && paymentsData.items.length > 0 ? (
                <div className="space-y-2">
                  {paymentsData.items.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <p className="text-sm font-medium">{payment.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.createdAt), 'dd.MM.yyyy HH:mm', {
                            locale: ru,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {payment.amount.toLocaleString()} ₽
                        </p>
                        <p className="text-xs text-muted-foreground">{payment.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Нет платежей</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Активность пользователя</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData?.items && activityData.items.length > 0 ? (
                <ActivityTimeline activities={activityData.items} />
              ) : (
                <p className="text-center text-muted-foreground py-4">Нет активности</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SuspendUserModal
        open={suspendModal}
        onOpenChange={setSuspendModal}
        userId={userId}
        userName={user.fullName}
      />
      <BanUserModal
        open={banModal}
        onOpenChange={setBanModal}
        userId={userId}
        userName={user.fullName}
      />
    </div>
  );
}
