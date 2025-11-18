'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PayoutStatusBadge } from '@/components/financial/payout-status-badge';
import { PayoutDetailModal } from '@/components/financial/payout-detail-modal';
import { usePayoutHistory, useExportPayouts } from '@/lib/hooks/use-financial';
import { PayoutParams, PayoutStatus, PaymentMethod } from '@/lib/types/financial';
import { Search, Download, Eye, ArrowLeft, Calendar } from 'lucide-react';

export default function PayoutHistoryPage() {
  const [params, setParams] = useState<PayoutParams>({
    page: 1,
    limit: 20,
    sort_by: 'due_date',
    sort_order: 'desc', // Most recent first for history
  });

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  const { data: payoutsData, isLoading } = usePayoutHistory(params);
  const exportMutation = useExportPayouts();

  const handleExport = () => {
    exportMutation.mutate(params);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/financial/payouts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout History</h1>
          <p className="text-muted-foreground">
            View all processed and completed payouts
          </p>
        </div>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                All payouts that have been processed or completed
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by lawyer name..."
                className="pl-8"
                value={params.search || ''}
                onChange={(e) =>
                  setParams({ ...params, search: e.target.value, page: 1 })
                }
              />
            </div>

            <Input
              type="date"
              placeholder="From date"
              className="w-[180px]"
              value={params.date_from || ''}
              onChange={(e) =>
                setParams({ ...params, date_from: e.target.value, page: 1 })
              }
            />

            <Input
              type="date"
              placeholder="To date"
              className="w-[180px]"
              value={params.date_to || ''}
              onChange={(e) =>
                setParams({ ...params, date_to: e.target.value, page: 1 })
              }
            />

            <Select
              value={params.status || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  status: value === 'all' ? undefined : (value as PayoutStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={params.payment_method || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  payment_method:
                    value === 'all' ? undefined : (value as PaymentMethod),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="yookassa">YooKassa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Processed</TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-center">Consultations</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : payoutsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No payout history found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutsData?.data.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="text-sm">
                        {format(new Date(payout.updated_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={payout.lawyer_avatar} />
                            <AvatarFallback>
                              {payout.lawyer_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{payout.lawyer_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payout.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-right text-red-600 text-sm">
                        -{payout.commission_deducted.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {payout.consultations_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {payout.payment_method.replace('-', ' ')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payout.id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <PayoutStatusBadge status={payout.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayoutId(payout.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {payoutsData && payoutsData.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(params.page! - 1) * params.limit! + 1} to{' '}
                {Math.min(
                  params.page! * params.limit!,
                  payoutsData.pagination.total
                )}{' '}
                of {payoutsData.pagination.total} payouts
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === 1}
                  onClick={() => setParams({ ...params, page: params.page! - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === payoutsData.pagination.total_pages}
                  onClick={() => setParams({ ...params, page: params.page! + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Detail Modal */}
      {selectedPayoutId && (
        <PayoutDetailModal
          payoutId={selectedPayoutId}
          open={!!selectedPayoutId}
          onOpenChange={(open) => !open && setSelectedPayoutId(null)}
        />
      )}
    </div>
  );
}
