'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  DollarSign,
  FileText,
  Download,
  Star,
  User,
  Calendar,
  MessageSquare,
  Video,
  AlertCircle,
  Edit,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { ConsultationDetail, PaymentStatus } from '@/lib/types/consultation';
import { ConsultationStatusBadge } from './consultation-status-badge';
import { ConsultationTypeIcon } from './consultation-type-icon';
import { ChatHistoryViewer } from './chat-history-viewer';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ConsultationDetailModalProps {
  consultation: ConsultationDetail | null;
  chatMessages?: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRefund?: (id: string) => void;
  onExportChat?: (id: string) => void;
  onDownloadRecording?: (url: string) => void;
}

export function ConsultationDetailModal({
  consultation,
  chatMessages = [],
  open,
  onOpenChange,
  onEdit,
  onCancel,
  onRefund,
  onExportChat,
  onDownloadRecording,
}: ConsultationDetailModalProps) {
  const [adminNote, setAdminNote] = useState('');

  if (!consultation) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes} мин`;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const paymentStatusConfig = {
    [PaymentStatus.PENDING]: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
    [PaymentStatus.PROCESSING]: { label: 'Обработка', color: 'bg-blue-100 text-blue-800' },
    [PaymentStatus.COMPLETED]: { label: 'Оплачено', color: 'bg-green-100 text-green-800' },
    [PaymentStatus.FAILED]: { label: 'Ошибка', color: 'bg-red-100 text-red-800' },
    [PaymentStatus.REFUNDED]: { label: 'Возвращено', color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Консультация #{consultation.id}</DialogTitle>
              <DialogDescription className="mt-1">
                Детальная информация о консультации
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <ConsultationStatusBadge status={consultation.status} />
              <ConsultationTypeIcon type={consultation.type} showLabel />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="participants">Участники</TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
            <TabsTrigger value="notes">Заметки</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Key Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Запланировано</span>
                </div>
                <p className="text-lg font-semibold">
                  {format(new Date(consultation.scheduledStart), 'dd MMM yyyy, HH:mm', {
                    locale: ru,
                  })}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Длительность</span>
                </div>
                <p className="text-lg font-semibold">{formatDuration(consultation.duration)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Стоимость</span>
                </div>
                <p className="text-lg font-semibold">{formatPrice(consultation.payment.amount)}</p>
              </div>
            </div>

            {/* Issue Description */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Вопрос</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Специализация:</strong> {consultation.specialization}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultation.issue}</p>
            </div>

            {/* Timeline */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Временная шкала</h4>
              <div className="space-y-3">
                {consultation.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                      {index < consultation.timeline.length - 1 && (
                        <div className="flex-1 w-px bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-gray-900">{event.event}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating (if exists) */}
            {consultation.rating && (
              <div className="p-4 border rounded-lg bg-yellow-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">Оценка: {consultation.rating.score}/5</span>
                </div>
                {consultation.rating.comment && (
                  <p className="text-sm text-gray-700 italic">"{consultation.rating.comment}"</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(consultation.rating.createdAt), 'dd MMM yyyy, HH:mm', {
                    locale: ru,
                  })}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4 mt-4">
            {/* Client Card */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(consultation.client.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{consultation.client.fullName}</h4>
                  <p className="text-sm text-gray-500">Клиент</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{consultation.client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span>{consultation.client.phoneNumber}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  Профиль
                </Button>
                <Button variant="outline" size="sm">
                  Отправить сообщение
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lawyer Card */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {getInitials(consultation.lawyer.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{consultation.lawyer.fullName}</h4>
                  <p className="text-sm text-gray-500">Юрист</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{consultation.lawyer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span>{consultation.lawyer.phoneNumber}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  Профиль
                </Button>
                <Button variant="outline" size="sm">
                  Отправить сообщение
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Payment Info */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Платежная информация</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Статус платежа</p>
                  <Badge className={paymentStatusConfig[consultation.payment.status].color}>
                    {paymentStatusConfig[consultation.payment.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600">Метод оплаты</p>
                  <p className="font-medium">{consultation.payment.method}</p>
                </div>
                <div>
                  <p className="text-gray-600">Сумма</p>
                  <p className="font-medium">{formatPrice(consultation.payment.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Обработано</p>
                  <p className="font-medium">
                    {format(new Date(consultation.payment.processedAt), 'dd MMM yyyy, HH:mm', {
                      locale: ru,
                    })}
                  </p>
                </div>
                {consultation.payment.refundedAt && (
                  <>
                    <div>
                      <p className="text-gray-600">Возврат</p>
                      <p className="font-medium">
                        {formatPrice(consultation.payment.refundAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Дата возврата</p>
                      <p className="font-medium">
                        {format(new Date(consultation.payment.refundedAt), 'dd MMM yyyy, HH:mm', {
                          locale: ru,
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Documents */}
            {consultation.documents.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Документы</h4>
                <div className="space-y-2">
                  {consultation.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024).toFixed(2)} KB • Загружен{' '}
                            {doc.uploadedBy === 'client' ? 'клиентом' : 'юристом'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat History */}
            {consultation.type === 'chat' && chatMessages.length > 0 && (
              <div className="border rounded-lg">
                <ChatHistoryViewer
                  messages={chatMessages}
                  onExport={() => onExportChat?.(consultation.id)}
                />
              </div>
            )}

            {/* Recording */}
            {consultation.recording && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Запись</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">
                      <strong>Длительность:</strong> {formatDuration(consultation.recording.duration)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Размер: {(consultation.recording.size / 1024 / 1024).toFixed(2)} MB •{' '}
                      {consultation.recording.format}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadRecording?.(consultation.recording!.url)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Скачать
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Добавить заметку администратора</h4>
              <Textarea
                placeholder="Внутренняя заметка (не видна клиенту и юристу)..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
              <Button className="mt-2" size="sm">
                Сохранить заметку
              </Button>
            </div>

            {consultation.notes && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2">Существующие заметки</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultation.notes}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit?.(consultation.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
            {consultation.status !== 'cancelled' && (
              <Button variant="outline" onClick={() => onCancel?.(consultation.id)}>
                <XCircle className="mr-2 h-4 w-4" />
                Отменить
              </Button>
            )}
            {consultation.payment.status === 'completed' && (
              <Button variant="outline" onClick={() => onRefund?.(consultation.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Возврат средств
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
