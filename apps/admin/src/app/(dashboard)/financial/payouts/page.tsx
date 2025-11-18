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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { PayoutStatusBadge } from '@/components/financial/payout-status-badge';
import { PayoutDetailModal } from '@/components/financial/payout-detail-modal';
import {
  usePendingPayouts,
  usePayoutStats,
  useProcessMultiplePayouts,
  useExportPayouts,
} from '@/lib/hooks/use-financial';
import { PayoutParams, PayoutStatus, PaymentMethod } from '@/lib/types/financial';
import {
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  Download,
  Eye,
  CreditCard,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PayoutsPage() {
  const [params, setParams] = useState<PayoutParams>({
    page: 1,
    limit: 20,
    sort_by: 'due_date',
    sort_order: 'asc',
  });

  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [showBulkProcessDialog, setShowBulkProcessDialog] = useState(false);

  const { data: payoutsData, isLoading } = usePendingPayouts(params);
  const { data: stats, isLoading: statsLoading } = usePayoutStats();
  const processMultipleMutation = useProcessMultiplePayouts();
  const exportMutation = useExportPayouts();

  const handleSelectAll = (checked: boolean) => {
    if (checked && payoutsData) {
      setSelectedPayouts(payoutsData.data.map((p) => p.id));
    } else {
      setSelectedPayouts([]);
    }
  };

  const handleSelectPayout = (payoutId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayouts([...selectedPayouts, payoutId]);
    } else {
      setSelectedPayouts(selectedPayouts.filter((id) => id !== payoutId));
    }
  };

  const handleBulkProcess = () => {
    processMultipleMutation.mutate(selectedPayouts, {
      onSuccess: () => {
        setSelectedPayouts([]);
        setShowBulkProcessDialog(false);
      },
    });
  };

  const handleExport = () => {
    exportMutation.mutate(params);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">
          Manage lawyer payouts and commission distributions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
                  {stats?.pending_count} payouts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processed This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.processed_this_month_amount.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.processed_this_month_count} payouts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.next_payout_date
                    ? format(new Date(stats.next_payout_date), 'MMM d')
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.total_paid_all_time.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                {selectedPayouts.length > 0
                  ? `${selectedPayouts.length} payout(s) selected`
                  : 'Review and process pending payouts'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedPayouts.length > 0 && (
                <Button onClick={() => setShowBulkProcessDialog(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Process Selected ({selectedPayouts.length})
                </Button>
              )}
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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

            <Select
              value={params.sort_by || 'due_date'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  sort_by: value as 'amount' | 'due_date' | 'lawyer_name',
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="lawyer_name">Lawyer Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payouts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        payoutsData?.data.length > 0 &&
                        selectedPayouts.length === payoutsData?.data.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Lawyer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-center">Consultations</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Due Date</TableHead>
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
                        No pending payouts found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutsData?.data.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayouts.includes(payout.id)}
                          onCheckedChange={(checked) =>
                            handleSelectPayout(payout.id, checked as boolean)
                          }
                        />
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
                      <TableCell className="text-sm">
                        {format(new Date(payout.due_date), 'MMM d, yyyy')}
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

      {/* Bulk Process Confirmation Dialog */}
      <AlertDialog
        open={showBulkProcessDialog}
        onOpenChange={setShowBulkProcessDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Payout Processing</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to process <strong>{selectedPayouts.length}</strong>{' '}
              payouts. This action will initiate actual payment transfers and cannot
              be undone.
              <br />
              <br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkProcess}
              disabled={processMultipleMutation.isPending}
            >
              {processMultipleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Process All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
