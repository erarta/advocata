import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CohortData } from '@/lib/types/analytics';
import { cn } from '@/lib/utils/cn';

interface CohortAnalysisTableProps {
  cohorts: CohortData[];
  isLoading?: boolean;
}

export function CohortAnalysisTable({ cohorts, isLoading = false }: CohortAnalysisTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  if (cohorts.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Нет данных</div>;
  }

  const getColorClass = (value: number) => {
    if (value >= 80) return 'bg-green-100 text-green-900';
    if (value >= 60) return 'bg-green-50 text-green-800';
    if (value >= 40) return 'bg-yellow-50 text-yellow-800';
    if (value >= 20) return 'bg-orange-50 text-orange-800';
    return 'bg-red-50 text-red-800';
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Когорта</TableHead>
            <TableHead className="text-center">Месяц 0</TableHead>
            <TableHead className="text-center">Месяц 1</TableHead>
            <TableHead className="text-center">Месяц 2</TableHead>
            <TableHead className="text-center">Месяц 3</TableHead>
            <TableHead className="text-center">Месяц 4</TableHead>
            <TableHead className="text-center">Месяц 5</TableHead>
            <TableHead className="text-right">LTV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cohorts.map((cohort) => (
            <TableRow key={cohort.cohort}>
              <TableCell className="font-medium">{cohort.cohort}</TableCell>
              <TableCell className="text-center">
                <div className={cn('inline-block px-2 py-1 rounded', getColorClass(100))}>
                  100%
                </div>
              </TableCell>
              <TableCell className="text-center">
                {cohort.month1 > 0 && (
                  <div className={cn('inline-block px-2 py-1 rounded', getColorClass(cohort.month1))}>
                    {cohort.month1.toFixed(0)}%
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {cohort.month2 > 0 && (
                  <div className={cn('inline-block px-2 py-1 rounded', getColorClass(cohort.month2))}>
                    {cohort.month2.toFixed(0)}%
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {cohort.month3 > 0 && (
                  <div className={cn('inline-block px-2 py-1 rounded', getColorClass(cohort.month3))}>
                    {cohort.month3.toFixed(0)}%
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {cohort.month4 > 0 && (
                  <div className={cn('inline-block px-2 py-1 rounded', getColorClass(cohort.month4))}>
                    {cohort.month4.toFixed(0)}%
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {cohort.month5 > 0 && (
                  <div className={cn('inline-block px-2 py-1 rounded', getColorClass(cohort.month5))}>
                    {cohort.month5.toFixed(0)}%
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(cohort.ltv)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
