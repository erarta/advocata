// Rate Limits Page
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Plus, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import {
  useRateLimits,
  useIPWhitelist,
  useIPBlacklist,
  useRateLimitUsage,
} from '@/lib/hooks/use-settings';

export default function RateLimitsPage() {
  const { data: limits, isLoading: limitsLoading, error: limitsError } = useRateLimits();
  const { data: whitelist, isLoading: whitelistLoading } = useIPWhitelist();
  const { data: blacklist, isLoading: blacklistLoading } = useIPBlacklist();
  const { data: usage } = useRateLimitUsage();

  if (limitsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Лимиты API</h1>
          <p className="text-gray-600 mt-2">Управление ограничениями запросов к API</p>
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

  if (limitsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Лимиты API</h1>
          <p className="text-gray-600 mt-2">Управление ограничениями запросов к API</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки лимитов: {limitsError instanceof Error ? limitsError.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Лимиты API</h1>
          <p className="text-gray-600 mt-2">Управление ограничениями запросов к API</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить лимит
        </Button>
      </div>

      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="limits">
            <Shield className="mr-2 h-4 w-4" />
            Лимиты
          </TabsTrigger>
          <TabsTrigger value="whitelist">
            <CheckCircle className="mr-2 h-4 w-4" />
            Белый список
          </TabsTrigger>
          <TabsTrigger value="blacklist">
            <XCircle className="mr-2 h-4 w-4" />
            Черный список
          </TabsTrigger>
        </TabsList>

        {/* Rate Limits */}
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Конфигурация лимитов ({limits?.length || 0})</CardTitle>
              <CardDescription>Ограничения запросов по ресурсам и ролям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ресурс</TableHead>
                      <TableHead>Метод</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Лимит</TableHead>
                      <TableHead>Период</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {limits && limits.length > 0 ? (
                      limits.map((limit) => (
                        <TableRow key={limit.id}>
                          <TableCell className="font-mono text-sm">{limit.resource}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{limit.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{limit.role}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{limit.limit}</TableCell>
                          <TableCell>
                            {limit.window === 'minute' && 'в минуту'}
                            {limit.window === 'hour' && 'в час'}
                            {limit.window === 'day' && 'в день'}
                          </TableCell>
                          <TableCell>
                            {limit.isActive ? (
                              <Badge variant="default" className="bg-green-500">
                                Активен
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Отключен</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                          Лимиты не настроены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Current Usage */}
          {usage && usage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Текущее использование</CardTitle>
                <CardDescription>Статистика запросов в реальном времени</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usage.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-mono text-sm font-semibold">{item.resource}</div>
                        <div className="text-xs text-gray-500">
                          Сброс через: {new Date(item.resetAt).toLocaleTimeString('ru-RU')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {item.currentCount} / {item.limit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((item.currentCount / item.limit) * 100)}% использовано
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* IP Whitelist */}
        <TabsContent value="whitelist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Белый список IP ({whitelist?.length || 0})</CardTitle>
                  <CardDescription>IP-адреса без ограничений</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить IP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP-адрес</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Добавлен</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ) : whitelist && whitelist.length > 0 ? (
                      whitelist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.ipAddress}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          Белый список пуст
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Blacklist */}
        <TabsContent value="blacklist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Черный список IP ({blacklist?.length || 0})</CardTitle>
                  <CardDescription>Заблокированные IP-адреса</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить IP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP-адрес</TableHead>
                      <TableHead>Причина</TableHead>
                      <TableHead>Добавлен</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklistLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ) : blacklist && blacklist.length > 0 ? (
                      blacklist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.ipAddress}</TableCell>
                          <TableCell>{item.reason}</TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          Черный список пуст
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
