import { Badge } from '@/components/ui/badge';
import { DocumentCategory } from '@/lib/types/content';

interface DocumentCategoryBadgeProps {
  category: DocumentCategory;
}

const CATEGORY_CONFIG: Record<
  DocumentCategory,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  traffic_accident: { label: 'ДТП', variant: 'destructive' },
  labor_law: { label: 'Трудовое право', variant: 'default' },
  family_law: { label: 'Семейное право', variant: 'secondary' },
  criminal_law: { label: 'Уголовное право', variant: 'destructive' },
  housing_law: { label: 'Жилищное право', variant: 'default' },
  civil_law: { label: 'Гражданское право', variant: 'default' },
  administrative_law: { label: 'Административное право', variant: 'secondary' },
  other: { label: 'Прочее', variant: 'outline' },
};

export function DocumentCategoryBadge({ category }: DocumentCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
