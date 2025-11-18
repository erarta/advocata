'use client';

import { useState } from 'react';
import { Search, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupportPriorityBadge } from '@/components/content/support-priority-badge';
import { SupportStatusBadge } from '@/components/content/support-status-badge';
import { SupportCategoryBadge } from '@/components/content/support-category-badge';
import { useSupportTickets, useSupportTicketStats } from '@/lib/hooks/use-content';
import { SupportStatus, SupportPriority, SupportCategory } from '@/lib/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SupportPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | 'all'>('all');

  const { data: stats, isLoading: statsLoading } = useSupportTicketStats();
  const { data: tickets, isLoading } = useSupportTickets({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Тикеты поддержки</h1>
          <p className="text-gray-500">Управление обращениями пользователей и юристов</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Открытые</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats?.openTickets || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats?.inProgressTickets || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решено сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.resolvedToday || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ср. время ответа</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.averageResponseTime.toFixed(1)}ч</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Поиск по теме или описанию..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SupportStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="open">Открыт</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="waiting_for_user">Ожидание</SelectItem>
                <SelectItem value="resolved">Решён</SelectItem>
                <SelectItem value="closed">Закрыт</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as SupportPriority | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as SupportCategory | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="technical">Технические</SelectItem>
                <SelectItem value="payment">Оплата</SelectItem>
                <SelectItem value="account">Учётная запись</SelectItem>
                <SelectItem value="consultation">Консультация</SelectItem>
                <SelectItem value="lawyer_issue">Проблема с юристом</SelectItem>
                <SelectItem value="refund">Возврат</SelectItem>
                <SelectItem value="other">Прочее</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Тема</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сообщений</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : tickets?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  Тикеты не найдены
                </TableCell>
              </TableRow>
            ) : (
              tickets?.data.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">#{ticket.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={ticket.userAvatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{ticket.userName}</div>
                        <div className="text-xs text-gray-500">
                          {ticket.userRole === 'client' ? 'Клиент' : 'Юрист'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <SupportCategoryBadge category={ticket.category} />
                  </TableCell>
                  <TableCell>
                    <SupportPriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    <SupportStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{ticket.messageCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/content/support/${ticket.id}`}>
                      <Button variant="ghost" size="sm">
                        Открыть
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
