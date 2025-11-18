import { Badge } from '@/components/ui/badge';
import { SupportCategory } from '@/lib/types/content';

interface SupportCategoryBadgeProps {
  category: SupportCategory;
}

const CATEGORY_CONFIG: Record<
  SupportCategory,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  technical: { label: 'Технические проблемы', variant: 'default' },
  payment: { label: 'Оплата', variant: 'destructive' },
  account: { label: 'Учётная запись', variant: 'default' },
  consultation: { label: 'Консультация', variant: 'secondary' },
  lawyer_issue: { label: 'Проблема с юристом', variant: 'destructive' },
  refund: { label: 'Возврат средств', variant: 'destructive' },
  other: { label: 'Прочее', variant: 'outline' },
};

export function SupportCategoryBadge({ category }: SupportCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
