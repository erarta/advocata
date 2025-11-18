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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefundStatusBadge } from './refund-status-badge';
import {
  useRefund,
  useApproveRefund,
  useRejectRefund,
  useRequestRefundInfo,
} from '@/lib/hooks/use-financial';
import {
  Loader2,
  CreditCard,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
import { RefundReason } from '@/lib/types/financial';

interface RefundDetailModalProps {
  refundId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const refundReasonLabels: Record<RefundReason, string> = {
  'no-show-lawyer': 'Lawyer No-Show',
  'poor-service': 'Poor Service Quality',
  'technical-issues': 'Technical Issues',
  'duplicate-payment': 'Duplicate Payment',
  'lawyer-cancelled': 'Lawyer Cancelled',
  other: 'Other',
};

export function RefundDetailModal({
  refundId,
  open,
  onOpenChange,
}: RefundDetailModalProps) {
  const { data: refund, isLoading } = useRefund(refundId);
  const approveRefundMutation = useApproveRefund();
  const rejectRefundMutation = useRejectRefund();
  const requestInfoMutation = useRequestRefundInfo();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false);

  const [refundAmount, setRefundAmount] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleApprove = () => {
    const amount = parseFloat(refundAmount) || refund?.refund_amount_requested || 0;
    approveRefundMutation.mutate(
      { id: refundId, amount },
      {
        onSuccess: () => {
          setShowApproveDialog(false);
          onOpenChange(false);
        },
      }
    );
  };

  const handleReject = () => {
    rejectRefundMutation.mutate(
      { id: refundId, reason: rejectReason },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          onOpenChange(false);
        },
      }
    );
  };

  const handleRequestInfo = () => {
    requestInfoMutation.mutate(
      { id: refundId, message: infoMessage },
      {
        onSuccess: () => {
          setShowRequestInfoDialog(false);
          setInfoMessage('');
        },
      }
    );
  };

  if (isLoading || !refund) {
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

  const canTakeAction = refund.status === 'pending-review';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
            <DialogDescription>Review and process refund request</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* User Information */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={refund.user_avatar} />
                    <AvatarFallback>
                      {refund.user_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{refund.user_name}</div>
                    <div className="text-sm text-muted-foreground">
                      User ID: {refund.user_id}
                    </div>
                  </div>
                </div>
                <RefundStatusBadge status={refund.status} />
              </div>

              <Separator />

              {/* Refund Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Request Date
                  </div>
                  <div className="text-sm">
                    {format(new Date(refund.request_date), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Consultation ID
                  </div>
                  <div className="text-sm font-mono">{refund.consultation_id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Original Amount
                  </div>
                  <div className="text-sm">
                    {refund.original_amount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Refund Requested
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {refund.refund_amount_requested.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Reason
                  </div>
                  <Badge variant="outline">{refundReasonLabels[refund.reason]}</Badge>
                  {refund.reason_details && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {refund.reason_details}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Consultation Details */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Consultation Details</div>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Date & Time</div>
                      <div className="font-medium">
                        {format(
                          new Date(refund.consultation.date),
                          'MMM d, yyyy HH:mm'
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lawyer</div>
                      <div className="font-medium">
                        {refund.consultation.lawyer_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <Badge variant="outline" className="capitalize">
                        {refund.consultation.type}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div>{refund.consultation.duration} minutes</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <Badge variant="outline" className="capitalize">
                        {refund.consultation.status}
                      </Badge>
                    </div>
                    {refund.consultation.rating && (
                      <div>
                        <div className="text-muted-foreground">Rating</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {refund.consultation.rating}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {refund.consultation.review && (
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">
                        User Review
                      </div>
                      <div className="text-sm italic">
                        "{refund.consultation.review}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Payment Information</div>
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-mono">{refund.payment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span>{refund.payment.amount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">
                      {refund.payment.method.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono">
                      {refund.payment.transaction_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span>
                      {format(new Date(refund.payment.date), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Statement */}
              {refund.user_statement && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      User Statement
                    </div>
                    <div className="rounded-lg border p-4 text-sm bg-muted/50">
                      {refund.user_statement}
                    </div>
                  </div>
                </>
              )}

              {/* Lawyer Statement */}
              {refund.lawyer_statement && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Lawyer Statement
                    </div>
                    <div className="rounded-lg border p-4 text-sm bg-muted/50">
                      {refund.lawyer_statement}
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes (if processed) */}
              {refund.admin_notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Admin Notes</div>
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      {refund.admin_notes}
                    </div>
                    {refund.processed_at && (
                      <div className="text-xs text-muted-foreground">
                        Processed on{' '}
                        {format(new Date(refund.processed_at), 'MMM d, yyyy HH:mm')}{' '}
                        by {refund.admin_name}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {canTakeAction && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRequestInfoDialog(true)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Request Info
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => setShowApproveDialog(true)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Approve the refund request. You can approve the full amount or a
              partial refund.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount (₽)</Label>
              <Input
                id="refund-amount"
                type="number"
                placeholder={refund.refund_amount_requested.toString()}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={refund.original_amount}
              />
              <div className="text-xs text-muted-foreground">
                Original amount: {refund.original_amount.toLocaleString('ru-RU')} ₽
                <br />
                Requested: {refund.refund_amount_requested.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={approveRefundMutation.isPending}
            >
              {approveRefundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Approve Refund'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this refund request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Textarea
                id="reject-reason"
                placeholder="Explain why this refund is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejectRefundMutation.isPending || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectRefundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reject Refund'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Info Dialog */}
      <AlertDialog
        open={showRequestInfoDialog}
        onOpenChange={setShowRequestInfoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request More Information</AlertDialogTitle>
            <AlertDialogDescription>
              Send a message to the user requesting additional information about
              this refund.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="info-message">Message</Label>
              <Textarea
                id="info-message"
                placeholder="What additional information do you need?"
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestInfo}
              disabled={requestInfoMutation.isPending || !infoMessage.trim()}
            >
              {requestInfoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
