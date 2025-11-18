import { Badge } from '@/components/ui/badge';
import { FAQCategory } from '@/lib/types/content';

interface FAQCategoryBadgeProps {
  category: FAQCategory;
}

const CATEGORY_CONFIG: Record<
  FAQCategory,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  general: { label: 'Общие вопросы', variant: 'default' },
  for_lawyers: { label: 'Юристам', variant: 'secondary' },
  for_clients: { label: 'Клиентам', variant: 'default' },
  payments: { label: 'Оплата', variant: 'destructive' },
  technical: { label: 'Технические', variant: 'outline' },
};

export function FAQCategoryBadge({ category }: FAQCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
