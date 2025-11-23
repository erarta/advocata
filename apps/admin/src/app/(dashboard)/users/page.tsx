'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserTable } from '@/components/users/user-table';
import { UserStatsCard } from '@/components/users/user-stats-card';
import { SuspendUserModal } from '@/components/users/suspend-user-modal';
import { BanUserModal } from '@/components/users/ban-user-modal';
import { useUsers, useUserStats } from '@/lib/hooks/use-users';
import { UserStatus, SubscriptionType, SubscriptionStatus } from '@/lib/types/user';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionType | 'all'>('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [suspendModal, setSuspendModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: '', userName: '' });

  const [banModal, setBanModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: '', userName: '' });

  // Build query params
  const queryParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    subscriptionType: subscriptionFilter !== 'all' ? [subscriptionFilter] : undefined,
  };

  // Fetch data
  const { data: usersData, isLoading } = useUsers(queryParams);
  const { data: stats } = useUserStats();

  const handleSuspend = (userId: string) => {
    const user = usersData?.items.find((u) => u.id === userId);
    if (user) {
      setSuspendModal({ open: true, userId, userName: user.fullName });
    }
  };

  const handleBan = (userId: string) => {
    const user = usersData?.items.find((u) => u.id === userId);
    if (user) {
      setBanModal({ open: true, userId, userName: user.fullName });
    }
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleViewConsultations = (userId: string) => {
    router.push(`/dashboard/users/${userId}?tab=consultations`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">
            Управление учетными записями пользователей и подписками
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <UserStatsCard
            title="Всего пользователей"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
          />
          <UserStatsCard
            title="Активные подписки"
            value={stats.activeSubscriptions.toLocaleString()}
            icon={UserCheck}
          />
          <UserStatsCard
            title="Приостановленные"
            value={stats.suspendedUsers.toLocaleString()}
            icon={UserX}
          />
          <UserStatsCard
            title="Новые за месяц"
            value={stats.newUsersThisMonth.toLocaleString()}
            icon={UserPlus}
            trend={{ value: 12.5, isPositive: true }}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Поиск по имени, email, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Активный</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Неактивный</SelectItem>
              <SelectItem value={UserStatus.SUSPENDED}>Приостановлен</SelectItem>
              <SelectItem value={UserStatus.BANNED}>Заблокирован</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={subscriptionFilter}
            onValueChange={(value) =>
              setSubscriptionFilter(value as SubscriptionType | 'all')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Подписка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подписки</SelectItem>
              <SelectItem value={SubscriptionType.NONE}>Нет подписки</SelectItem>
              <SelectItem value={SubscriptionType.FREE_TRIAL}>Пробная</SelectItem>
              <SelectItem value={SubscriptionType.BASIC}>Базовая</SelectItem>
              <SelectItem value={SubscriptionType.PREMIUM}>Премиум</SelectItem>
              <SelectItem value={SubscriptionType.VIP}>VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">Экспорт CSV</Button>
      </div>

      {/* Users Table */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-8">Загрузка...</div>
        ) : (
          <UserTable
            data={usersData?.items || []}
            onSuspend={handleSuspend}
            onBan={handleBan}
            onViewDetails={handleViewDetails}
            onViewConsultations={handleViewConsultations}
          />
        )}
      </div>

      {/* Modals */}
      <SuspendUserModal
        open={suspendModal.open}
        onOpenChange={(open) => setSuspendModal({ ...suspendModal, open })}
        userId={suspendModal.userId}
        userName={suspendModal.userName}
      />
      <BanUserModal
        open={banModal.open}
        onOpenChange={(open) => setBanModal({ ...banModal, open })}
        userId={banModal.userId}
        userName={banModal.userName}
      />
    </div>
  );
}
