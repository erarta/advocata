'use client';

import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDuration } from '@/lib/utils/formatters';
import { Trophy, Medal, ArrowUpDown } from 'lucide-react';
import type { LawyerLeaderboard } from '@/lib/types/analytics';
import Link from 'next/link';

interface LeaderboardTableProps {
  lawyers: LawyerLeaderboard[];
  onSort?: (sortBy: string) => void;
  isLoading?: boolean;
}

export function LeaderboardTable({ lawyers, onSort, isLoading = false }: LeaderboardTableProps) {
  const [sortColumn, setSortColumn] = React.useState('revenue');

  const handleSort = (column: string) => {
    setSortColumn(column);
    onSort?.(column);
  };

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

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => handleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Место</TableHead>
            <TableHead>Юрист</TableHead>
            <TableHead>Специализация</TableHead>
            <TableHead>
              <SortButton column="rating">Рейтинг</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="consultations">Консультации</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="revenue">Выручка</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="responseTime">Время отклика</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="completionRate">% Завершенных</SortButton>
            </TableHead>
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
                    <div>
                      <div className="font-medium hover:underline">{lawyer.name}</div>
                      {lawyer.badges && lawyer.badges.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {lawyer.badges.slice(0, 2).map((badge, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{lawyer.specialization}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{lawyer.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">★</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{lawyer.consultations}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(lawyer.revenue)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatDuration(lawyer.responseTime)}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    lawyer.completionRate >= 90
                      ? 'text-green-600 font-medium'
                      : lawyer.completionRate >= 75
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }
                >
                  {lawyer.completionRate.toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
