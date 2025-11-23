'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PayoutStatusBadge } from './payout-status-badge';
import { usePayout, useProcessPayout } from '@/lib/hooks/use-financial';
import { Loader2, CreditCard, Calendar, Hash, User } from 'lucide-react';
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

interface PayoutDetailModalProps {
  payoutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayoutDetailModal({
  payoutId,
  open,
  onOpenChange,
}: PayoutDetailModalProps) {
  const { data: payout, isLoading } = usePayout(payoutId);
  const processPayoutMutation = useProcessPayout();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleProcessPayout = () => {
    processPayoutMutation.mutate(payoutId, {
      onSuccess: () => {
        setShowConfirmDialog(false);
        onOpenChange(false);
      },
    });
  };

  if (isLoading || !payout) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const canProcess = payout.status === 'pending';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              Complete information about this payout
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Lawyer Information */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={payout.lawyer_avatar} />
                    <AvatarFallback>
                      {payout.lawyer_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{payout.lawyer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {payout.lawyer_id}
                    </div>
                  </div>
                </div>
                <PayoutStatusBadge status={payout.status} />
              </div>

              <Separator />

              {/* Payout Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Period
                  </div>
                  <div className="text-sm">
                    {format(new Date(payout.period_start), 'MMM d, yyyy')} -{' '}
                    {format(new Date(payout.period_end), 'MMM d, yyyy')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Due Date
                  </div>
                  <div className="text-sm">
                    {format(new Date(payout.due_date), 'MMM d, yyyy')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Payment Method
                  </div>
                  <div className="text-sm capitalize">
                    {payout.payment_method.replace('-', ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Consultations
                  </div>
                  <div className="text-sm">{payout.consultations_count}</div>
                </div>
              </div>

              <Separator />

              {/* Amount Breakdown */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Amount Breakdown</div>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Consultations Amount
                    </span>
                    <span>
                      {(payout.amount + payout.commission_deducted).toLocaleString(
                        'ru-RU'
                      )}{' '}
                      ₽
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Platform Commission
                    </span>
                    <span className="text-red-600">
                      -{payout.commission_deducted.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Net Payout</span>
                    <span className="text-lg">
                      {payout.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              {payout.bank_details && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Bank Details</div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Account Holder</div>
                          <div className="font-medium">
                            {payout.bank_details.account_holder}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Bank Name</div>
                          <div className="font-medium">
                            {payout.bank_details.bank_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Account Number</div>
                          <div className="font-mono">
                            {payout.bank_details.account_number}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">BIK</div>
                          <div className="font-mono">{payout.bank_details.bik}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Consultations List */}
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Consultations ({payout.consultations.length})
                </div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payout.consultations.map((consultation) => (
                        <TableRow key={consultation.id}>
                          <TableCell className="font-mono text-xs">
                            {consultation.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(consultation.date), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {consultation.client_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {consultation.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {consultation.amount.toLocaleString('ru-RU')} ₽
                          </TableCell>
                          <TableCell className="text-right text-sm text-red-600">
                            -{consultation.commission.toLocaleString('ru-RU')} ₽
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {consultation.net_amount.toLocaleString('ru-RU')} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Transaction Info (if processed) */}
              {payout.transaction_id && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Transaction Information</div>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono">{payout.transaction_id}</span>
                      </div>
                      {payout.processed_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processed At</span>
                          <span>
                            {format(
                              new Date(payout.processed_at),
                              'MMM d, yyyy HH:mm'
                            )}
                          </span>
                        </div>
                      )}
                      {payout.processed_by && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processed By</span>
                          <span>{payout.processed_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Notes (if any) */}
              {payout.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Notes</div>
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      {payout.notes}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canProcess && (
              <Button onClick={() => setShowConfirmDialog(true)}>
                Process Payout
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payout Processing</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to process a payout of{' '}
              <strong>{payout.amount.toLocaleString('ru-RU')} ₽</strong> to{' '}
              <strong>{payout.lawyer_name}</strong>.
              <br />
              <br />
              This action will initiate the actual payment transfer and cannot be
              undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessPayout}
              disabled={processPayoutMutation.isPending}
            >
              {processPayoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Process'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
