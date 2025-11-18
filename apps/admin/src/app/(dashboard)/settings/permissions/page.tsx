// Admin Roles & Permissions Page
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Plus, Edit, Trash2, Users, Shield, UserCog } from 'lucide-react';
import {
  useAdminRoles,
  useAllPermissions,
  useAdminUsers,
} from '@/lib/hooks/use-settings';

export default function PermissionsPage() {
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useAdminRoles();
  const { data: permissions, isLoading: permissionsLoading } = useAllPermissions();
  const { data: adminUsers, isLoading: usersLoading } = useAdminUsers();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (rolesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Права доступа</h1>
          <p className="text-gray-600 mt-2">Управление ролями и правами администраторов</p>
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

  if (rolesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Права доступа</h1>
          <p className="text-gray-600 mt-2">Управление ролями и правами администраторов</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки ролей: {rolesError instanceof Error ? rolesError.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Права доступа</h1>
          <p className="text-gray-600 mt-2">Управление ролями и правами администраторов</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать роль
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Роли
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Users className="mr-2 h-4 w-4" />
            Администраторы
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <UserCog className="mr-2 h-4 w-4" />
            Права
          </TabsTrigger>
        </TabsList>

        {/* Roles */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Роли администраторов ({roles?.length || 0})</CardTitle>
              <CardDescription>Управление ролями и их правами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Права</TableHead>
                      <TableHead>Администраторов</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-semibold">{role.name}</TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs">
                            {role.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {role.permissions.length} прав
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              {role.adminsCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            {role.isSystem ? (
                              <Badge variant="secondary">Системная</Badge>
                            ) : (
                              <Badge variant="outline">Пользовательская</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!role.isSystem && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                          Роли не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Users */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Администраторы ({adminUsers?.length || 0})</CardTitle>
              <CardDescription>Список администраторов и их роли</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Администратор</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Последний вход</TableHead>
                        <TableHead className="w-[100px]">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers && adminUsers.length > 0 ? (
                        adminUsers.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={admin.avatar} />
                                  <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{admin.name}</div>
                                  <div className="text-xs text-gray-500">{admin.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                              <Badge>{admin.role.name}</Badge>
                            </TableCell>
                            <TableCell>
                              {admin.isActive ? (
                                <Badge variant="default" className="bg-green-500">
                                  Активен
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Отключен</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {admin.lastLoginAt ? (
                                <div className="text-sm text-gray-600">
                                  {new Date(admin.lastLoginAt).toLocaleString('ru-RU')}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Никогда</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                            Администраторы не найдены
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Доступные права ({permissions?.length || 0})</CardTitle>
              <CardDescription>Список всех доступных прав в системе</CardDescription>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ресурс</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Описание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions && permissions.length > 0 ? (
                        permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Badge variant="outline">{permission.resource}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge>{permission.action}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {permission.description}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                            Права не найдены
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permission Matrix (TODO) */}
          <Card>
            <CardHeader>
              <CardTitle>Матрица прав</CardTitle>
              <CardDescription>Визуальное представление прав по ролям</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                TODO: Добавить матрицу прав (таблица: роли × права)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
