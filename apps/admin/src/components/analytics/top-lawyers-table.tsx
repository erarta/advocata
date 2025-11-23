import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatters';
import { Trophy, Medal } from 'lucide-react';
import type { LawyerRevenue } from '@/lib/types/analytics';
import Link from 'next/link';

interface TopLawyersTableProps {
  lawyers: LawyerRevenue[];
  isLoading?: boolean;
}

export function TopLawyersTable({ lawyers, isLoading = false }: TopLawyersTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  if (lawyers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Нет данных</div>;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Место</TableHead>
            <TableHead>Юрист</TableHead>
            <TableHead>Специализация</TableHead>
            <TableHead className="text-right">Консультации</TableHead>
            <TableHead className="text-right">Выручка</TableHead>
            <TableHead className="text-right">Комиссия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lawyers.map((lawyer) => (
            <TableRow key={lawyer.id}>
              <TableCell className="font-medium">
                <div className="flex items-center justify-center gap-1">
                  {getRankIcon(lawyer.rank) || <span>#{lawyer.rank}</span>}
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/lawyers/${lawyer.id}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={lawyer.avatar} alt={lawyer.name} />
                      <AvatarFallback>
                        {lawyer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium hover:underline">{lawyer.name}</span>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{lawyer.specialization}</Badge>
              </TableCell>
              <TableCell className="text-right">{lawyer.consultationCount}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(lawyer.revenue)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(lawyer.commission)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
