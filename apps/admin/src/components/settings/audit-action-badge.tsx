// Audit Action Badge Component
import { Badge } from '@/components/ui/badge';
import { AuditAction } from '@/lib/types/settings';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  LogIn,
  LogOut,
} from 'lucide-react';

interface AuditActionBadgeProps {
  action: AuditAction;
}

const actionConfig: Record<AuditAction, { label: string; className: string; icon: typeof Plus }> = {
  create: {
    label: 'Создание',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: Plus,
  },
  update: {
    label: 'Изменение',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: Edit,
  },
  delete: {
    label: 'Удаление',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: Trash2,
  },
  approve: {
    label: 'Одобрение',
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    icon: CheckCircle,
  },
  reject: {
    label: 'Отклонение',
    className: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
    icon: XCircle,
  },
  suspend: {
    label: 'Приостановка',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    icon: Pause,
  },
  activate: {
    label: 'Активация',
    className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    icon: Play,
  },
  login: {
    label: 'Вход',
    className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    icon: LogIn,
  },
  logout: {
    label: 'Выход',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    icon: LogOut,
  },
};

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
