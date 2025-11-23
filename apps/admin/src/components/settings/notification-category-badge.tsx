// Notification Category Badge Component
import { Badge } from '@/components/ui/badge';
import { NotificationCategory } from '@/lib/types/settings';

interface NotificationCategoryBadgeProps {
  category: NotificationCategory;
}

const categoryConfig: Record<NotificationCategory, { label: string; className: string }> = {
  auth: {
    label: 'Авторизация',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  consultation: {
    label: 'Консультации',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  payment: {
    label: 'Платежи',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  lawyer: {
    label: 'Юристы',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  support: {
    label: 'Поддержка',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
  marketing: {
    label: 'Маркетинг',
    className: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
  },
};

export function NotificationCategoryBadge({ category }: NotificationCategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
