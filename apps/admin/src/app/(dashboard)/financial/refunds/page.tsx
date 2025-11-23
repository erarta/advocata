'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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
import { RefundStatusBadge } from '@/components/financial/refund-status-badge';
import { RefundDetailModal } from '@/components/financial/refund-detail-modal';
import {
  usePendingRefunds,
  useRefundStats,
  useExportRefunds,
} from '@/lib/hooks/use-financial';
import { RefundParams, RefundStatus, RefundReason } from '@/lib/types/financial';
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Search,
  Download,
  Eye,
} from 'lucide-react';

const refundReasonLabels: Record<RefundReason, string> = {
  'no-show-lawyer': 'Lawyer No-Show',
  'poor-service': 'Poor Service Quality',
  'technical-issues': 'Technical Issues',
  'duplicate-payment': 'Duplicate Payment',
  'lawyer-cancelled': 'Lawyer Cancelled',
  other: 'Other',
};

export default function RefundsPage() {
  const [params, setParams] = useState<RefundParams>({
    page: 1,
    limit: 20,
    sort_by: 'date',
    sort_order: 'desc',
  });

  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  const { data: refundsData, isLoading } = usePendingRefunds(params);
  const { data: stats, isLoading: statsLoading } = useRefundStats();
  const exportMutation = useExportRefunds();

  const handleExport = () => {
    exportMutation.mutate(params);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refunds Management</h1>
        <p className="text-muted-foreground">
          Review and process refund requests from users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.pending_amount.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pending_count} requests
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.processed_today_amount.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.processed_today_count} refunds
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.refund_rate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of total revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Refund</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.average_refund_amount.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted-foreground">Per request</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>
                Review and approve or reject refund requests
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
                placeholder="Search by user name or consultation ID..."
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
                  status: value === 'all' ? undefined : (value as RefundStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending-review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={params.reason || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  reason: value === 'all' ? undefined : (value as RefundReason),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                {Object.entries(refundReasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Consultation ID</TableHead>
                  <TableHead className="text-right">Original Amount</TableHead>
                  <TableHead className="text-right">Refund Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : refundsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No refund requests found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  refundsData?.data.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="text-sm">
                        {format(new Date(refund.request_date), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={refund.user_avatar} />
                            <AvatarFallback>
                              {refund.user_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{refund.user_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {refund.consultation_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {refund.original_amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {refund.refund_amount_requested.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {refundReasonLabels[refund.reason]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RefundStatusBadge status={refund.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRefundId(refund.id)}
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
          {refundsData && refundsData.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(params.page! - 1) * params.limit! + 1} to{' '}
                {Math.min(
                  params.page! * params.limit!,
                  refundsData.pagination.total
                )}{' '}
                of {refundsData.pagination.total} refunds
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
                  disabled={params.page === refundsData.pagination.total_pages}
                  onClick={() => setParams({ ...params, page: params.page! + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Detail Modal */}
      {selectedRefundId && (
        <RefundDetailModal
          refundId={selectedRefundId}
          open={!!selectedRefundId}
          onOpenChange={(open) => !open && setSelectedRefundId(null)}
        />
      )}
    </div>
  );
}
