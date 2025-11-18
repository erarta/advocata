// Feature Flag Category Badge Component
import { Badge } from '@/components/ui/badge';
import { FeatureFlagCategory } from '@/lib/types/settings';

interface FeatureFlagCategoryBadgeProps {
  category: FeatureFlagCategory;
}

const categoryConfig: Record<FeatureFlagCategory, { label: string; className: string }> = {
  consultations: {
    label: 'Консультации',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  payments: {
    label: 'Платежи',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  features: {
    label: 'Функции',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  experimental: {
    label: 'Экспериментальные',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
  maintenance: {
    label: 'Обслуживание',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
};

export function FeatureFlagCategoryBadge({ category }: FeatureFlagCategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
