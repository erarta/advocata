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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  User,
  FileText,
  Image as ImageIcon,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  Scale,
} from 'lucide-react';
import { Dispute, DisputeReason, DisputeResolution } from '@/lib/types/consultation';
import { DisputeStatusBadge } from './dispute-status-badge';
import { DisputePriorityBadge } from './dispute-priority-badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DisputeDetailModalProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve?: (id: string, resolution: DisputeResolution) => void;
  onUpdatePriority?: (id: string, priority: 'low' | 'medium' | 'high') => void;
  onAssign?: (id: string, adminId: string) => void;
}

const reasonLabels: Record<DisputeReason, string> = {
  [DisputeReason.UNPROFESSIONAL_BEHAVIOR]: 'Непрофессиональное поведение',
  [DisputeReason.NO_SHOW]: 'Неявка',
  [DisputeReason.POOR_QUALITY]: 'Низкое качество услуги',
  [DisputeReason.TECHNICAL_ISSUES]: 'Технические проблемы',
  [DisputeReason.PAYMENT_ISSUE]: 'Проблема с оплатой',
  [DisputeReason.OTHER]: 'Другое',
};

export function DisputeDetailModal({
  dispute,
  open,
  onOpenChange,
  onResolve,
  onUpdatePriority,
  onAssign,
}: DisputeDetailModalProps) {
  const [decision, setDecision] = useState<'client_favor' | 'lawyer_favor' | 'mutual'>('mutual');
  const [refundAmount, setRefundAmount] = useState('0');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [lawyerAction, setLawyerAction] = useState<'warning' | 'suspension' | 'none'>('none');
  const [suspensionDuration, setSuspensionDuration] = useState('7');

  if (!dispute) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleResolve = () => {
    const resolution: DisputeResolution = {
      decision,
      refundAmount: parseFloat(refundAmount),
      notes: resolutionNotes,
      lawyerAction:
        lawyerAction === 'none'
          ? undefined
          : {
              type: lawyerAction,
              duration: lawyerAction === 'suspension' ? parseInt(suspensionDuration) : undefined,
              notes: resolutionNotes,
            },
      resolvedBy: 'current-admin', // TODO: Get from auth context
      resolvedAt: new Date(),
    };

    onResolve?.(dispute.id, resolution);
  };

  const evidenceIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'screenshot':
        return ImageIcon;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Спор #{dispute.id}</DialogTitle>
              <DialogDescription className="mt-1">
                Консультация #{dispute.consultationId}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <DisputeStatusBadge status={dispute.status} />
              <DisputePriorityBadge priority={dispute.priority} showIcon />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="evidence">Доказательства</TabsTrigger>
            <TabsTrigger value="investigation">Расследование</TabsTrigger>
            <TabsTrigger value="resolution">Решение</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Dispute Details */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Детали спора</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Причина</p>
                  <p className="font-medium">{reasonLabels[dispute.reason]}</p>
                </div>
                <div>
                  <p className="text-gray-600">Подан</p>
                  <p className="font-medium">
                    {format(new Date(dispute.filedAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Подан кем</p>
                  <Badge variant="outline">
                    {dispute.filedBy === 'client' ? 'Клиент' : 'Юрист'}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600">Приоритет</p>
                  <Select
                    value={dispute.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      onUpdatePriority?.(dispute.id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              {/* Filed By */}
              <div className="p-4 border rounded-lg bg-red-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Подал спор</h4>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-red-100 text-red-700">
                      {getInitials(dispute.filedByName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dispute.filedByName}</p>
                    <p className="text-sm text-gray-600">
                      {dispute.filedBy === 'client' ? 'Клиент' : 'Юрист'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Against */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold">Против</h4>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      {getInitials(dispute.againstName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dispute.againstName}</p>
                    <p className="text-sm text-gray-600">
                      {dispute.filedBy === 'client' ? 'Юрист' : 'Клиент'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statement */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Заявление</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{dispute.statement}</p>
            </div>

            {/* Response */}
            {dispute.response && (
              <div className="p-4 border rounded-lg bg-blue-50/50">
                <h4 className="font-semibold mb-2">Ответ</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                  {dispute.response.statement}
                </p>
                <p className="text-xs text-gray-500">
                  Отправлено{' '}
                  {format(new Date(dispute.response.respondedAt), 'dd MMM yyyy, HH:mm', {
                    locale: ru,
                  })}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4 mt-4">
            {/* Claimant Evidence */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">
                Доказательства от {dispute.filedByName}
              </h4>
              {dispute.evidence.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {dispute.evidence.map((item, index) => {
                    const Icon = evidenceIcon(item.type);
                    return (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{item.type}</p>
                          {item.description && (
                            <p className="text-xs text-gray-600 truncate">{item.description}</p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Доказательства не предоставлены</p>
              )}
            </div>

            {/* Response Evidence */}
            {dispute.response?.evidence && dispute.response.evidence.length > 0 && (
              <div className="p-4 border rounded-lg bg-blue-50/50">
                <h4 className="font-semibold mb-3">
                  Доказательства от {dispute.againstName}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {dispute.response.evidence.map((item, index) => {
                    const Icon = evidenceIcon(item.type);
                    return (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{item.type}</p>
                          {item.description && (
                            <p className="text-xs text-gray-600 truncate">{item.description}</p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Investigation Tab */}
          <TabsContent value="investigation" className="space-y-4 mt-4">
            {dispute.investigation ? (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Результаты расследования</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Заметки</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {dispute.investigation.notes}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Выводы</p>
                    <ul className="space-y-1">
                      {dispute.investigation.findings.map((finding, index) => (
                        <li key={index} className="text-sm text-gray-900 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Расследовал: {dispute.investigation.investigatedBy} •{' '}
                      {format(new Date(dispute.investigation.investigatedAt), 'dd MMM yyyy, HH:mm', {
                        locale: ru,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Расследование еще не проведено</p>
              </div>
            )}
          </TabsContent>

          {/* Resolution Tab */}
          <TabsContent value="resolution" className="space-y-4 mt-4">
            {dispute.resolution ? (
              <div className="p-4 border rounded-lg bg-green-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Решение принято</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Решение</p>
                    <Badge className="mt-1">
                      {dispute.resolution.decision === 'client_favor'
                        ? 'В пользу клиента'
                        : dispute.resolution.decision === 'lawyer_favor'
                        ? 'В пользу юриста'
                        : 'Взаимное соглашение'}
                    </Badge>
                  </div>
                  {dispute.resolution.refundAmount > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Сумма возврата</p>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                        }).format(dispute.resolution.refundAmount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Примечания</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {dispute.resolution.notes}
                    </p>
                  </div>
                  {dispute.resolution.lawyerAction && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-900">
                        Действия в отношении юриста
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        {dispute.resolution.lawyerAction.type === 'warning'
                          ? 'Предупреждение'
                          : `Приостановка на ${dispute.resolution.lawyerAction.duration} дней`}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Решение принял: {dispute.resolution.resolvedBy} •{' '}
                      {format(new Date(dispute.resolution.resolvedAt), 'dd MMM yyyy, HH:mm', {
                        locale: ru,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <Label>Решение</Label>
                  <Select value={decision} onValueChange={(v: any) => setDecision(v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_favor">В пользу клиента</SelectItem>
                      <SelectItem value="lawyer_favor">В пользу юриста</SelectItem>
                      <SelectItem value="mutual">Взаимное соглашение</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label htmlFor="refund">Сумма возврата (₽)</Label>
                  <Input
                    id="refund"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="mt-2"
                    min="0"
                    step="100"
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <Label>Действия в отношении юриста</Label>
                  <Select value={lawyerAction} onValueChange={(v: any) => setLawyerAction(v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Нет действий</SelectItem>
                      <SelectItem value="warning">Предупреждение</SelectItem>
                      <SelectItem value="suspension">Приостановка</SelectItem>
                    </SelectContent>
                  </Select>

                  {lawyerAction === 'suspension' && (
                    <div className="mt-3">
                      <Label htmlFor="duration">Длительность (дни)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={suspensionDuration}
                        onChange={(e) => setSuspensionDuration(e.target.value)}
                        className="mt-2"
                        min="1"
                        max="365"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <Label htmlFor="notes">Примечания к решению</Label>
                  <Textarea
                    id="notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="mt-2"
                    rows={4}
                    placeholder="Подробное обоснование решения..."
                  />
                </div>

                <Button onClick={handleResolve} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Подтвердить решение
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
