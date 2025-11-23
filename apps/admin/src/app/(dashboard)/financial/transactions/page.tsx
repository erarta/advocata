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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionTypeBadge } from '@/components/financial/transaction-type-badge';
import {
  useTransactions,
  useRetryTransaction,
  useDownloadReceipt,
  useExportTransactions,
} from '@/lib/hooks/use-financial';
import {
  TransactionParams,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from '@/lib/types/financial';
import {
  Search,
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function TransactionsPage() {
  const [params, setParams] = useState<TransactionParams>({
    page: 1,
    limit: 100,
    sort_by: 'date',
    sort_order: 'desc',
  });

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(
    null
  );

  const { data: transactionsData, isLoading } = useTransactions(params);
  const retryMutation = useRetryTransaction();
  const downloadReceiptMutation = useDownloadReceipt();
  const exportMutation = useExportTransactions();

  const handleRetry = (transactionId: string) => {
    retryMutation.mutate(transactionId);
  };

  const handleDownloadReceipt = (transactionId: string) => {
    downloadReceiptMutation.mutate(transactionId);
  };

  const handleExport = () => {
    exportMutation.mutate(params);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const config = {
      success: {
        label: 'Success',
        icon: CheckCircle2,
        className: 'border-green-500 text-green-700 bg-green-50',
      },
      failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'border-red-500 text-red-700 bg-red-50',
      },
      pending: {
        label: 'Pending',
        icon: Clock,
        className: 'border-yellow-500 text-yellow-700 bg-yellow-50',
      },
    };

    const { label, icon: Icon, className } = config[status];

    return (
      <Badge variant="outline" className={className}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction Logs</h1>
        <p className="text-muted-foreground">
          View all financial transactions across the platform
        </p>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete log of all financial activities
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-5 gap-2">
            <div className="relative col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, or lawyer..."
                className="pl-8"
                value={params.search || ''}
                onChange={(e) =>
                  setParams({ ...params, search: e.target.value, page: 1 })
                }
              />
            </div>

            <Select
              value={params.type || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  type: value === 'all' ? undefined : (value as TransactionType),
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={params.status || 'all'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  status: value === 'all' ? undefined : (value as TransactionStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={params.date_from || ''}
              onChange={(e) =>
                setParams({ ...params, date_from: e.target.value, page: 1 })
              }
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            <Input
              type="date"
              placeholder="To date"
              value={params.date_to || ''}
              onChange={(e) =>
                setParams({ ...params, date_to: e.target.value, page: 1 })
              }
            />

            <Input
              type="number"
              placeholder="Min amount"
              value={params.amount_min || ''}
              onChange={(e) =>
                setParams({
                  ...params,
                  amount_min: e.target.value ? parseFloat(e.target.value) : undefined,
                  page: 1,
                })
              }
            />

            <Input
              type="number"
              placeholder="Max amount"
              value={params.amount_max || ''}
              onChange={(e) =>
                setParams({
                  ...params,
                  amount_max: e.target.value ? parseFloat(e.target.value) : undefined,
                  page: 1,
                })
              }
            />

            <Select
              value={params.sort_by || 'date'}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  sort_by: value as 'date' | 'amount',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setParams({
                  page: 1,
                  limit: 100,
                  sort_by: 'date',
                  sort_order: 'desc',
                })
              }
            >
              Reset Filters
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User/Lawyer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactionsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No transactions found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionsData?.data.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <TransactionTypeBadge type={transaction.type} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {transaction.related_entity_name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="capitalize text-sm">
                        {transaction.payment_method.replace('-', ' ')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.transaction_id.slice(0, 16)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransactionId(transaction.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {transaction.status === 'success' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(transaction.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {transaction.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetry(transaction.id)}
                              disabled={retryMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {transactionsData && transactionsData.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(params.page! - 1) * params.limit! + 1} to{' '}
                {Math.min(
                  params.page! * params.limit!,
                  transactionsData.pagination.total
                )}{' '}
                of {transactionsData.pagination.total} transactions
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
                  disabled={
                    params.page === transactionsData.pagination.total_pages
                  }
                  onClick={() => setParams({ ...params, page: params.page! + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          open={!!selectedTransactionId}
          onOpenChange={(open) => !open && setSelectedTransactionId(null)}
        />
      )}
    </div>
  );
}

// Transaction Detail Modal Component
function TransactionDetailModal({
  transactionId,
  open,
  onOpenChange,
}: {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // This would use useTransaction hook in a real implementation
  // For now, it's a placeholder

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              Transaction details for ID: {transactionId}
              <br />
              <span className="text-xs">
                (Full implementation would show complete transaction metadata)
              </span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
