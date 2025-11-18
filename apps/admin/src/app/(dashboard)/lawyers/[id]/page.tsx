'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Star,
  Briefcase,
  Award,
  UserX,
  Ban,
  Edit,
  FileText,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LawyerStatusBadge } from '@/components/lawyers/lawyer-status-badge';
import { SuspendLawyerModal } from '@/components/lawyers/suspend-lawyer-modal';
import { useLawyer } from '@/lib/hooks/use-lawyers';
import { LawyerStatus } from '@/lib/types/lawyer';
import { formatDate, formatDateTime, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';

export default function LawyerDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lawyerId = params.id as string;
  const defaultTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [suspendModal, setSuspendModal] = useState(false);
  const [banModal, setBanModal] = useState(false);

  // TODO: Backend Integration - Replace with actual API call
  // const { data: lawyer, isLoading } = useLawyer(lawyerId);

  // Mock data for development
  const mockLawyer = {
    id: lawyerId,
    fullName: 'Алексей Петров',
    email: 'alexey.petrov.law@advocata.ru',
    phoneNumber: '+7 921 900-10-01',
    avatar: null,
    licenseNumber: '78/12345',
    education: [
      {
        institution: 'СПбГУ',
        degree: 'Магистр',
        field: 'Юриспруденция',
        yearGraduated: 2010,
      },
    ],
    bio: 'Специализируюсь на уголовном праве и делах о ДТП. Более 15 лет практики. Успешно защитил более 200 клиентов.',
    specializations: ['Уголовное право', 'ДТП', 'Административное право'],
    experienceYears: 15,
    rating: 4.95,
    reviewCount: 124,
    totalConsultations: 247,
    hourlyRate: 5000,
    status: LawyerStatus.ACTIVE,
    verifiedAt: '2023-01-15T10:00:00Z',
    createdAt: '2023-01-10T08:00:00Z',
    lastActiveAt: new Date().toISOString(),
    languages: ['Русский', 'Английский'],
    consultations: [
      {
        id: '1',
        client: { fullName: 'Иван Сидоров', avatar: null },
        type: 'video',
        scheduledStart: '2025-11-15T14:00:00Z',
        duration: 3600,
        status: 'completed',
        payment: { amount: 5000 },
      },
      {
        id: '2',
        client: { fullName: 'Мария Иванова', avatar: null },
        type: 'chat',
        scheduledStart: '2025-11-16T10:00:00Z',
        duration: 1800,
        status: 'completed',
        payment: { amount: 2500 },
      },
      {
        id: '3',
        client: { fullName: 'Петр Козлов', avatar: null },
        type: 'call',
        scheduledStart: '2025-11-17T15:00:00Z',
        duration: 2400,
        status: 'scheduled',
        payment: { amount: 4000 },
      },
    ],
    reviews: [
      {
        id: '1',
        client: { fullName: 'Иван Сидоров', avatar: null },
        rating: 5,
        comment: 'Отличный юрист! Помог разобраться со сложной ситуацией.',
        createdAt: '2025-11-15T16:00:00Z',
        consultationType: 'video',
      },
      {
        id: '2',
        client: { fullName: 'Мария Иванова', avatar: null },
        rating: 5,
        comment: 'Профессионал своего дела. Рекомендую!',
        createdAt: '2025-11-16T12:00:00Z',
        consultationType: 'chat',
      },
    ],
    documents: [
      {
        id: '1',
        type: 'license',
        url: '/documents/license.pdf',
        uploadedAt: '2023-01-10T08:00:00Z',
        status: 'verified',
      },
      {
        id: '2',
        type: 'diploma',
        url: '/documents/diploma.pdf',
        uploadedAt: '2023-01-10T08:00:00Z',
        status: 'verified',
      },
    ],
    experience: [
      {
        company: 'Юридическая фирма "Правовед"',
        position: 'Старший партнер',
        startDate: new Date('2015-01-01'),
        endDate: null,
        description: 'Ведение уголовных дел и консультирование клиентов',
      },
      {
        company: 'Адвокатская контора "Защита"',
        position: 'Адвокат',
        startDate: new Date('2010-06-01'),
        endDate: new Date('2014-12-31'),
        description: 'Представление интересов клиентов в суде',
      },
    ],
  };

  const lawyer = mockLawyer;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля юриста...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Юрист не найден</h3>
          <p className="mt-2 text-gray-600">Проверьте правильность ID</p>
          <Link href="/lawyers">
            <Button className="mt-4" variant="outline">
              Вернуться к списку
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate rating breakdown
  const ratingBreakdown = {
    5: 85,
    4: 10,
    3: 3,
    2: 1,
    1: 1,
  };

  // Calculate total earnings from consultations
  const totalEarnings = lawyer.consultations.reduce(
    (sum, c) => sum + (c.payment?.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/lawyers">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
      </Link>

      {/* Lawyer Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl font-bold">
              {lawyer.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{lawyer.fullName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <LawyerStatusBadge status={lawyer.status} />
              <Badge variant="outline">Лицензия: {lawyer.licenseNumber}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {lawyer.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {lawyer.phoneNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Верифицирован {formatDate(lawyer.verifiedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="outline" onClick={() => setSuspendModal(true)}>
            <UserX className="mr-2 h-4 w-4" />
            Приостановить
          </Button>
          <Button variant="outline" onClick={() => setBanModal(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Заблокировать
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="consultations">Консультации</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{lawyer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                  <p className="text-sm">{lawyer.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Номер лицензии</p>
                  <p className="text-sm">{lawyer.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Языки</p>
                  <div className="flex gap-1 mt-1">
                    {lawyer.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Профессиональная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Специализации</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lawyer.specializations.map((spec) => (
                      <Badge key={spec} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Опыт работы</p>
                  <p className="text-sm">{lawyer.experienceYears} лет</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ставка в час</p>
                  <p className="text-sm">{formatCurrency(lawyer.hourlyRate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Образование</p>
                  {lawyer.education.map((edu, idx) => (
                    <div key={idx} className="mt-1">
                      <p className="text-sm font-medium">
                        {edu.institution} ({edu.yearGraduated})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.degree}, {edu.field}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>О себе</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <p className="text-2xl font-bold">{lawyer.rating.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lawyer.reviewCount} отзывов
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{lawyer.totalConsultations}</p>
                  <p className="text-xs text-muted-foreground">Всего консультаций</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                  <p className="text-xs text-muted-foreground">Заработано</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{lawyer.experienceYears}</p>
                  <p className="text-xs text-muted-foreground">Лет опыта</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Опыт работы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lawyer.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-4">
                  <p className="font-semibold">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(exp.startDate)} -{' '}
                    {exp.endDate ? formatDate(exp.endDate) : 'Настоящее время'}
                  </p>
                  <p className="text-sm mt-2">{exp.description}</p>
                </div>
              ))}
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
              {lawyer.consultations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Длительность</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Заработок</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lawyer.consultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell className="text-sm">
                          {formatDateTime(consultation.scheduledStart)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {consultation.client.fullName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {consultation.type === 'video' && 'Видео'}
                            {consultation.type === 'call' && 'Звонок'}
                            {consultation.type === 'chat' && 'Чат'}
                            {consultation.type === 'in_person' && 'Личная встреча'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {Math.floor(consultation.duration / 60)} мин
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              consultation.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {consultation.status === 'completed' && 'Завершена'}
                            {consultation.status === 'scheduled' && 'Запланирована'}
                            {consultation.status === 'cancelled' && 'Отменена'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatCurrency(consultation.payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Нет консультаций
                </p>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Всего заработано:</p>
                <p className="text-lg font-bold">{formatCurrency(totalEarnings)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отзывы клиентов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Breakdown */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-3xl font-bold">{lawyer.rating.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {lawyer.reviewCount} отзывов
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-12">{rating} звезд</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${ratingBreakdown[rating as keyof typeof ratingBreakdown]}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {ratingBreakdown[rating as keyof typeof ratingBreakdown]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reviews List */}
              <div className="space-y-4">
                {lawyer.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {review.client.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.client.fullName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(review.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm">{review.comment}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {review.consultationType === 'video' && 'Видео-консультация'}
                        {review.consultationType === 'call' && 'Звонок'}
                        {review.consultationType === 'chat' && 'Чат'}
                        {review.consultationType === 'in_person' && 'Личная встреча'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Документы</CardTitle>
            </CardHeader>
            <CardContent>
              {lawyer.documents.length > 0 ? (
                <div className="space-y-3">
                  {lawyer.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {doc.type === 'license' && 'Адвокатская лицензия'}
                            {doc.type === 'diploma' && 'Диплом об образовании'}
                            {doc.type === 'passport' && 'Паспорт'}
                            {doc.type === 'other' && 'Другой документ'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Загружен {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={doc.status === 'verified' ? 'default' : 'secondary'}
                        >
                          {doc.status === 'verified' && 'Проверено'}
                          {doc.status === 'pending' && 'На проверке'}
                          {doc.status === 'rejected' && 'Отклонено'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Скачать
                        </Button>
                        <Button size="sm" variant="outline">
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Нет документов
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Административные действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Редактировать профиль</p>
                  <p className="text-sm text-muted-foreground">
                    Изменить информацию юриста
                  </p>
                </div>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Приостановить юриста</p>
                  <p className="text-sm text-muted-foreground">
                    Временно заблокировать доступ
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSuspendModal(true)}>
                  <UserX className="mr-2 h-4 w-4" />
                  Приостановить
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Заблокировать юриста</p>
                  <p className="text-sm text-muted-foreground">
                    Постоянно заблокировать доступ
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setBanModal(true)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Заблокировать
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Сбросить пароль</p>
                  <p className="text-sm text-muted-foreground">
                    Отправить ссылку для сброса пароля
                  </p>
                </div>
                <Button variant="outline">Сбросить пароль</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Отправить уведомление</p>
                  <p className="text-sm text-muted-foreground">
                    Отправить сообщение юристу
                  </p>
                </div>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Отправить
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Опасная зона</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Удалить аккаунт юриста</p>
                  <p className="text-sm text-muted-foreground">
                    Это действие нельзя отменить
                  </p>
                </div>
                <Button variant="destructive">Удалить аккаунт</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SuspendLawyerModal
        open={suspendModal}
        onOpenChange={setSuspendModal}
        lawyer={lawyer}
      />
    </div>
  );
}
